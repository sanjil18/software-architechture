backend / src / models / FineCategory.js
const mongoose = require('mongoose');

const fineCategorySchema = new mongoose.Schema(
    {
        categoryId: { type: String, required: true, unique: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        points: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('FineCategory', fineCategorySchema);