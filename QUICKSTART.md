# 🚀 Quick Start Guide - Workflow Pro Full Stack

## 5-Minute Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (or Docker)
- Terminal/Command Prompt

---

## Backend Setup

### 1️⃣ Install Dependencies
```bash
cd backend
npm install
# or if you use bun
bun install
```

### 2️⃣ Start MongoDB (if not running)
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3️⃣ Seed Test Data
```bash
npm run seed
```

Expected output:
```
✅ Admin created: admin@tracely.app
✅ Employee created: khushi@tracely.app
✅ Employee created: john@tracely.app
✅ Work log created: "Database Optimization"
...
```

### 4️⃣ Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
📊 Creating database indexes...
🚀 Server running on http://localhost:5123
📊 Health check: http://localhost:5123/health
```

---

## Frontend Setup (Parallel)

### 1️⃣ Install Dependencies
```bash
cd ..  # Go back to root
npm install
# or
bun install
```

### 2️⃣ Update Frontend .env
Create or update `.env` in frontend root:
```
VITE_API_URL=http://localhost:5123/api
```

### 3️⃣ Start Frontend Server
```bash
npm run dev
# or
bun run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🧪 Test the System

### 1. Login Test
Open `http://localhost:5173` in browser

**Test Credentials**
```
Email: khushi@tracely.app
Password: password123
```

### 2. Check API Health
```bash
curl http://localhost:5123/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-04-26T10:30:00.000Z",
  "port": 5123
}
```

### 3. Test API Endpoint
```bash
# Login and get token
curl -X POST http://localhost:5123/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khushi@tracely.app","password":"password123"}'

# Copy token from response

# Get profile
curl -H "Authorization: Bearer <token>" \
  http://localhost:5123/api/auth/profile
```

---

## 📁 Project Structure

```
workflow-pro/
├── backend/                    # Node.js + Express + MongoDB
│   ├── src/
│   ├── .env                   # Configure for local dev
│   ├── package.json
│   └── README.md              # Detailed backend docs
│
├── src/                        # React Frontend
│   ├── pages/
│   ├── components/
│   └── lib/
│
├── FRONTEND_INTEGRATION.md    # How to connect frontend to backend
└── README.md
```

---

## 🔧 Common Commands

### Backend
```bash
npm run dev              # Start development server
npm run build           # Build TypeScript
npm run seed            # Populate test data
npm start               # Run production build
```

### Frontend
```bash
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run tests
```

---

## 🔐 Authentication Flow

1. **Login** → Backend validates credentials, returns JWT token
2. **Store Token** → Frontend saves token to localStorage
3. **API Calls** → Include token in `Authorization: Bearer <token>` header
4. **Token Expiry** → After 7 days, user needs to login again

---

## 📊 Database

### Collections Auto-Created
- **users** - User accounts with hashed passwords
- **worklogs** - Work log entries with indexes
- **activitylogs** - Audit trail

### Indexes Auto-Created
- `worklogs`: { userId: 1, date: -1 }
- `worklogs`: { date: -1 }
- `worklogs`: { status: 1, date: -1 }
- `users`: { email: 1 }
- `activitylogs`: { userId: 1, timestamp: -1 }

---

## 🚨 Troubleshooting

### "Port 5123 already in use"
```bash
lsof -i :5123 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### "CORS error in frontend"
- Verify backend running on port 5123
- Check CORS_ORIGIN in backend .env
- Restart both servers after .env changes

### "Token not working"
- Verify token stored in localStorage
- Check Authorization header format: `Bearer <token>`
- Ensure backend and frontend using same JWT_SECRET

---

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Backend seed script ran successfully
- [ ] Backend server running on :5123
- [ ] Health check returns ok status
- [ ] Frontend dependencies installed
- [ ] Frontend running on :5173
- [ ] Can login with test credentials
- [ ] Can see work logs in dashboard

---

## 📚 Documentation

- **Backend Details**: `backend/README.md`
- **API Docs**: `backend/API_DOCUMENTATION.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION.md`

---

## 🚀 Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend ready
3. Integrate frontend with backend API (see FRONTEND_INTEGRATION.md)
4. Add file upload support for attachments
5. Deploy to production

---

## 💡 Tips

- Use `npm run seed` to reset data anytime
- Check `http://localhost:5123/health` for server status
- Use browser DevTools → Network tab to debug API calls
- Enable MongoDB logging: `db.setLogLevel(1)` in mongo shell
- Backend logs all activities to ActivityLogs collection

---

**Need help?** Check the detailed documentation files or review API examples in the API_DOCUMENTATION.md
