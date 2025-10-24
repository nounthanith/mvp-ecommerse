const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const categories = await Category.find({ isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments({ isActive: true });

  res.json({
    success: true,
    count: categories.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  
  // Get image path from uploaded file (handle any field name)
  const image = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

  // Basic validation
  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required and must be at least 2 characters'
    });
  }

  if (description && description.trim().length < 0) {
    return res.status(400).json({
      success: false,
      message: 'Category description must be at least 0 characters'
    });
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }

  const category = await Category.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    image,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true || isActive === 'on') : true
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  
  // Get image path from uploaded file if provided (handle any field name)
  const image = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : req.body.image;

  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if name is being changed and if new name already exists
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
  }

  // Prepare update data
  const updateData = { name, description, image };
  
  // Handle isActive field if provided
  if (isActive !== undefined) {
    updateData.isActive = isActive === 'true' || isActive === true || isActive === 'on';
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({ category: req.params.id });
  if (productsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${productsCount} product(s) associated with it.`
    });
  }

  // Delete associated image file if it exists
  if (category.image) {
    const imagePath = path.join(__dirname, '..', 'uploads', category.image.replace('/uploads/', ''));
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted category image: ${imagePath}`);
      }
    } catch (error) {
      console.error(`Error deleting category image: ${error.message}`);
      // Don't fail the deletion if image deletion fails
    }
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category with products
// @route   GET /api/categories/:id/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const products = await Product.find({
    category: req.params.id,
    isActive: true
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments({
    category: req.params.id,
    isActive: true
  });

  res.json({
    success: true,
    data: {
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        slug: category.slug
      },
      products: {
        count: products.length,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        data: products
      }
    }
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts
};
