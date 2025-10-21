# MVP eCommerce Backend

A complete, production-ready eCommerce backend built with Node.js, Express.js, and MongoDB. This backend includes all essential features for an eCommerce platform with JWT authentication, role-based access control, image uploads, and is ready for deployment on Render.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - User registration and login with JWT
  - Email verification system with secure tokens
  - Beautiful HTML verification pages
  - Password hashing with bcrypt
  - Role-based access control (Admin/User)
  - Protected routes and middleware
  - Resend verification email functionality

- **Category Management**
  - CRUD operations for categories
  - Admin-only category management
  - Slug generation for SEO-friendly URLs

- **Product Management**
  - Complete product CRUD operations
  - Multiple image upload (up to 5 images per product)
  - Featured products functionality
  - Advanced search and filtering
  - Stock management
  - Product categorization

- **Shopping Cart System**
  - Add/remove items from cart
  - Update quantities
  - Cart persistence per user
  - Stock validation

- **Wishlist System**
  - Add/remove products to wishlist
  - User-specific wishlists
  - Wishlist status checking

- **Order Management**
  - Place orders from cart
  - Order status tracking
  - Admin order management
  - Payment integration ready

### Technical Features
- **Email Service**
  - Professional HTML email templates
  - Email verification with secure tokens (24-hour expiry)
  - Welcome emails after verification
  - Asynchronous email sending for better performance
  - Gmail SMTP integration
  - Beautiful responsive email designs

- **Security**
  - JWT authentication
  - Email verification required before login
  - Password hashing with bcrypt
  - Secure token generation with crypto
  - Input validation with Joi
  - Error handling middleware
  - CORS configuration

- **Database**
  - MongoDB with Mongoose ODM
  - Optimized queries with indexing
  - Data validation and sanitization

- **File Upload**
  - Multer for image uploads
  - File type validation
  - File size limits (5MB per file)
  - Organized file storage

- **API Features**
  - RESTful API design
  - Pagination support
  - Advanced filtering and sorting
  - Comprehensive error handling
  - Request validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with Gmail SMTP
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: bcryptjs, crypto, CORS
- **Environment**: dotenv

## 📁 Project Structure

```
src/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── categoryController.js # Category management
│   ├── productController.js  # Product management
│   ├── cartController.js     # Cart operations
│   ├── wishlistController.js # Wishlist operations
│   └── orderController.js    # Order management
├── models/
│   ├── User.js              # User schema
│   ├── Category.js          # Category schema
│   ├── Product.js           # Product schema
│   ├── Cart.js              # Cart schema
│   ├── Wishlist.js          # Wishlist schema
│   └── Order.js             # Order schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── category.js          # Category routes
│   ├── product.js           # Product routes
│   ├── cart.js              # Cart routes
│   ├── wishlist.js          # Wishlist routes
│   └── order.js             # Order routes
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── upload.js            # File upload middleware
│   └── validation.js        # Input validation
├── services/
│   ├── emailService.js      # Email sending service
│   └── emailTemplates.js    # HTML email templates
├── uploads/                 # File upload directory
├── app.js                   # Express app configuration
└── server.js                # Main server file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mvp-ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/mvp-ecommerce
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   ```
   
   **Note**: To use Gmail SMTP:
   - Enable 2-Step Verification in your Google Account
   - Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use the generated app password in `EMAIL_PASS`

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📧 Email Verification Flow

The application includes a complete email verification system:

1. **User Registration**
   - User registers with name, email, and password
   - System generates a secure verification token (expires in 24 hours)
   - Verification email is sent automatically
   - User receives a professional HTML email with verification link

2. **Email Verification**
   - User clicks "Verify My Account" button in email
   - System validates the token
   - Shows a beautiful success page with animated checkmark
   - Sends a welcome email after successful verification

3. **Login Protection**
   - Users cannot login without verifying their email
   - Clear error message if attempting to login with unverified email

4. **Resend Verification**
   - Users can request a new verification email if needed
   - Previous token is invalidated
   - New token is generated with fresh 24-hour expiry

**Email Templates Include**:
- 📧 Verification Email - Professional design with clear CTA button
- 🎉 Welcome Email - Friendly welcome message after verification
- 🔄 Resend Verification - For users who need a new link

**Verification Pages Include**:
- ✅ Success Page - Animated checkmark with personalized message
- ❌ Error Page - Clear error messages for invalid tokens
- ⏰ Expired Page - Instructions for requesting new verification link

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user (sends verification email) | Public |
| GET | `/api/auth/verify` | Verify email with token | Public |
| POST | `/api/auth/resend` | Resend verification email | Public |
| POST | `/api/auth/login` | User login (requires verified email) | Public |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/profile` | Get user profile | Private |
| GET | `/api/auth/users` | Get all users | Admin |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Category Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/:id` | Get single category | Public |
| GET | `/api/categories/:id/products` | Get category products | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/:id/related` | Get related products | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Cart Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/cart` | Get user cart | Private |
| GET | `/api/cart/count` | Get cart item count | Private |
| POST | `/api/cart/items` | Add item to cart | Private |
| PUT | `/api/cart/items/:productId` | Update cart item | Private |
| DELETE | `/api/cart/items/:productId` | Remove item from cart | Private |
| DELETE | `/api/cart` | Clear cart | Private |

