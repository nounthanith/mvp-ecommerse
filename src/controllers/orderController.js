const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Validate all cart items and check stock
  const orderItems = [];
  let totalPrice = 0;

  for (const item of cart.items) {
    const product = item.product;
    
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product ${product ? product.name : 'Unknown'} is no longer available`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for ${product.name}. Available: ${product.stock}`
      });
    }

    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: item.price,
      image: product.images[0] || ''
    });
  }

  // Calculate tax and shipping (you can customize these calculations)
  const taxPrice = totalPrice * 0.1; // 10% tax
  const shippingPrice = totalPrice > 100 ? 0 : 10; // Free shipping over $100
  const finalTotal = totalPrice + taxPrice + shippingPrice;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: totalPrice,
    taxPrice,
    shippingPrice,
    totalPrice: finalTotal
  });

  // Update product stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user.id })
    .populate('orderItems.product', 'name slug images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name slug images');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns the order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this order'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.isPaid) {
    return res.status(400).json({
      success: false,
      message: 'Order is already paid'
    });
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this order'
    });
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';

  if (req.body.paymentResult) {
    order.paymentResult = req.body.paymentResult;
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order updated to paid',
    data: updatedOrder
  });
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.isDelivered) {
    return res.status(400).json({
      success: false,
      message: 'Order is already delivered'
    });
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'delivered';

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order updated to delivered',
    data: updatedOrder
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status } = req.query;

  let filter = {};
  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name slug images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Valid statuses: pending, processing, shipped, delivered, cancelled'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  order.status = status;

  // Update related fields based on status
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrder
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
  updateOrderStatus
};
