backend/src/controllers/fineController.js
const { v4: uuidv4 } = require('uuid');
const TrafficFine  = require('../models/TrafficFine');
const FineCategory = require('../models/FineCategory');
const { sendPaymentConfirmationSMS } = require('../services/smsService');

const generateRef = () =>
  `TF-${new Date().getFullYear()}-${uuidv4().replace(/-/g,'').substring(0,8).toUpperCase()}`;

const issueFine = async (req, res, next) => {
  try {
    const { categoryId, driverName, driverLicense, vehicleNumber, vehicleType,
            location, violation, district, nicNumber, driverPhone, customAmount, badgeNumber } = req.body;
    const category = await FineCategory.findOne({ categoryId: categoryId.toUpperCase(), isActive:true });
    if (!category) return res.status(404).json({ success:false, message:'Fine category not found.' });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const fine = await TrafficFine.create({
      referenceNumber: generateRef(), category: category._id, categoryId: category.categoryId,
      officer: req.user._id, officerPhone: req.user.phone,
      driverName, driverLicense, vehicleNumber, vehicleType,
      amount: customAmount && Number(customAmount) > 0 ? Number(customAmount) : category.amount,
      district: district || req.user.district,
      location, violation, dueDate,
      ...(nicNumber && { nicNumber }), ...(driverPhone && { driverPhone }), ...(badgeNumber && { badgeNumber }),
    });
    await fine.populate('category','name description amount');
    res.status(201).json({ success:true, message:'Fine issued successfully.', fine });
  } catch (err) { next(err); }
};

const updateFine = async (req, res, next) => {
  try {
    const fine = await TrafficFine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success:false, message:'Fine not found.' });
    if (fine.status === 'paid') return res.status(400).json({ success:false, message:'Cannot edit a paid fine.' });
    const allowed = ['driverName','driverLicense','vehicleNumber','vehicleType','location','violation','district','amount','nicNumber','driverPhone','badgeNumber','status'];
    allowed.forEach(f => { if (req.body[f] !== undefined) fine[f] = req.body[f]; });
    if (req.body.categoryId) {
      const cat = await FineCategory.findOne({ categoryId: req.body.categoryId.toUpperCase() });
      if (cat) { fine.category = cat._id; fine.categoryId = cat.categoryId; if (!req.body.amount) fine.amount = cat.amount; }
    }
    await fine.save();
    await fine.populate('category','name description amount');
    res.status(200).json({ success:true, message:'Fine updated successfully.', fine });
  } catch (err) { next(err); }
};

const lookupFine = async (req, res, next) => {
  try {
    const { referenceNumber, categoryId } = req.query;
    if (!referenceNumber || !categoryId) return res.status(400).json({ success:false, message:'Reference number and category ID required.' });
    const fine = await TrafficFine.findOne({ referenceNumber: referenceNumber.toUpperCase(), categoryId: categoryId.toUpperCase() }).populate('category','name description amount');
    if (!fine) return res.status(404).json({ success:false, message:'Fine not found. Check your details.' });
    if (fine.status === 'paid') return res.status(400).json({ success:false, message:'This fine has already been paid.', fine:{ referenceNumber:fine.referenceNumber, status:fine.status, paidAt:fine.paidAt } });
    res.status(200).json({ success:true, fine:{ id:fine._id, referenceNumber:fine.referenceNumber, category:fine.category, categoryId:fine.categoryId, driverName:fine.driverName, driverLicense:fine.driverLicense, vehicleNumber:fine.vehicleNumber, vehicleType:fine.vehicleType, amount:fine.amount, district:fine.district, location:fine.location, violation:fine.violation, status:fine.status, issuedAt:fine.issuedAt, dueDate:fine.dueDate } });
  } catch (err) { next(err); }
};

