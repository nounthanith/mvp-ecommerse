// Modern email templates for the application

const getEmailVerificationTemplate = (userName, verificationUrl, isResend = false) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px 0 rgba(102, 126, 234, 0.6);
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #9ca3af;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .security-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .security-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-title::before {
            content: "🔒";
            margin-right: 8px;
        }
        
        .security-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.5;
        }
        
        .footer {
            padding: 30px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-logo {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
        }
        
        .copyright {
            font-size: 12px;
            color: #9ca3af;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .footer {
                padding: 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">PICH STORE</div>
            <div class="tagline">Your Premium Shopping Experience</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="greeting">Welcome, ${userName}! 👋</h1>
            
            <p class="message">
                ${isResend ?
            'We noticed you requested a new verification email. Please verify your email address to complete your account setup and start enjoying our premium services.' :
            'Thank you for joining MVP Ecommerce! To complete your registration and start shopping with us, please verify your email address.'
        }
            </p>
            
            <div class="button-container">
                <a href="${verificationUrl}" class="verify-button">
                    ${isResend ? 'Verify Email Address' : 'Verify My Account'}
                </a>
            </div>
            
            <div class="security-notice">
                <div class="security-title">Security Notice</div>
                <div class="security-text">
                    This verification link will expire in 24 hours for your security. If you didn't create an account with us, please ignore this email. Never share this link with anyone.
                </div>
            </div>
            
            <div class="divider"></div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">PICH STORE</div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                Bringing you the best shopping experience with premium products and exceptional service.
            </p>
            
            <div class="social-links">
                <a href="#" class="social-link">Help Center</a>
                <a href="#" class="social-link">Privacy Policy</a>
                <a href="#" class="social-link">Terms of Service</a>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} PICH STORE. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

const getWelcomeTemplate = (userName) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PICH STORE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .feature {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background-color: #f8fafc;
        }
        
        .feature-icon {
            font-size: 32px;
            margin-bottom: 15px;
        }
        
        .feature-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .feature-desc {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
        }
        
        .footer {
            padding: 30px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="success-icon">🎉</div>
            <div class="logo">PICH STORE</div>
            <div style="opacity: 0.9; font-weight: 300;">Welcome to the family!</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="greeting">Welcome, ${userName}! 🎉</h1>
            
            <p class="message">
                Your email has been successfully verified! You're now ready to explore our amazing collection of products and enjoy a seamless shopping experience.
            </p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🛍️</div>
                    <div class="feature-title">Premium Products</div>
                    <div class="feature-desc">Discover our curated selection of high-quality items</div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🚚</div>
                    <div class="feature-title">Fast Delivery</div>
                    <div class="feature-desc">Get your orders delivered quickly and safely</div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">💎</div>
                    <div class="feature-title">Exclusive Deals</div>
                    <div class="feature-desc">Access member-only discounts and offers</div>
                </div>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div style="font-weight: 600; color: #374151; margin-bottom: 10px;">PICH STORE</div>
            <div style="color: #6b7280; font-size: 14px;">
                Thank you for choosing us. Happy shopping! 🛒
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
    getEmailVerificationTemplate,
    getWelcomeTemplate
};
