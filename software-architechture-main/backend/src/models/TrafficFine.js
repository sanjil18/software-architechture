const mongoose = require('mongoose');

const trafficFineSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // e.g., "TF-2024-001234"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FineCategory',
      required: true,
    },
    categoryId: {
      type: String, // Stored for quick lookup without populate
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    officerPhone: {
      type: String,
      required: true,
    },
    // Driver information
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverLicense: {
      type: String,
      required: true,
      uppercase: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'bus', 'truck', 'three-wheeler', 'other'],
      default: 'car',
    },
    // Fine details
    amount: {
      type: Number,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    violation: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'mobile', null],
      default: null,
    },
    paymentReference: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient searches
trafficFineSchema.index({ referenceNumber: 1, categoryId: 1 });
trafficFineSchema.index({ status: 1, district: 1 });
trafficFineSchema.index({ officer: 1 });

module.exports = mongoose.model('TrafficFine', trafficFineSchema);
