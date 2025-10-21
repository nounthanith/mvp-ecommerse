const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images slug stock');

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Filter out products that are no longer active or out of stock
  const validItems = cart.items.filter(item =>
    item.product &&
    item.product.stock > 0 &&
    item.quantity <= item.product.stock
  );

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  res.json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Find the product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check stock availability
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`
    });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} more items. Only ${product.stock - cart.items[existingItemIndex].quantity} more available`
      });
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images slug stock');

  res.status(201).json({
    success: true,
    message: 'Item added to cart successfully',
    data: populatedCart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  // Check product stock
  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product ? product.stock : 0} items available in stock`
    });
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price;

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images slug stock');

  res.json({
    success: true,
    message: 'Cart item updated successfully',
    data: populatedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images slug stock');

  res.json({
    success: true,
    message: 'Item removed from cart successfully',
    data: populatedCart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  cart.items = [];
  await cart.save();

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart
  });
});

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  const count = cart ? cart.totalItems : 0;

  res.json({
    success: true,
    data: { count }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};
