const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate('products', 'name price images slug stock averageRating category');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  // Filter out products that are no longer active
  const validProducts = wishlist.products.filter(product => product && product.isActive);

  if (validProducts.length !== wishlist.products.length) {
    wishlist.products = validProducts.map(product => product._id);
    await wishlist.save();

    // Repopulate the wishlist
    wishlist = await Wishlist.findById(wishlist._id)
      .populate('products', 'name price images slug stock averageRating category');
  }

  res.json({
    success: true,
    count: wishlist.products.length,
    data: wishlist
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Find the product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  // Check if product already exists in wishlist
  const isInWishlist = wishlist.products.includes(productId);

  if (isInWishlist) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist'
    });
  }

  // Add product to wishlist
  wishlist.products.push(productId);
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id)
    .populate('products', 'name price images slug stock averageRating category');

  res.status(201).json({
    success: true,
    message: 'Product added to wishlist successfully',
    data: populatedWishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  // Check if product exists in wishlist
  const productIndex = wishlist.products.indexOf(productId);
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found in wishlist'
    });
  }

  // Remove product from wishlist
  wishlist.products.splice(productIndex, 1);
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id)
    .populate('products', 'name price images slug stock averageRating category');

  res.json({
    success: true,
    message: 'Product removed from wishlist successfully',
    data: populatedWishlist
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found'
    });
  }

  wishlist.products = [];
  await wishlist.save();

  res.json({
    success: true,
    message: 'Wishlist cleared successfully',
    data: wishlist
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  const isInWishlist = wishlist ? wishlist.products.includes(productId) : false;

  res.json({
    success: true,
    data: { isInWishlist }
  });
});

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
const getWishlistCount = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  const count = wishlist ? wishlist.products.length : 0;

  res.json({
    success: true,
    data: { count }
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
  getWishlistCount
};