### Wishlist Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/wishlist` | Get user wishlist | Private |
| GET | `/api/wishlist/count` | Get wishlist count | Private |
| GET | `/api/wishlist/check/:productId` | Check wishlist status | Private |
| POST | `/api/wishlist` | Add to wishlist | Private |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Private |
| DELETE | `/api/wishlist` | Clear wishlist | Private |

### Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders/my-orders` | Get user orders | Private |
| GET | `/api/orders/:id` | Get single order | Private |
| PUT | `/api/orders/:id/pay` | Update order to paid | Private |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| PUT | `/api/orders/:id/deliver` | Update order to delivered | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

## 🔧 API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```
**Response**: User will receive a verification email with a link.

### Verify Email
Users click the verification link in their email:
```
http://localhost:5000/api/auth/verify?token=YOUR_VERIFICATION_TOKEN
```
**Response**: Beautiful HTML page confirming email verification.

### Resend Verification Email
```bash
curl -X POST http://localhost:5000/api/auth/resend \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Login (requires verified email)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Add product to cart (with authentication)
```bash
curl -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

### Create a product (Admin only)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "name=Sample Product" \
  -F "description=This is a sample product" \
  -F "price=99.99" \
  -F "stock=100" \
  -F "category=CATEGORY_ID" \
  -F "images=@product1.jpg" \
  -F "images=@product2.jpg"
```

## 🚀 Deployment on Render

### Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster (free tier available)

2. **Configure Database Access**
   - Go to "Database Access" in Atlas dashboard
   - Create a database user with read/write permissions
   - Note down username and password

3. **Configure Network Access**
   - Go to "Network Access" in Atlas dashboard
   - Add IP address `0.0.0.0/0` to allow access from anywhere
   - Or add Render's IP ranges

4. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name

### Step 2: Push Code to GitHub

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MVP eCommerce backend"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Don't initialize with README (since we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy on Render

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose your repository

3. **Configure Service**
   - **Name**: `mvp-ecommerce-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose free plan

4. **Environment Variables**
   Add the following environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_for_production
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=your-gmail-app-specific-password
   ```
   
   **Email Setup for Production**:
   - Use a Gmail account with 2-Step Verification enabled
   - Generate an App Password from [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Add the App Password to `EMAIL_PASS` (not your regular Gmail password)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Wait for deployment to complete

### Step 4: Verify Deployment

1. **Check Health**
   ```bash
   curl https://your-app-name.onrender.com/api/health
   ```

2. **Test API Endpoints**
   Use the deployed URL in your API calls:
   ```bash
   curl -X POST https://your-app-name.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
   ```

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **JWT Secret**: Use a strong, random secret for production
- **Email Verification**: Users must verify email before login
- **Secure Tokens**: Email verification tokens are hashed and expire after 24 hours
- **Password Hashing**: All passwords are hashed using bcrypt
- **Email Security**: Use Gmail App Passwords, not regular passwords
- **Input Validation**: All inputs are validated using Joi
- **CORS**: Configured for cross-origin requests
- **File Upload**: Validates file types and sizes
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mvp-ecommerce` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_key` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail App Password (not regular password) | `your_app_specific_password` |

## 🧪 Testing

You can test the API using:
- **Postman**: Import the API collection
- **curl**: Command line testing
- **Thunder Client**: VS Code extension
- **Insomnia**: API testing tool

## 📈 Performance Optimizations

- Database indexing for faster queries
- Pagination for large datasets
- Image optimization and compression
- Efficient query patterns
- Connection pooling
- Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/your-repo/issues) page
2. Create a new issue with detailed description
3. Provide error logs and steps to reproduce

## 🎯 Future Enhancements

### Completed ✅
- [x] Email verification system
- [x] Email notifications (verification & welcome emails)
- [x] Beautiful HTML email templates
- [x] Responsive verification pages

### In Progress / Planned 🚀
- [ ] Product reviews and ratings
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Password reset via email
- [ ] Order confirmation emails
- [ ] Advanced search with Elasticsearch
- [ ] Redis caching for better performance
- [ ] API rate limiting
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app API optimization
- [ ] Social media authentication (Google, Facebook)
- [ ] Newsletter subscription
- [ ] Push notifications

---

**Happy Coding! 🚀**
