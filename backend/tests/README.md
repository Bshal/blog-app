# Testing Documentation

This directory contains all test files for the backend API.

## Test Structure

```
tests/
├── setup/              # Test setup and configuration
│   ├── test-setup.ts   # Database connection utilities
│   ├── jest.setup.ts   # Jest global setup
│   └── jest.teardown.ts # Jest global teardown
├── helpers/            # Test helper functions
│   └── test-helpers.ts  # Mock data and utility functions
├── unit/               # Unit tests
│   └── services/       # Service layer tests
└── integration/        # Integration tests (to be added)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- auth.service.test.ts
```

## Test Coverage

### Completed Tests

#### Authentication Service (`tests/unit/services/auth.service.test.ts`)
- ✅ User registration
  - Successful registration
  - Password hashing
  - Duplicate email handling
  - Case-insensitive email validation
  - Refresh token storage
  - JWT token generation

- ✅ User login
  - Successful login
  - Invalid email handling
  - Invalid password handling
  - OAuth user without password
  - Refresh token updates
  - Case-insensitive email

- ✅ Token refresh
  - Successful token refresh
  - Missing token handling
  - Invalid token handling
  - Token mismatch handling
  - Non-existent user handling
  - Expired token handling

- ✅ User logout
  - Successful logout
  - Non-existent user handling
  - Multiple logout calls

#### Post Management Service (`tests/unit/services/post.service.test.ts`)
- ✅ Create post
  - Successful post creation
  - Slug generation
  - Special characters in title
  - Author population
  - Very long title/content
  - Invalid author ID handling

- ✅ Get all posts
  - Default pagination
  - Excluding deleted posts
  - Pagination with different pages/limits
  - Empty results handling
  - Sorting (ascending/descending)
  - Invalid pagination parameters
  - Author population

- ✅ Get post by ID or slug
  - Get by ID
  - Get by slug
  - Non-existent post handling
  - Deleted post handling
  - Author population
  - Invalid ID format

- ✅ Update post
  - Update title
  - Update content
  - Update both fields
  - Non-existent post handling
  - Deleted post handling
  - Ownership validation
  - Admin override
  - Undefined fields handling
  - Author population after update

- ✅ Delete post
  - Soft delete functionality
  - Non-existent post handling
  - Already deleted post handling
  - Ownership validation
  - Admin override
  - Post exclusion from lists after deletion

- ✅ Get posts by author
  - Get posts by specific author
  - Excluding deleted posts
  - Pagination
  - Empty results for author with no posts
  - Non-existent author handling
  - Author population
  - Sorting

#### Comment Management Service (`tests/unit/services/comment.service.test.ts`)
- ✅ Create comment
  - Successful comment creation
  - Author and post population
  - Non-existent post error
  - Deleted post error
  - Very long content handling
  - Minimum length comment
  - Special characters handling
  - Multiple comments on same post

- ✅ Get comments by post
  - Default pagination
  - Excluding deleted comments
  - Pagination with custom page/limit
  - Non-existent post error
  - Empty comments handling
  - Sorting (ascending/descending)
  - Author and post population
  - Deleted post handling

- ✅ Get comment by ID
  - Get comment by ID
  - Author and post population
  - Non-existent comment error
  - Deleted comment error
  - Invalid ObjectId format

- ✅ Update comment
  - Update comment content
  - Non-existent comment error
  - Deleted comment error
  - Ownership validation
  - Admin override
  - Author and post population after update
  - Very long content handling
  - Minimum length comment

- ✅ Delete comment
  - Soft delete functionality
  - Non-existent comment error
  - Already deleted comment error
  - Ownership validation
  - Admin override
  - Comment exclusion from lists after deletion
  - Comment exclusion from getCommentById after deletion

- ✅ Get comments by author
  - Get comments by specific author
  - Excluding deleted comments
  - Pagination handling
  - Empty results for author with no comments
  - Non-existent author ID handling
  - Author and post population
  - Sorting (ascending/descending)
  - Comments across multiple posts

