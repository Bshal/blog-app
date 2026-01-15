# MERN Stack Blog Application

<div align="center">

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**A full-stack blog application built with MongoDB, Express.js, Next.js v16, and Node.js**

[Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Frontend Pages](#-frontend-pages)
- [Security Features](#-security-features)
- [Key Technologies](#-key-technologies)
- [Demo Video](#-demo-video)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This is a full-stack blog application built using the MERN stack (MongoDB, Express.js, Next.js v16, Node.js) with comprehensive features including user authentication, post management, comment system, and an admin panel. The application follows clean architecture principles with proper separation of concerns, service layer pattern, and comprehensive testing.

### Key Highlights

- ✅ **Complete Authentication System** - JWT tokens with refresh token rotation, OAuth 2.0 (Google & Facebook)
- ✅ **Role-Based Access Control** - Admin and User roles with API-level enforcement
- ✅ **Full CRUD Operations** - Posts and Comments with proper permissions
- ✅ **Admin Panel** - Comprehensive dashboard for managing users, posts, and comments
- ✅ **Clean Architecture** - Service layer pattern, modular design, separation of concerns
- ✅ **Comprehensive Testing** - Unit tests with Jest for all service layers
- ✅ **Production Ready** - Error handling, validation, rate limiting, security best practices

---

## 🚀 Features

### Authentication & Authorization

- ✅ **User Registration & Login** - Secure email/password authentication
- ✅ **JWT Tokens** - Access tokens (15m) and refresh tokens (7d) with rotation
- ✅ **OAuth 2.0 Social Login** - Google and Facebook authentication
- ✅ **Role-Based Access Control** - Admin and User roles with middleware enforcement
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Secure Password Hashing** - bcrypt with cost factor 12

### Post Management

- ✅ **Full CRUD Operations** - Create, read, update, and delete posts
- ✅ **URL-Friendly Slugs** - Auto-generated from post titles
- ✅ **Soft Deletes** - Posts can be soft-deleted and restored
- ✅ **Image Support** - Local and external image URLs
- ✅ **Pagination** - Efficient handling of large datasets
- ✅ **Author Attribution** - Posts linked to user accounts

### Comments System

- ✅ **Full CRUD Operations** - Create, read, update, and delete comments
- ✅ **Ownership-Based Permissions** - Users manage their own comments
- ✅ **Admin Override** - Admins can manage all comments
- ✅ **Comment Count Tracking** - Real-time comment counts on posts
- ✅ **Post Association** - Comments linked to posts and authors

### Admin Panel

- ✅ **Dashboard Statistics** - Total users, posts, and comments
- ✅ **User Management** - View, edit, delete, and create admin users
- ✅ **Post Management** - View all posts including deleted ones
- ✅ **Comment Management** - View all comments including deleted ones
- ✅ **Access Control** - Restricted to admin users only

### Additional Features

- ✅ **Activity Logging** - Tracks login, post creation/deletion, etc.
- ✅ **Request Validation** - Joi validation for all API endpoints
- ✅ **Centralized Error Handling** - Consistent error responses
- ✅ **Toast Notifications** - User-friendly feedback system
- ✅ **Responsive Design** - Mobile-friendly UI with shadcn UI components
- ✅ **TypeScript** - Full type safety across the application

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **MongoDB** - Local installation or MongoDB Atlas account
- **npm** or **yarn** - Package manager
- **Git** - Version control

---

## 🛠️ Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd blog-app
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies (using npm or yarn)
npm install
# or
yarn install

# Create .env file (copy from .env.example if available)
# See Environment Setup section for required variables
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blog-app
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-app

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - Google (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# OAuth - Facebook (Optional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### OAuth Setup (Optional)

To enable OAuth login:

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/api/v1/auth/google/callback`

2. **Facebook OAuth:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Set valid OAuth redirect URI: `http://localhost:5000/api/v1/auth/facebook/callback`

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
# or
yarn dev
```
Backend API will be available at `http://localhost:5000`

**Terminal 2 - Start Frontend Server:**
```bash
cd frontend
npm run dev
```
Frontend application will be available at `http://localhost:3000`

### Production Mode

**Build and Start Backend:**
```bash
cd backend
npm run build
npm start
# or
yarn build
yarn start
```

**Build and Start Frontend:**
```bash
cd frontend
npm run build
npm start
```

---

## 🗄️ Database Setup

### Seed Database with Sample Data

To populate the database with sample users, posts, and comments:

```bash
cd backend
npm run seed
# or
yarn seed
```

This will create:
- **6 sample users** (password: `password123`)
- **10 sample posts** with various content
- **Sample comments** on posts

### Test User Credentials

After seeding, you can log in with any of these users:

| Email | Password |
|-------|----------|
| `sarah.johnson@example.com` | `password123` |
| `michael.chen@example.com` | `password123` |
| `emily.rodriguez@example.com` | `password123` |
| `david.kim@example.com` | `password123` |
| `jessica.williams@example.com` | `password123` |
| `james.anderson@example.com` | `password123` |

### Create Admin User

To create an admin user, you can use the script:

```bash
cd backend
npm run create-admin
# or
yarn create-admin
```

Or use the admin panel (if logged in as admin) at `/admin/create-admin`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access-token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access-token>
```

#### OAuth Login
- **Google:** `GET /auth/google`
- **Facebook:** `GET /auth/facebook`

### Post Endpoints

#### Get All Posts
```http
GET /posts?page=1&limit=10&sort=createdAt&order=desc
```

#### Get Post by ID or Slug
```http
GET /posts/:id
# or
GET /posts/:slug
```

#### Get Posts by Author
```http
GET /posts/author/:authorId?page=1&limit=10
```

#### Create Post (Authenticated)
```http
POST /posts
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "My Post Title",
  "content": "Post content here...",
  "imageUrl": "cover-1.webp"  // Optional
}
```

#### Update Post (Owner/Admin)
```http
PUT /posts/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Post (Owner/Admin)
```http
DELETE /posts/:id
Authorization: Bearer <access-token>
```

### Comment Endpoints

#### Get Comments by Post
```http
GET /comments/post/:postId?page=1&limit=10
```

#### Create Comment (Authenticated)
```http
POST /comments
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "content": "My comment text",
  "postId": "post-id-here"
}
```

#### Update Comment (Owner/Admin)
```http
PUT /comments/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

#### Delete Comment (Owner/Admin)
```http
DELETE /comments/:id
Authorization: Bearer <access-token>
```

### Admin Endpoints (Admin Only)

#### Get Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "totalPosts": 25,
    "totalComments": 50
  }
}
```

#### Get All Users
```http
GET /admin/users?page=1&limit=10
Authorization: Bearer <access-token>
```

#### Create Admin User
```http
POST /admin/create-admin
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}
```

For complete API documentation, see the [Backend README](./backend/README.md).

---

## 🧪 Testing

### Backend Tests

The backend includes comprehensive unit tests for all service layers:

```bash
cd backend

# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Generate coverage report
npm run test:coverage
# or
yarn test:coverage
```

### Test Coverage

- ✅ **Authentication Service** - Registration, login, logout, token refresh
- ✅ **Post Service** - CRUD operations, soft deletes, ownership validation
- ✅ **Comment Service** - CRUD operations, permissions
- ✅ **Admin Service** - Dashboard stats, user/post/comment management

For detailed testing documentation, see [Backend Tests README](./backend/tests/README.md).

---

## 📁 Project Structure

```
blog-app/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── database.ts     # MongoDB connection
│   │   │   ├── index.ts        # App configuration
│   │   │   └── passport.ts     # OAuth strategies
│   │   ├── controllers/        # Request handlers (thin layer)
│   │   │   ├── auth.controller.ts
│   │   │   ├── post.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/           # Business logic layer
│   │   │   ├── auth/           # Authentication services
│   │   │   ├── post/           # Post services
│   │   │   ├── comment/        # Comment services
│   │   │   └── admin/          # Admin services
│   │   ├── models/             # Mongoose models
│   │   │   ├── User.model.ts
│   │   │   ├── Post.model.ts
│   │   │   └── Comment.model.ts
│   │   ├── routes/             # API routes
│   │   │   └── v1/             # API version 1
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth/           # Authentication & authorization
│   │   │   ├── validation/     # Request validation
│   │   │   ├── logging/        # Activity logging
│   │   │   └── error-handling/ # Error handling
│   │   ├── validators/         # Joi validation schemas
│   │   └── utils/              # Utility functions
│   └── tests/                  # Test files
│       ├── unit/               # Unit tests
│       └── setup/              # Test configuration
│
├── frontend/                   # Next.js v16 application
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/      # User dashboard
│   │   ├── admin/            # Admin panel pages
│   │   ├── posts/            # Post pages
│   │   └── layout.tsx        # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn UI components
│   │   ├── auth/             # Authentication components
│   │   ├── posts/            # Post-related components
│   │   └── comments/         # Comment components
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts        # Authentication hook
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Helper functions
│   ├── types/                # TypeScript types
│   └── public/               # Static assets
│       └── posts/            # Post images
│
└── README.md                  # This file
```

---

## 🎨 Frontend Pages

### Public Pages
- **`/`** - Home page with featured/recent blog posts
- **`/posts`** - All posts listing with pagination
- **`/posts/[slug]`** - Individual post detail page with comments
- **`/posts/author/[authorId]`** - Posts by specific author
- **`/auth/login`** - User login page with OAuth options
- **`/auth/register`** - User registration page with OAuth options
- **`/auth/callback`** - OAuth callback handler

### Authenticated Pages
- **`/dashboard`** - User dashboard with recent posts, comments, and statistics
- **`/posts/create`** - Create new blog post
- **`/posts/[slug]/edit`** - Edit existing post (owner/admin only)

### Admin Pages
- **`/admin/dashboard`** - Admin dashboard with platform statistics
- **`/admin/users`** - User management (view, edit, delete, create admin)
- **`/admin/posts`** - Post management (view all including deleted)
- **`/admin/comments`** - Comment management (view all including deleted)
- **`/admin/create-admin`** - Create new admin user

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with cost factor 12
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Refresh Token Rotation** - Enhanced security with token rotation
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **API-Level RBAC** - Role-based access control enforced at API level
- ✅ **Request Validation** - Joi validation for all inputs
- ✅ **CORS Configuration** - Proper cross-origin resource sharing setup
- ✅ **Environment Variables** - Sensitive data stored in .env files
- ✅ **SQL Injection Prevention** - Using Mongoose ODM
- ✅ **XSS Protection** - Input sanitization and validation

---

## 🎯 Key Technologies

### Backend Stack
- **Node.js** >= 18.0.0 - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication tokens
- **Passport.js** - OAuth authentication strategies
- **Joi** - Schema validation library
- **bcryptjs** - Password hashing
- **Jest** - Testing framework
- **express-rate-limit** - Rate limiting middleware

### Frontend Stack
- **Next.js v16** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn UI** - Accessible component library
- **Lucide React** - Icon library
- **Context API** - State management for authentication

---

## 📝 Available Scripts

### Backend Scripts

**Using npm:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run seed         # Seed database with sample data
npm run create-admin # Create admin user
npm run lint         # Run ESLint
```

**Using yarn:**
```bash
yarn dev             # Start development server with hot reload
yarn build           # Build for production
yarn start           # Start production server
yarn test            # Run all tests
yarn test:watch      # Run tests in watch mode
yarn test:coverage   # Generate test coverage report
yarn seed            # Seed database with sample data
yarn create-admin    # Create admin user
yarn lint            # Run ESLint
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```



[⬆ Back to Top](#mern-stack-blog-application)

</div>
