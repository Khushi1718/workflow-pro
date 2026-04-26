# Workflow Pro Backend - Complete API Documentation

## Base URL
```
http://localhost:5123/api
```

---

## Authentication Endpoints

### 1. Register User
Create a new employee account.

**POST** `/auth/register`

**Request Body**
```json
{
  "name": "string (required, min 2 chars)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 6 chars)",
  "team": "string (required)"
}
```

**Success Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@tracely.app",
      "role": "employee",
      "team": "Development"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400)**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login User
Authenticate and receive JWT token.

**POST** `/auth/login`

**Request Body**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@tracely.app",
      "role": "employee",
      "team": "Development",
      "isActive": true,
      "joinedAt": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Profile
Get current user's profile information.

**GET** `/auth/profile`

**Headers**
```
Authorization: Bearer <token>
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@tracely.app",
    "role": "employee",
    "team": "Development",
    "isActive": true,
    "joinedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4. Update Profile
Update current user's profile.

**PUT** `/auth/profile`

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "string (optional)",
  "team": "string (optional)"
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe Updated",
    "email": "john@tracely.app",
    "team": "Development"
  }
}
```

---

## Work Log Endpoints

### 1. Create Work Log
Create a new work log entry.

**POST** `/work-logs`

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "title": "string (required, max 200)",
  "accomplishments": "string (required, min 10)",
  "meetingsAttended": "number (optional, default 0)",
  "focusForTomorrow": "string (optional, min 5)",
  "status": "string (optional: 'completed'|'in_progress'|'pending', default 'completed')",
  "date": "string ISO date (required)",
  "meetingNotes": "string (optional)",
  "attachments": [
    {
      "id": "string",
      "name": "string",
      "url": "string",
      "type": "string ('image'|'link'|'document'|'spreadsheet'|'presentation')"
    }
  ]
}
```

**Example Request**
```json
{
  "title": "Database Optimization",
  "accomplishments": "Optimized MongoDB queries and improved performance by 40%",
  "meetingsAttended": 2,
  "focusForTomorrow": "Complete API authentication",
  "status": "completed",
  "date": "2024-04-26T00:00:00Z",
  "meetingNotes": "Performance review successful"
}
```

**Success Response (201)**
```json
{
  "success": true,
  "message": "Work log created successfully",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Database Optimization",
    "status": "completed",
    "date": "2024-04-26T00:00:00Z"
  }
}
```

---

### 2. Get My Work Logs
Retrieve all work logs for current user.

**GET** `/work-logs/my-logs`

**Headers**
```
Authorization: Bearer <token>
```

**Query Parameters**
```
?limit=20&skip=0&status=completed&startDate=2024-01-01&endDate=2024-12-31
```

- `limit` (number, default: 20, max: 100) - Items per page
- `skip` (number, default: 0) - Items to skip for pagination
- `status` (string) - Filter by status: completed, in_progress, pending
- `startDate` (ISO string) - Filter logs from this date
- `endDate` (ISO string) - Filter logs until this date

**Success Response (200)**
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "title": "Database Optimization",
      "accomplishments": "Optimized queries and indexing",
      "meetingsAttended": 2,
      "status": "completed",
      "date": "2024-04-26T00:00:00Z",
      "createdAt": "2024-04-26T10:30:00Z",
      "updatedAt": "2024-04-26T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "skip": 0,
    "pages": 3
  }
}
```

---

### 3. Get Work Log Detail
Get detailed information about a specific work log.

**GET** `/work-logs/:id`

**Headers**
```
Authorization: Bearer <token>
```

**URL Parameters**
- `id` (string) - Work log ID

**Success Response (200)**
```json
{
  "success": true,
  "message": "Log retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "John Doe",
      "email": "john@tracely.app"
    },
    "title": "Database Optimization",
    "accomplishments": "Optimized queries and indexing",
    "meetingsAttended": 2,
    "focusForTomorrow": "Complete API authentication",
    "status": "completed",
    "date": "2024-04-26T00:00:00Z",
    "meetingNotes": "Performance review successful",
    "attachments": [],
    "createdAt": "2024-04-26T10:30:00Z",
    "updatedAt": "2024-04-26T10:30:00Z"
  }
}
```

---

### 4. Update Work Log
Update an existing work log.

**PUT** `/work-logs/:id`

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**
- `id` (string) - Work log ID

**Request Body** (all fields optional)
```json
{
  "title": "string",
  "accomplishments": "string",
  "meetingsAttended": "number",
  "focusForTomorrow": "string",
  "status": "string",
  "meetingNotes": "string",
  "attachments": "array"
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "Work log updated successfully",
  "data": { ... }
}
```

---

### 5. Delete Work Log
Delete a work log.

**DELETE** `/work-logs/:id`

**Headers**
```
Authorization: Bearer <token>
```

**URL Parameters**
- `id` (string) - Work log ID

**Success Response (200)**
```json
{
  "success": true,
  "message": "Work log deleted successfully"
}
```

---

## Admin Endpoints

> **Note:** All admin endpoints require `role: 'admin'` in JWT token

