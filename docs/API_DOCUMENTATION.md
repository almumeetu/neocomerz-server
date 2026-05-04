# User API Documentation

## Overview
This document describes the User API endpoints for the NeoComerz e-commerce platform. All endpoints are versioned (v1) and include soft delete functionality.

## Base URL
```
http://localhost:3000
```

## API Versioning
All endpoints use versioning via the `Accept-Version` header:
```
Accept-Version: 1
```

## Authentication
Currently, no authentication is required. This will be added in future updates.

## Endpoints

### 1. Create User
Creates a new user in the system.

**Endpoint:** `POST /users`
**Version:** v1
**Headers:**
```
Accept-Version: 1
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+8801234567890",
  "role": "customer"
}
```

**Fields:**
- `name` (string, required): Full name of the user
- `email` (string, required, unique): User's email address
- `password` (string, required, min 6 characters): User's password
- `phone` (string, optional): User's phone number
- `role` (enum, optional): User's role - `admin`, `customer`, or `staff` (default: `customer`)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "phone": "+8801234567890",
  "role": "customer",
  "createdAt": "2024-04-27T10:00:00.000Z",
  "updatedAt": "2024-04-27T10:00:00.000Z",
  "deletedAt": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

### 2. Get All Users
Retrieves a list of all users (excluding soft-deleted users).

**Endpoint:** `GET /users`
**Version:** v1
**Headers:**
```
Accept-Version: 1
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801234567890",
    "role": "customer",
    "createdAt": "2024-04-27T10:00:00.000Z",
    "updatedAt": "2024-04-27T10:00:00.000Z",
    "deletedAt": null
  }
]
```

---

### 3. Get User by ID
Retrieves a specific user by their ID.

**Endpoint:** `GET /users/:id`
**Version:** v1
**Headers:**
```
Accept-Version: 1
```

**URL Parameters:**
- `id` (string, required): User UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+8801234567890",
  "role": "customer",
  "createdAt": "2024-04-27T10:00:00.000Z",
  "updatedAt": "2024-04-27T10:00:00.000Z",
  "deletedAt": null
}
```

**Error Responses:**
- `404 Not Found`: User not found or soft-deleted

---

### 4. Update User
Updates an existing user's information.

**Endpoint:** `PATCH /users/:id`
**Version:** v1
**Headers:**
```
Accept-Version: 1
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required): User UUID

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "phone": "+8809876543210",
  "role": "staff"
}
```

**Fields (all optional):**
- `name` (string): Full name of the user
- `email` (string, unique): User's email address
- `password` (string, min 6 characters): User's password
- `phone` (string): User's phone number
- `role` (enum): User's role - `admin`, `customer`, or `staff`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+8809876543210",
  "role": "staff",
  "createdAt": "2024-04-27T10:00:00.000Z",
  "updatedAt": "2024-04-27T10:30:00.000Z",
  "deletedAt": null
}
```

**Error Responses:**
- `404 Not Found`: User not found or soft-deleted
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

### 5. Delete User (Soft Delete)
Soft deletes a user by setting the `deletedAt` timestamp.

**Endpoint:** `DELETE /users/:id`
**Version:** v1
**Headers:**
```
Accept-Version: 1
```

**URL Parameters:**
- `id` (string, required): User UUID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: User not found or already soft-deleted

**Note:** This is a soft delete. The user is not permanently removed from the database. The `deletedAt` field is set to the current timestamp, and the user will not appear in `GET /users` responses.

---

## Soft Delete Behavior
- Soft-deleted users are not returned in the `GET /users` list
- Soft-deleted users cannot be retrieved by `GET /users/:id`
- Soft-deleted users cannot be updated
- Attempting to delete an already soft-deleted user returns `404 Not Found`

## Data Model

### User Model
```typescript
{
  id: string;           // UUID
  name: string;         // Required
  email: string;        // Required, unique
  password: string;     // Required, min 6 chars
  phone?: string;       // Optional
  role: 'admin' | 'customer' | 'staff';  // Default: 'customer'
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;     // Soft delete timestamp
}
```

## Testing

### Running Tests
```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

### Test Coverage
- Unit tests: `src/user/user.service.spec.ts`
- E2E tests: `test/user.e2e-spec.ts`

### Test Scenarios
Unit tests cover:
- Service initialization
- Create user
- Find all users
- Find user by ID
- Update user
- Soft delete user

E2E tests cover:
- Create user with valid data
- Create user with invalid email
- Create user with short password
- Get all users
- Get user by ID
- Get non-existent user (404)
- Update user
- Soft delete user
- Get soft-deleted user (404)

## Swagger Documentation
Interactive API documentation is available at:
```
http://localhost:3000/api
```

Access this URL in your browser to explore and test the API endpoints interactively.

## Error Response Format
All error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message details",
  "error": "Bad Request"
}
```

## Future Enhancements
- Add authentication (JWT)
- Add pagination for `GET /users`
- Add filtering and sorting options
- Add password hashing
- Add rate limiting
- Add request validation enhancements
