const { v4: uuidv4 } = require('uuid');
const TrafficFine = require('../models/TrafficFine');
const FineCategory = require('../models/FineCategory');
const { sendPaymentConfirmationSMS } = require('../services/smsService');

// Generate unique reference number
const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const unique = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `TF-${year}-${unique}`;
};

// @desc    Issue a new traffic fine (by officer)
// @route   POST /api/fines
// @access  Private/Officer
const issueFine = async (req, res, next) => {
  try {
    const {
      categoryId,
      driverName,
      driverLicense,
      vehicleNumber,
      vehicleType,
      location,
      violation,
    } = req.body;

    // Find fine category
    const category = await FineCategory.findOne({
      categoryId: categoryId.toUpperCase(),
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Fine category not found.',
      });
    }

    // Due date is 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const fine = await TrafficFine.create({
      referenceNumber: generateReferenceNumber(),
      category: category._id,
      categoryId: category.categoryId,
      officer: req.user._id,
      officerPhone: req.user.phone,
      driverName,
      driverLicense,
      vehicleNumber,
      vehicleType,
      amount: category.amount,
      district: req.user.district,
      location,
      violation,
      dueDate,
    });

    await fine.populate('category', 'name description amount');

    res.status(201).json({
      success: true,
      message: 'Traffic fine issued successfully.',
      fine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a traffic fine (admin or officer)
// @route   PUT /api/fines/:id
// @access  Private/Admin/Officer
const updateFine = async (req, res, next) => {
  try {
    const fine = await TrafficFine.findById(req.params.id);
    if (!fine) return res.status(404).json({ success: false, message: 'Fine not found.' });
    if (fine.status === 'paid') return res.status(400).json({ success: false, message: 'Cannot edit a paid fine.' });

    const allowed = ['driverName', 'driverLicense', 'vehicleNumber', 'vehicleType', 'location',
      'violation', 'district', 'amount', 'nicNumber', 'driverPhone', 'badgeNumber', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) fine[field] = req.body[field];
    });

    if (req.body.categoryId) {
      const cat = await FineCategory.findOne({ categoryId: req.body.categoryId.toUpperCase() });
      if (cat) {
        fine.category = cat._id;
        fine.categoryId = cat.categoryId;
        if (!req.body.amount) fine.amount = cat.amount;
      }
    }

    await fine.save();
    await fine.populate('category', 'name description amount');
    res.status(200).json({ success: true, message: 'Fine updated successfully.', fine });
  } catch (error) {
    next(error);
  }
};

// @desc    Look up a fine by reference number and category ID (public)
// @route   GET /api/fines/lookup
// @access  Public
const lookupFine = async (req, res, next) => {
  try {
    const { referenceNumber, categoryId } = req.query;

    if (!referenceNumber || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Reference number and category ID are required.',
      });
    }

    const fine = await TrafficFine.findOne({
      referenceNumber: referenceNumber.toUpperCase(),
      categoryId: categoryId.toUpperCase(),
    }).populate('category', 'name description amount');

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found. Please check your reference number and category ID.',
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fine has already been paid.',
        fine: {
          referenceNumber: fine.referenceNumber,
          status: fine.status,
          paidAt: fine.paidAt,
        },
      });
    }

    // Return fine details (hide sensitive officer info)
    res.status(200).json({
      success: true,
      fine: {
        id: fine._id,
        referenceNumber: fine.referenceNumber,
        category: fine.category,
        categoryId: fine.categoryId,
        driverName: fine.driverName,
        driverLicense: fine.driverLicense,
        vehicleNumber: fine.vehicleNumber,
        vehicleType: fine.vehicleType,
        amount: fine.amount,
        district: fine.district,
        location: fine.location,
        violation: fine.violation,
        status: fine.status,
        issuedAt: fine.issuedAt,
        dueDate: fine.dueDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay a traffic fine (public - used by both web and mobile)
// @route   POST /api/fines/:id/pay
// @access  Public
const payFine = async (req, res, next) => {
  try {
    const { paymentMethod, paymentReference } = req.body;
    const { id } = req.params;

    const fine = await TrafficFine.findById(id);

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found.',
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fine has already been paid.',
      });
    }

    if (fine.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This fine has been cancelled.',
      });
    }

    // Update fine to paid
    fine.status = 'paid';
    fine.paymentMethod = paymentMethod || 'online';
    fine.paymentReference = paymentReference || `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    fine.paidAt = new Date();

    await fine.save();
    await fine.populate('category', 'name description amount');

    // Send SMS to officer
    const smsResult = await sendPaymentConfirmationSMS(fine.officerPhone, {
      referenceNumber: fine.referenceNumber,
      driverName: fine.driverName,
      vehicleNumber: fine.vehicleNumber,
      amount: fine.amount,
      paidAt: fine.paidAt,
    });

    fine.smsSent = smsResult.success;
    await fine.save();

    res.status(200).json({
      success: true,
      message: 'Fine paid successfully. SMS notification sent to officer.',
      fine: {
        referenceNumber: fine.referenceNumber,
        amount: fine.amount,
        status: fine.status,
        paymentReference: fine.paymentReference,
        paidAt: fine.paidAt,
        smsSent: fine.smsSent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fines issued by logged-in officer
// @route   GET /api/fines/my-fines
// @access  Private/Officer
const getMyFines = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { officer: req.user._id };

    if (status) query.status = status;

    const fines = await TrafficFine.find(query)
      .populate('category', 'name amount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await TrafficFine.countDocuments(query);

    res.status(200).json({
      success: true,
      count: fines.length,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      fines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fines (Admin only)
// @route   GET /api/fines
// @access  Private/Admin
const getAllFines = async (req, res, next) => {
  try {
    const { status, district, categoryId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (district) query.district = district;
    if (categoryId) query.categoryId = categoryId.toUpperCase();

    const fines = await TrafficFine.find(query)
      .populate('category', 'name amount')
      .populate('officer', 'name badgeNumber district')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await TrafficFine.countDocuments(query);

    res.status(200).json({
      success: true,
      count: fines.length,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      fines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics/statistics
// @route   GET /api/fines/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    // Overview totals
    const totalFines = await TrafficFine.countDocuments();
    const paidFines = await TrafficFine.countDocuments({ status: 'paid' });
    const pendingFines = await TrafficFine.countDocuments({ status: 'pending' });
    const overdueFines = await TrafficFine.countDocuments({ status: 'overdue' });

    const totalRevenue = await TrafficFine.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // District-wise collection
    const districtStats = await TrafficFine.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$district',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Category-wise collection
    const categoryStats = await TrafficFine.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await TrafficFine.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Payment method breakdown
    const paymentMethodStats = await TrafficFine.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalFines,
          paidFines,
          pendingFines,
          overdueFines,
          totalRevenue: totalRevenue[0]?.total || 0,
          collectionRate: totalFines > 0 ? ((paidFines / totalFines) * 100).toFixed(1) : 0,
        },
        districtStats,
        categoryStats,
        monthlyTrend,
        paymentMethodStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueFine,
  updateFine,
  lookupFine,
  payFine,
  getMyFines,
  getAllFines,
  getAnalytics,
};