const payFine = async (req, res, next) => {
  try {
    const fine = await TrafficFine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success:false, message:'Fine not found.' });
    if (fine.status==='paid') return res.status(400).json({ success:false, message:'Already paid.' });
    if (fine.status==='cancelled') return res.status(400).json({ success:false, message:'Fine cancelled.' });
    fine.status           = 'paid';
    fine.paymentMethod    = req.body.paymentMethod || 'online';
    fine.paymentReference = req.body.paymentReference || `PAY-${uuidv4().substring(0,8).toUpperCase()}`;
    fine.paidAt           = new Date();
    await fine.save();
    await fine.populate('category','name description amount');
    const sms = await sendPaymentConfirmationSMS(fine.officerPhone, { referenceNumber:fine.referenceNumber, driverName:fine.driverName, vehicleNumber:fine.vehicleNumber, amount:fine.amount, paidAt:fine.paidAt });
    fine.smsSent = sms.success;
    await fine.save();
    res.status(200).json({ success:true, message:'Fine paid. SMS sent to officer.', fine:{ referenceNumber:fine.referenceNumber, amount:fine.amount, status:fine.status, paymentReference:fine.paymentReference, paidAt:fine.paidAt, smsSent:fine.smsSent } });
  } catch (err) { next(err); }
};

const getMyFines = async (req, res, next) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const q = { officer:req.user._id };
    if (status) q.status = status;
    const fines = await TrafficFine.find(q).populate('category','name amount').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await TrafficFine.countDocuments(q);
    res.json({ success:true, count:fines.length, total, pages:Math.ceil(total/limit), page:Number(page), fines });
  } catch (err) { next(err); }
};

const getAllFines = async (req, res, next) => {
  try {
    const { status, district, categoryId, page=1, limit=20 } = req.query;
    const q = {};
    if (status)     q.status     = status;
    if (district)   q.district   = district;
    if (categoryId) q.categoryId = categoryId.toUpperCase();
    const fines = await TrafficFine.find(q).populate('category','name amount').populate('officer','name badgeNumber district').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await TrafficFine.countDocuments(q);
    res.json({ success:true, count:fines.length, total, pages:Math.ceil(total/limit), page:Number(page), fines });
  } catch (err) { next(err); }
};

const getAnalytics = async (req, res, next) => {
  try {
    const [totalFines, paidFines, pendingFines, overdueFines] = await Promise.all([
      TrafficFine.countDocuments(), TrafficFine.countDocuments({ status:'paid' }),
      TrafficFine.countDocuments({ status:'pending' }), TrafficFine.countDocuments({ status:'overdue' }),
    ]);
    const totalRevenue   = await TrafficFine.aggregate([{ $match:{status:'paid'} },{ $group:{_id:null,total:{$sum:'$amount'}} }]);
    const districtStats  = await TrafficFine.aggregate([{ $match:{status:'paid'} },{ $group:{_id:'$district',totalAmount:{$sum:'$amount'},count:{$sum:1}} },{ $sort:{totalAmount:-1} }]);
    const categoryStats  = await TrafficFine.aggregate([{ $match:{status:'paid'} },{ $group:{_id:'$categoryId',totalAmount:{$sum:'$amount'},count:{$sum:1}} },{ $sort:{totalAmount:-1} }]);
    const sixMonthsAgo   = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
    const monthlyTrend   = await TrafficFine.aggregate([
      { $match:{ status:'paid', paidAt:{ $gte:sixMonthsAgo } } },
      { $group:{ _id:{ year:{$year:'$paidAt'}, month:{$month:'$paidAt'} }, totalAmount:{$sum:'$amount'}, count:{$sum:1} } },
      { $sort:{ '_id.year':1,'_id.month':1 } },
    ]);
    const paymentMethodStats = await TrafficFine.aggregate([
      { $match:{status:'paid'} },
      { $group:{ _id:'$paymentMethod', count:{$sum:1}, totalAmount:{$sum:'$amount'} } },
    ]);
    res.json({ success:true, analytics:{ overview:{ totalFines,paidFines,pendingFines,overdueFines, totalRevenue:totalRevenue[0]?.total||0, collectionRate: totalFines>0?((paidFines/totalFines)*100).toFixed(1):0 }, districtStats, categoryStats, monthlyTrend, paymentMethodStats } });
  } catch (err) { next(err); }
};

module.exports = { issueFine, updateFine, lookupFine, payFine, getMyFines, getAllFines, getAnalytics };