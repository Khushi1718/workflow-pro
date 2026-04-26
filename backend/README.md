# Workflow Pro Backend

A scalable, production-ready backend for the Work Tracking System built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Bun or npm package manager

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   bun install
   # or
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - For local development, MongoDB runs on `localhost:27017`
   - Update `MONGODB_URI` if using MongoDB Atlas

   ```bash
   # Default .env for local development
   PORT=5123
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/workflow-pro
   JWT_SECRET=workflow-pro-super-secret-key-2024
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start MongoDB locally** (if not using Atlas)
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or run via Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Seed database with test data**
   ```bash
   bun run seed
   # or
   npm run seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

   Server runs on: `http://localhost:5123`

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Work Logs (Employee)
- `POST /api/work-logs` - Create work log
- `GET /api/work-logs/my-logs` - Get my work logs (with pagination, filtering)
- `GET /api/work-logs/:id` - Get work log detail
- `PUT /api/work-logs/:id` - Update work log
- `DELETE /api/work-logs/:id` - Delete work log

### Admin APIs
- `GET /api/admin/users` - Get all users (with pagination, filtering)
- `GET /api/admin/users/:id` - Get user detail
- `PUT /api/admin/users/:id/status` - Update user active status
- `GET /api/admin/logs/all` - Get all work logs (with advanced filtering)
- `GET /api/admin/logs/today` - Get today's work logs
- `GET /api/admin/activity-logs` - Get activity logs

---

## 🔐 Test Credentials

After running seed script, use these credentials:

**Admin Account**
- Email: `admin@tracely.app`
- Password: `password123`

**Employee Account 1**
- Email: `khushi@tracely.app`
- Password: `password123`

**Employee Account 2**
- Email: `john@tracely.app`
- Password: `password123`

---

## 📋 Query Parameters

### Pagination
All list endpoints support:
- `limit` - Items per page (default: 20, max: 100)
- `skip` - Number of items to skip (default: 0)

```bash
GET /api/work-logs/my-logs?limit=20&skip=0
```

### Date Filtering
All log endpoints support:
- `startDate` - Filter logs from this date (ISO format)
- `endDate` - Filter logs until this date (ISO format)

```bash
GET /api/work-logs/my-logs?startDate=2024-01-01&endDate=2024-12-31
```

### Status Filtering
- `status` - Filter by status (completed, in_progress, pending)

```bash
GET /api/work-logs/my-logs?status=completed
```

### Sorting
Admin logs endpoint:
- `sortBy` - Field to sort (date, status, userId)
- `sortOrder` - asc or desc

```bash
GET /api/admin/logs/all?sortBy=date&sortOrder=desc
```

---

## 🗄️ Database Indexes

The backend automatically creates optimized indexes for:

**WorkLogs Collection**
- `{ userId: 1, date: -1 }` - Fast user-specific date queries
- `{ date: -1 }` - Fast global date queries
- `{ date: -1, userId: 1 }` - Optimized for sorted user logs
- `{ status: 1, date: -1 }` - Status-based filtering

**Users Collection**
- `{ email: 1 }` - Fast email lookups

**ActivityLogs Collection**
- `{ userId: 1, timestamp: -1 }` - User activity history
- `{ timestamp: -1 }` - Global activity timeline

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts           # MongoDB connection & indexing
│   ├── controllers/
│   │   ├── authController.ts     # Auth logic
│   │   ├── workLogController.ts  # Work log logic
│   │   └── adminController.ts    # Admin logic
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication
│   │   └── errorHandler.ts       # Error handling
│   ├── models/
│   │   ├── User.ts               # User schema
│   │   ├── WorkLog.ts            # WorkLog schema
│   │   └── ActivityLog.ts        # ActivityLog schema
│   ├── routes/
│   │   ├── authRoutes.ts         # Auth endpoints
│   │   ├── workLogRoutes.ts      # Work log endpoints
│   │   └── adminRoutes.ts        # Admin endpoints
│   ├── utils/
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── activity.ts           # Activity logging
│   │   └── response.ts           # Response formatting
│   ├── scripts/
│   │   └── seed.ts               # Database seeding
│   └── server.ts                 # Express app setup
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

---

## 💾 Data Models

### User
```typescript
{
  _id: ObjectId
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'employee'
  team: string
  isActive: boolean
  joinedAt: Date
  leftAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### WorkLog
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  title: string
  accomplishments: string
  meetingsAttended: number
  focusForTomorrow?: string
  status: 'completed' | 'in_progress' | 'pending'
  date: Date
  meetingNotes?: string
  attachments?: [{
    id: string
    name: string
    url: string
    type: 'image' | 'link' | 'document' | 'spreadsheet' | 'presentation'
  }]
  createdAt: Date
  updatedAt: Date
}
```

### ActivityLog
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  action: string (login, logout, create_log, etc.)
  resourceType: 'worklog' | 'user' | 'system'
  resourceId?: string
  details?: object
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}
```

---

## 🔒 Authentication

All protected endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <token>
```

Token expires in 7 days by default. Update `JWT_EXPIRY` in `.env` to change.

---

## 🚀 Production Deployment

### Switch to MongoDB Atlas

1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workflow-pro
   ```

### Environment Variables for Production
```
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRY=7d
CORS_ORIGIN=<your-frontend-domain>
```

### Deployment Checklist
- [ ] Update JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Use MongoDB Atlas with authentication
- [ ] Set up environment variables on hosting platform
- [ ] Enable HTTPS
- [ ] Monitor logs and activity logs
- [ ] Set up database backups

---

## 📈 Performance Features

✅ **Optimized Indexing** - Automatically created indexes for fast queries
✅ **Pagination** - All list endpoints support limit/skip
✅ **Date Range Filtering** - Efficient $gte/$lte queries
✅ **Lean Queries** - Use `.lean()` for read-only queries
✅ **Connection Pooling** - Mongoose manages connection pool
✅ **Compound Indexes** - Multi-field indexes for common query patterns
✅ **Activity Logging** - Audit trail for compliance

Supports millions of records without performance degradation!

---

## 🔧 Development Commands

```bash
# Start dev server
bun run dev

# Build TypeScript
bun run build

# Start production server
bun start

# Seed database
bun run seed

# Run tests (if added)
bun run test
```

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "limit": 20,
    "skip": 0,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `brew services list`
- Check connection string in `.env`
- Verify port 27017 is accessible

### Port Already in Use
```bash
# Kill process on port 5123
lsof -i :5123 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### JWT Token Issues
- Check token format: `Bearer <token>`
- Verify JWT_SECRET matches
- Check token expiration

### CORS Errors
- Update CORS_ORIGIN in `.env` to match frontend URL
- Ensure frontend includes Authorization header

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review API endpoint documentation
3. Check server logs: `http://localhost:5123/health`
4. Verify MongoDB indexes are created

---

## 📄 License

This project is part of Workflow Pro system. All rights reserved.
