const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate, createOrderValidation } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.post('/', validate(createOrderValidation), createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/pay', updateOrderToPaid);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/all', getAllOrders);
router.put('/:id/deliver', updateOrderToDelivered);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
