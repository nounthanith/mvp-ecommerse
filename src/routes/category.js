const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { validate, categoryValidation, updateCategoryValidation } = require('../middleware/validation');
const { uploadSingleImage, uploadSingleImageFlexible, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/products', getCategoryProducts);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', uploadSingleImageFlexible, handleUploadError, validate(categoryValidation), createCategory);
router.put('/:id', uploadSingleImageFlexible, handleUploadError, validate(updateCategoryValidation), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