#### Admin Service (`tests/unit/services/admin.service.test.ts`)
- ✅ Dashboard statistics
  - Get dashboard statistics successfully
  - Correct total users count
  - Correct active users count (email verified)
  - Correct total posts count
  - Correct active posts count (excluding deleted)
  - Correct total comments count
  - Correct active comments count (excluding deleted)
  - Empty database handling

- ✅ Get all users
  - Default pagination
  - Exclude password and refreshToken
  - Pagination with custom page/limit
  - Empty results handling
  - Sorting (ascending/descending)
  - Include all users regardless of role
  - Include all users regardless of email verification

- ✅ Get user by ID
  - Get user by ID successfully
  - Exclude password and refreshToken
  - Non-existent user error
  - Invalid ObjectId format
  - Return all fields except sensitive data

- ✅ Update user
  - Update user name
  - Update user email
  - Update user role
  - Update email verification status
  - Update multiple fields at once
  - Non-existent user error
  - Undefined fields handling
  - Role change from user to admin
  - Role change from admin to user

- ✅ Delete user
  - Hard delete functionality
  - Soft delete functionality (currently hard delete)
  - Non-existent user error
  - Invalid ObjectId format
  - User removal from getAllUsers after deletion

- ✅ Get all posts (admin)
  - Get all posts including deleted
  - Include deleted posts
  - Pagination handling
  - Author population
  - Sorting by createdAt descending
  - Empty results handling

- ✅ Get all comments (admin)
  - Get all comments including deleted
  - Include deleted comments
  - Pagination handling
  - Author and post population
  - Sorting by createdAt descending
  - Empty results handling

### Pending Tests

- Middleware Tests
- Controller Tests
- Integration Tests

## Test Utilities

### Database Setup

The test suite uses `mongodb-memory-server` to create an in-memory MongoDB instance for testing. This ensures:
- Tests run in isolation
- No external database dependencies
- Fast test execution
- Clean database state for each test

### Helper Functions

Located in `tests/helpers/test-helpers.ts`:
- `createMockRequest()` - Create mock Express request
- `createMockResponse()` - Create mock Express response
- `createMockNext()` - Create mock Express next function
- `generateTestToken()` - Generate JWT tokens for testing
- `createMockUser()` - Create mock user object
- `createMockPost()` - Create mock post object
- `createMockComment()` - Create mock comment object

## Writing Tests

### Test File Structure

```typescript
import { clearDatabase } from '../../setup/test-setup'
import { serviceFunction } from '../../../src/services/...'

describe('Service Name', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  describe('functionName', () => {
    it('should do something successfully', async () => {
      // Arrange
      const data = { ... }
      
      // Act
      const result = await serviceFunction(data)
      
      // Assert
      expect(result).toBeDefined()
    })

    it('should handle edge case', async () => {
      // Test edge case
    })
  })
})
```

### Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clear the database before each test
3. **Edge Cases**: Test both success and failure scenarios
4. **Descriptive Names**: Use descriptive test names that explain what is being tested
5. **AAA Pattern**: Arrange, Act, Assert pattern for clarity
6. **Error Handling**: Test error cases thoroughly
7. **Validation**: Test input validation and edge cases

## Edge Cases to Consider

### Authentication
- ✅ Duplicate email registration
- ✅ Case-insensitive email
- ✅ Invalid credentials
- ✅ OAuth users without password
- ✅ Expired tokens
- ✅ Invalid tokens
- ✅ Token mismatch

### Posts (To be implemented)
- Non-existent post
- Unauthorized access
- Soft-deleted posts
- Invalid author
- Empty content
- Very long content
- Special characters in title

### Comments (To be implemented)
- Non-existent post
- Non-existent comment
- Unauthorized access
- Soft-deleted comments
- Empty content
- Comments on deleted posts

### Admin (To be implemented)
- Non-admin access
- Non-existent users/posts/comments
- Pagination edge cases
- Invalid filters

## Continuous Integration

Tests should be run automatically in CI/CD pipelines:
- On every pull request
- Before merging to main branch
- On scheduled basis

## Coverage Goals

- **Unit Tests**: 80%+ coverage for services
- **Integration Tests**: Critical user flows
- **Edge Cases**: All identified edge cases covered
