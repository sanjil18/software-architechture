const express = require('express');
const { issueFine, updateFine, lookupFine, payFine, getMyFines, getAllFines, getAnalytics } = require('../controllers/fineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/lookup',     lookupFine);
router.post('/:id/pay',   payFine);
router.post('/',           protect, authorize('officer','admin'), issueFine);
router.get('/my-fines',    protect, authorize('officer'),         getMyFines);
router.get('/analytics',   protect, authorize('admin'),           getAnalytics);
router.get('/',            protect, authorize('admin'),           getAllFines);
router.put('/:id',         protect, authorize('admin','officer'), updateFine);

module.exports = router;