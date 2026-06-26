const mongoose = require('mongoose');

const fineCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // e.g., "TF001", "TF002"
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    points: {
      type: Number,
      default: 0, // Demerit points
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FineCategory', fineCategorySchema);
