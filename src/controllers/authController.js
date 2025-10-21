const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendMail, sendMailAsync } = require('../services/emailService');
const { getEmailVerificationTemplate, getWelcomeTemplate } = require('../services/emailTemplates');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { name, email, password } = req.body;

  console.log('🚀 [REGISTER] Starting registration process:', {
    email: email,
    name: name,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'N/A'
  });

  // Check if user already exists (optimized query)
  console.log('🔍 [REGISTER] Checking if user exists...');
  const existingUser = await User.findOne({ email }).select('_id');
  
  if (existingUser) {
    console.log('❌ [REGISTER] User already exists:', { email, userId: existingUser._id });
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  console.log('✅ [REGISTER] User does not exist, proceeding with creation...');

  // Create user with verification token in one operation
  console.log('👤 [REGISTER] Creating user...');
  const user = await User.create({
    name,
    email,
    password
  });

  console.log('✅ [REGISTER] User created successfully:', {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  // Generate email verification token
  console.log('🔑 [REGISTER] Generating verification token...');
  const verificationToken = user.generateEmailVerificationToken();
  
  // Save token without validation for better performance
  console.log('💾 [REGISTER] Saving verification token...');
  await user.save({ validateBeforeSave: false });

  // Prepare verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${verificationToken}`;

  const responseTime = Date.now() - startTime;
  console.log('📤 [REGISTER] Sending response:', {
    userId: user._id,
    responseTime: `${responseTime}ms`,
    verificationUrl: verificationUrl.substring(0, 50) + '...'
  });

  // Send response immediately (non-blocking)
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification link.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }
  });

  // Send email asynchronously (non-blocking) for better performance
  console.log('📧 [REGISTER] Scheduling verification email...', {
    to: user.email,
    userId: user._id
  });

  sendMailAsync({
    to: user.email,
    subject: '🎉 Welcome to MVP Ecommerce - Verify Your Email',
    html: getEmailVerificationTemplate(user.name, verificationUrl, false)
  });

  const totalTime = Date.now() - startTime;
  console.log('✅ [REGISTER] Registration completed:', {
    userId: user._id,
    email: user.email,
    totalTime: `${totalTime}ms`,
    timestamp: new Date().toISOString()
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    return res.status(401).json({
      success: false,
      message: 'Please verify your email before logging in'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Get user profile (alias for getMe)
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUser = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const users = await User.find().select('-password -emailVerificationToken -emailVerificationExpires');
  
  res.json({
    success: true,
    count: users.length,
    data: { users }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Check if email is already taken by another user
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify
// @access  Public
const verify = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required'
    });
  }

  // Hash the token to compare with stored hashed token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with this token and check if it's not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Update user's email verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email after successful verification
  try {
    await sendMail({
      to: user.email,
      subject: '🎉 Welcome to MVP Ecommerce - Account Verified!',
      html: getWelcomeTemplate(user.name)
    });
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
    // Don't fail the verification if welcome email fails
  }

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend
// @access  Public
const resend = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${verificationToken}`;

  try {
    await sendMail({
      to: user.email,
      subject: '📧 New Verification Link - MVP Ecommerce',
      html: getEmailVerificationTemplate(user.name, verificationUrl, true)
    });

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

module.exports = {
  register,
  verify,
  resend,
  login,
  getMe,
  getProfile,
  getAllUser,
  updateProfile,
  changePassword,
  logout
};
