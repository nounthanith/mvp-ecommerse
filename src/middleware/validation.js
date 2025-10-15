const Joi = require('joi');

// User validation schemas
const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Category validation schemas
const categoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).required(),
  isActive: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', 'on', 'off', '').custom((value, helpers) => {
      if (value === '' || value === 'off') return false;
      if (value === 'on' || value === 'true') return true;
      return value;
    })
  ).optional()
});

// Product validation schemas
const productValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value, helpers) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return helpers.error('number.base');
      }
      return num;
    })
  ).required(),
  originalPrice: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value, helpers) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return helpers.error('number.base');
      }
      return num;
    })
  ).optional(),
  stock: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().pattern(/^\d+$/).custom((value, helpers) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return helpers.error('number.base');
      }
      return num;
    })
  ).required(),
  category: Joi.string().required(),
  featured: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', 'on', 'off', '').custom((value, helpers) => {
      if (value === '' || value === 'off') return false;
      if (value === 'on' || value === 'true') return true;
      return value;
    })
  ).optional(),
  isActive: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', 'on', 'off', '').custom((value, helpers) => {
      if (value === '' || value === 'off') return false;
      if (value === 'on' || value === 'true') return true;
      return value;
    })
  ).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().custom((value, helpers) => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return value;
    })
  ).optional(),
  weight: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value, helpers) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return helpers.error('number.base');
      }
      return num;
    })
  ).optional(),
  dimensions: Joi.object({
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional()
  }).optional()
});

// Cart validation schemas
const addToCartValidation = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).max(10).required()
});

const updateCartValidation = Joi.object({
  quantity: Joi.number().min(1).max(10).required()
});

// Order validation schemas
const shippingAddressValidation = Joi.object({
  fullName: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required()
});

const createOrderValidation = Joi.object({
  shippingAddress: shippingAddressValidation.required(),
  paymentMethod: Joi.string().valid('paypal', 'stripe', 'cash_on_delivery').required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  categoryValidation,
  productValidation,
  addToCartValidation,
  updateCartValidation,
  createOrderValidation
};
