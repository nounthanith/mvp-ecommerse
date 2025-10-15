const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper function to convert image filenames to full URLs
const convertImagesToUrls = (product) => {
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(image => {
      // If it's already a full URL, return as is
      if (image.startsWith('http')) {
        return image;
      }
      // Otherwise, construct the full URL
      return `/uploads/${image}`;
    });
  }
  return product;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const { search, category, featured, minPrice, maxPrice, sort } = req.query;

  // Build filter object
  let filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true';
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Build sort object
  let sortObj = { createdAt: -1 };
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'name_asc':
        sortObj = { name: 1 };
        break;
      case 'name_desc':
        sortObj = { name: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  // Convert image filenames to full URLs
  const productsWithUrls = products.map(convertImagesToUrls);

  res.json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      search,
      category,
      featured,
      minPrice,
      maxPrice,
      sort
    },
    data: productsWithUrls
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug description');

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: convertImagesToUrls(product)
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    originalPrice,
    stock,
    category,
    featured,
    isActive,
    tags,
    weight,
    dimensions
  } = req.body;

  // Basic validation
  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required and must be at least 2 characters'
    });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Product description is required and must be at least 10 characters'
    });
  }

  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid price is required'
    });
  }

  if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid stock quantity is required'
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Get uploaded images
  const images = req.files ? req.files.map(file => file.filename) : [];

  if (images.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one product image is required'
    });
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    stock: parseInt(stock),
    category,
    images,
    isActive: isActive === 'true' || isActive === true || isActive === 'on',
    featured: featured === 'true' || featured === true || featured === 'on',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
    weight: weight ? parseFloat(weight) : undefined,
    dimensions,
    averageRating: 0, // Default to 0 for new products
    numReviews: 0 // Default to 0 for new products
  });

  const populatedProduct = await Product.findById(product._id)
    .populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: convertImagesToUrls(populatedProduct)
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const {
    name,
    description,
    price,
    originalPrice,
    stock,
    category,
    featured,
    tags,
    weight,
    dimensions
  } = req.body;

  // Check if category exists
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
  }

  // Handle new images if uploaded
  let images = product.images;
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.filename);
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      price,
      originalPrice,
      stock,
      category,
      images,
      featured: featured !== undefined ? (featured === 'true' || featured === true) : product.featured,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : product.tags,
      weight,
      dimensions
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('category', 'name slug');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: convertImagesToUrls(product)
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ 
    featured: true, 
    isActive: true 
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    count: products.length,
    data: products.map(convertImagesToUrls)
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 4;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts.map(convertImagesToUrls)
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts
};
