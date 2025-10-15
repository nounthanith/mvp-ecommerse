const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { validate, addToCartValidation, updateCartValidation } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/items', validate(addToCartValidation), addToCart);
router.put('/items/:productId', validate(updateCartValidation), updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
