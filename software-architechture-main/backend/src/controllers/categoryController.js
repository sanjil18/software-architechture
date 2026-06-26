const FineCategory = require('../models/FineCategory');

// @desc    Get all fine categories (public)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await FineCategory.find({ isActive: true }).sort('categoryId');
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fine category (admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const category = await FineCategory.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fine category (admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await FineCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory };
