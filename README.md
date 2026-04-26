
# 📊 Workflow Pro - Work Tracking System

A modern, scalable work tracking and activity logging system built with React, TypeScript, Node.js, Express, and MongoDB.

## 🎯 Overview

Workflow Pro is an enterprise-grade application that allows employees to log their daily work activities and enables administrators to track productivity across teams. The system is built with a clean architecture, optimized database queries, and production-ready security.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install dependencies
npm install && cd backend && npm install && cd ..

# 2. Start backend (Terminal 1)
cd backend && npm run seed && npm run dev

# 3. Start frontend (Terminal 2)
npm run dev
```

**Done!** Open http://localhost:5173 and login with:
- Email: `khushi@tracely.app`
- Password: `password123`

---

## 📱 Features

### For Employees
✅ Create and manage work logs  
✅ Track daily accomplishments  
✅ Log meetings attended  
✅ Set focus for tomorrow  
✅ Attach files/links to logs  
✅ View log history  
✅ Manage profile  

### For Administrators
✅ View all employees  
✅ Access all work logs  
✅ View today's logs  
✅ Track activity audit log  
✅ Activate/deactivate users  
✅ Filter and search logs  
✅ Export audit reports  

---

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: ShadcN UI + Radix UI
- **Styling**: TailwindCSS
- **State**: React Query
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Auth**: JWT
- **Validation**: Mongoose schemas

---

## 📂 Project Structure

```
workflow-pro/
├── src/                              # Frontend React app
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── employee/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AddLog.tsx
│   │   │   ├── MyLogs.tsx
│   │   │   ├── LogDetail.tsx
│   │   │   └── Profile.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── AllUsers.tsx
│   │       ├── AllLogs.tsx
│   │       ├── TodayLogs.tsx
│   │       ├── ActivityLogs.tsx
│   │       ├── UserDetail.tsx
│   │       └── Profile.tsx
│   ├── components/
│   ├── lib/
│   └── hooks/
│
├── backend/                          # Node.js backend
│   ├── src/
│   │   ├── config/                   # Database config
│   │   ├── controllers/              # Business logic
│   │   ├── models/                   # MongoDB schemas
│   │   ├── routes/                   # API endpoints
│   │   ├── middleware/               # Auth & error handling
│   │   ├── utils/                    # Utilities
│   │   ├── scripts/                  # Database seeding
│   │   └── server.ts                 # Express app
│   ├── .env
│   ├── package.json
│   └── README.md                     # Backend documentation
│
├── QUICKSTART.md                     # 5-minute setup
├── BACKEND_COMPLETE.md               # Backend details
├── FRONTEND_INTEGRATION.md           # Integration guide
└── README.md                         # This file
```

---

## 🔐 Authentication & Authorization

### JWT-Based Security
- Tokens expire after 7 days
- Role-based access control (Admin/Employee)
- Password hashing with bcryptjs
- Protected API endpoints

### Test Credentials
```
Admin:
  Email: admin@tracely.app
  Password: password123

Employee 1:
  Email: khushi@tracely.app
  Password: password123

Employee 2:
  Email: john@tracely.app
  Password: password123
```

---

## 📊 Database

### Collections
- **users** - User accounts with roles
- **worklogs** - Work log entries
- **activitylogs** - Audit trail

### Indexes
Automatically created for optimal performance:
- `worklogs`: { userId: 1, date: -1 }
- `worklogs`: { date: -1 }
- `worklogs`: { date: -1, userId: 1 }
- `worklogs`: { status: 1, date: -1 }
- `users`: { email: 1 }
- `activitylogs`: { userId: 1, timestamp: -1 }

---

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get user profile
PUT    /api/auth/profile       - Update profile
```

### Work Logs (Employee)
```
POST   /api/work-logs          - Create work log
GET    /api/work-logs/my-logs  - Get my logs (paginated)
GET    /api/work-logs/:id      - Get log detail
PUT    /api/work-logs/:id      - Update work log
DELETE /api/work-logs/:id      - Delete work log
```

