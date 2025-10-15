const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validate, productValidation } = require('../middleware/validation');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', 
  uploadProductImages,
  handleUploadError,
  createProduct
);

router.put('/:id',
  uploadProductImages,
  handleUploadError,
  updateProduct
);

router.delete('/:id', deleteProduct);

module.exports = router;
