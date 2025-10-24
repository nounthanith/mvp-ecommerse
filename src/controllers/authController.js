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
  const { name, email, password ,role} = req.body;

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
    password,
    role: role || 'user'
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
    subject: '🎉 Welcome to My Shop - Verify Your Email',
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
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Error - MVP Ecommerce</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 50px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            color: #e53e3e;
            font-size: 28px;
            margin-bottom: 15px;
          }
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Verification Failed</h1>
          <p>Verification token is missing or invalid. Please check your email for the correct verification link.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Hash the token to compare with stored hashed token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with this token and check if it's not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Error - MVP Ecommerce</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 50px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            color: #e53e3e;
            font-size: 28px;
            margin-bottom: 15px;
          }
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">⏰</div>
          <h1>Link Expired</h1>
          <p>This verification link is invalid or has expired. Please request a new verification email.</p>
        </div>
      </body>
      </html>
    `);
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

  // Send beautiful HTML success page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified - MVP Ecommerce</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #10b981;
          stroke-miterlimit: 10;
          margin: 0 auto 20px;
          box-shadow: inset 0px 0px 0px #10b981;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #10b981;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 30px #10b981; }
        }
        h1 {
          color: #1a202c;
          font-size: 32px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .info-box {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
          border-radius: 5px;
        }
        .info-box strong {
          color: #667eea;
          display: block;
          margin-bottom: 5px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        <h1>Email Verified! 🎉</h1>
        <p>Congratulations, <strong>${user.name}</strong>! Your email has been successfully verified.</p>
        <div class="info-box">
          <strong>✓ What's Next?</strong>
          <p style="margin: 0; color: #4a5568;">You can now log in to your account and start shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `);
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