### Admin APIs
```
GET    /api/admin/users                - Get all users
GET    /api/admin/users/:id            - Get user detail
PUT    /api/admin/users/:id/status     - Update user status
GET    /api/admin/logs/all             - Get all logs
GET    /api/admin/logs/today           - Get today's logs
GET    /api/admin/activity-logs        - Get activity logs
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or bun package manager

### Step 1: Frontend Installation
```bash
npm install
```

### Step 2: Backend Installation
```bash
cd backend
npm install
```

### Step 3: Database Setup
```bash
# Make sure MongoDB is running
brew services start mongodb-community  # macOS

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Seed test data
npm run seed
```

### Step 4: Start Backend
```bash
npm run dev
```
Backend runs on: http://localhost:5123

### Step 5: Start Frontend (New Terminal)
```bash
cd ..
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| **QUICKSTART.md** | 5-minute setup guide |
| **BACKEND_COMPLETE.md** | Comprehensive backend overview |
| **backend/README.md** | Detailed backend setup & deployment |
| **backend/API_DOCUMENTATION.md** | Complete API reference |
| **FRONTEND_INTEGRATION.md** | Frontend-backend integration guide |

---

## 🎯 Key Features

### Performance Optimizations
✅ Database indexing for millions of records  
✅ Pagination on all list endpoints  
✅ Lean queries for read operations  
✅ Date range filtering  
✅ Connection pooling  

### Security
✅ JWT authentication  
✅ Role-based access control  
✅ Password hashing  
✅ CORS configuration  
✅ Activity audit logging  

### Scalability
✅ Normalized database schema  
✅ Optimized query patterns  
✅ Activity logging for compliance  
✅ Support for millions of records  

---

## 🧪 Testing

### Test Login
```bash
# Open http://localhost:5173 and use:
Email: khushi@tracely.app
Password: password123
```

### Test API
```bash
# Health check
curl http://localhost:5123/health

# Login
curl -X POST http://localhost:5123/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khushi@tracely.app","password":"password123"}'
```

---

## 🚨 Troubleshooting

### MongoDB Connection Failed
```bash
# Start MongoDB
brew services start mongodb-community
# or
docker run -d -p 27017:27017 mongo:latest
```

### Port Already in Use
```bash
# Kill process on port 5123
lsof -i :5123 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS Errors
- Ensure backend is running on port 5123
- Check CORS_ORIGIN in backend/.env
- Restart both servers after changes

### Token Not Working
- Check token is saved in localStorage
- Verify Authorization header format
- Ensure JWT_SECRET matches

---

## 📝 Development Commands

### Frontend
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run tests
npm run lint            # Lint code
```

### Backend
```bash
cd backend
npm run dev             # Start development server
npm run build           # Compile TypeScript
npm start               # Run compiled code
npm run seed            # Populate test data
```

---

## 🚀 Deployment

### Backend Deployment (to production)
1. Update MongoDB URI to Atlas
2. Set NODE_ENV=production
3. Update JWT_SECRET to strong random value
4. Configure CORS_ORIGIN for frontend domain
5. Deploy to hosting platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Update VITE_API_URL to production backend URL
2. Run: `npm run build`
3. Deploy dist folder to hosting (Vercel, Netlify, etc.)

---

## 📊 Data Models

### User
- name, email, password (hashed)
- role (admin/employee)
- team, isActive
- joinedAt, leftAt
- timestamps

### WorkLog
- userId, title, accomplishments
- meetingsAttended, focusForTomorrow
- status (completed/in_progress/pending)
- date, meetingNotes
- attachments (with type info)
- timestamps

### ActivityLog
- userId, action, resourceType
- resourceId, details
- ipAddress, userAgent
- timestamp

---

## 💡 Tips & Best Practices

1. **Always use pagination** - Avoid loading all data
2. **Filter by date range** - For historical queries
3. **Use status filter** - Narrow down results
4. **Check indexes** - Verify indexes are created
5. **Monitor logs** - Check activity logs for compliance
6. **Backup database** - Regularly backup MongoDB

---

## 📞 Support

For help:
1. Check QUICKSTART.md
2. Review backend/README.md
3. Read API_DOCUMENTATION.md
4. Check FRONTEND_INTEGRATION.md
5. Review troubleshooting sections

---

## 📄 License

This project is part of Workflow Pro system. All rights reserved.

---

**Ready to get started? See [QUICKSTART.md](./QUICKSTART.md) for 5-minute setup!**
