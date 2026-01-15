# Backend API

Express.js backend with clean architecture, TypeScript, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Passport.js** - OAuth authentication
- **Joi** - Request validation
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values.

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, JWT, etc.)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (auth, validation, logging, error-handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   │   └── v1/          # API version 1 routes
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── validators/      # Request validation schemas (Joi)
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── .env.example         # Environment variables template
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Architecture

- **Controllers**: Handle HTTP requests/responses (thin layer)
- **Services**: Business logic (separated from controllers)
- **Models**: Database schemas (Mongoose)
- **Routes**: API endpoint definitions with versioning
- **Middleware**: Authentication, validation, logging, error handling
- **Validators**: Request payload validation using Joi

## API Structure

All API routes are prefixed with `/api/v1`

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback
- `GET /facebook` - Facebook OAuth login
- `GET /facebook/callback` - Facebook OAuth callback

### Posts (`/api/v1/posts`)
- `GET /` - Get all posts (paginated)
- `GET /:id` - Get post by ID or slug
- `GET /author/:authorId` - Get posts by author
- `POST /` - Create post (authenticated)
- `PUT /:id` - Update post (authenticated, owner/admin)
- `DELETE /:id` - Delete post (authenticated, owner/admin)

### Comments (`/api/v1/comments`)
- `GET /post/:postId` - Get comments by post
- `GET /author/:authorId` - Get comments by author
- `GET /:id` - Get comment by ID
- `POST /` - Create comment (authenticated)
- `PUT /:id` - Update comment (authenticated, owner/admin)
- `DELETE /:id` - Delete comment (authenticated, owner/admin)

### Admin (`/api/v1/admin`)
- `GET /dashboard` - Get dashboard statistics
- `POST /create-admin` - Create admin user
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /posts` - Get all posts including deleted
- `GET /comments` - Get all comments including deleted

### Health Check
- `GET /api/v1/health` - Health check endpoint

## Environment Variables

See `.env.example` for all required environment variables.

## Project Status

✅ Project setup and configuration  
✅ Express server with middleware  
✅ MongoDB connection  
✅ Error handling  
✅ TypeScript configuration  
✅ Testing setup (180 tests passing)  
✅ Authentication (JWT + OAuth Google/Facebook)  
✅ User management  
✅ Post management (CRUD with soft delete, slug generation)  
✅ Comment system (CRUD with soft delete)  
✅ Admin panel (Dashboard, user/post/comment management)  
✅ Rate limiting  
✅ Request validation (Joi)  
✅ Activity logging  
✅ Pagination support