### 1. Get All Users
List all users with pagination and filtering.

**GET** `/admin/users`

**Headers**
```
Authorization: Bearer <admin_token>
```

**Query Parameters**
```
?limit=20&skip=0&isActive=true&role=employee
```

- `limit` (number, default: 20, max: 100)
- `skip` (number, default: 0)
- `isActive` (boolean) - Filter by active status
- `role` (string) - Filter by role: admin, employee

**Success Response (200)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@tracely.app",
      "role": "employee",
      "team": "Development",
      "isActive": true,
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 20,
    "skip": 0,
    "pages": 2
  }
}
```

---

### 2. Get User Detail
Get detailed information about a specific user.

**GET** `/admin/users/:id`

**Headers**
```
Authorization: Bearer <admin_token>
```

**URL Parameters**
- `id` (string) - User ID

**Success Response (200)**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@tracely.app",
    "role": "employee",
    "team": "Development",
    "isActive": true,
    "joinedAt": "2024-01-15T10:00:00Z",
    "totalLogs": 42
  }
}
```

---

### 3. Update User Status
Activate or deactivate a user.

**PUT** `/admin/users/:id/status`

**Headers**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**URL Parameters**
- `id` (string) - User ID

**Request Body**
```json
{
  "isActive": boolean
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@tracely.app",
    "isActive": false,
    "leftAt": "2024-04-26T14:30:00Z"
  }
}
```

---

### 4. Get All Work Logs
Get all work logs with advanced filtering and sorting.

**GET** `/admin/logs/all`

**Headers**
```
Authorization: Bearer <admin_token>
```

**Query Parameters**
```
?limit=20&skip=0&userId=xxx&status=completed&startDate=2024-01-01&endDate=2024-12-31&sortBy=date&sortOrder=desc
```

- `limit` (number, default: 20, max: 100)
- `skip` (number, default: 0)
- `userId` (string) - Filter by user ID
- `status` (string) - Filter by status
- `startDate` (ISO string) - Filter from date
- `endDate` (ISO string) - Filter until date
- `sortBy` (string) - Field to sort: date, status, userId (default: date)
- `sortOrder` (string) - asc or desc (default: desc)

**Success Response (200)**
```json
{
  "success": true,
  "message": "All logs retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "John Doe",
        "email": "john@tracely.app",
        "team": "Development"
      },
      "title": "Database Optimization",
      "status": "completed",
      "date": "2024-04-26T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "skip": 0,
    "pages": 8
  }
}
```

---

### 5. Get Today's Logs
Get all work logs for today.

**GET** `/admin/logs/today`

**Headers**
```
Authorization: Bearer <admin_token>
```

**Query Parameters**
```
?limit=20&skip=0&userId=xxx&status=completed
```

- `limit` (number, default: 20, max: 100)
- `skip` (number, default: 0)
- `userId` (string) - Filter by user ID
- `status` (string) - Filter by status

**Success Response (200)**
```json
{
  "success": true,
  "message": "Today logs retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 6. Get Activity Logs
Retrieve audit log of all user activities.

**GET** `/admin/activity-logs`

**Headers**
```
Authorization: Bearer <admin_token>
```

**Query Parameters**
```
?limit=50&skip=0&userId=xxx&action=login&startDate=2024-04-25&endDate=2024-04-26
```

- `limit` (number, default: 50, max: 200)
- `skip` (number, default: 0)
- `userId` (string) - Filter by user ID
- `action` (string) - Filter by action
- `startDate` (ISO string) - Filter from date
- `endDate` (ISO string) - Filter until date

**Success Response (200)**
```json
{
  "success": true,
  "message": "Activity logs retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "John Doe",
        "email": "john@tracely.app"
      },
      "action": "login",
      "resourceType": "user",
      "timestamp": "2024-04-26T10:30:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "pagination": { ... }
}
```

---

## Error Codes & Messages

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required",
  "error": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "Authentication failed"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Work log not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Detailed error message"
}
```

---

## Rate Limiting & Best Practices

### Best Practices
1. **Always include Authorization header** for protected routes
2. **Use pagination** - Avoid fetching all data at once
3. **Use date filtering** - For date range queries
4. **Use lean queries** - Already implemented in backend
5. **Batch requests** - Group similar queries
6. **Cache results** - Implement client-side caching

### Query Performance Tips
- Combine filters with pagination
- Use date ranges for historical data queries
- Filter by status early in the pipeline
- Use sortBy for efficient ordering

---

## Examples

### Login and Get Logs
```javascript
// 1. Login
const loginRes = await fetch('http://localhost:5123/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'khushi@tracely.app',
    password: 'password123'
  })
});
const { data: { token } } = await loginRes.json();

// 2. Fetch logs
const logsRes = await fetch(
  'http://localhost:5123/api/work-logs/my-logs?limit=10&status=completed',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const logs = await logsRes.json();
```

---

## Support

For API issues:
1. Verify backend is running: `http://localhost:5123/health`
2. Check request format matches examples
3. Verify JWT token is valid and not expired
4. Check CORS settings if frontend integration fails
5. Review server logs for detailed errors
