# Backend Verification Guide

## ✅ Backend Server Status

**Status:** ✅ RUNNING
**URL:** http://localhost:5000
**Port:** 5000
**Database:** SQLite (mentor_portal.db)
**WebSocket:** Socket.IO Ready

---

## 🔍 Verification Steps

### Step 1: Check Server Health
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "Server is running"
}
```

### Step 2: Test Authentication
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "teststudent@example.com",
    "password": "password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teststudent@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Test Student",
    "email": "teststudent@example.com",
    "role": "student"
  }
}
```

### Step 3: Test Doubts API
```bash
# Create a doubt (use token from login)
curl -X POST http://localhost:5000/api/doubts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doubtType": "concept",
    "concept": "React Hooks",
    "question": "How do I use useState?",
    "description": "I am confused about state management",
    "subject": "React",
    "techStack": "MERN",
    "priority": "medium"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "studentId": 1,
  "doubtType": "concept",
  "concept": "React Hooks",
  "question": "How do I use useState?",
  "description": "I am confused about state management",
  "subject": "React",
  "techStack": "MERN",
  "priority": "medium",
  "status": "open",
  "createdAt": "2025-11-27T..."
}
```

### Step 4: Test Filtering
```bash
# Get open doubts with high priority
curl -X GET "http://localhost:5000/api/doubts?status=open&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Test Answer API
```bash
# Answer a doubt (as mentor)
curl -X POST http://localhost:5000/api/doubts/1/answers \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "useState is a hook that lets you add state to functional components",
    "resources": "https://react.dev/reference/react/useState"
  }'
```

---

## 📊 Database Verification

### Check Tables Created
```bash
# Using sqlite3 CLI
sqlite3 backend/mentor_portal.db ".tables"
```

**Expected Output:**
```
activity_feed  audit_logs  comments  doubt_answers  doubts  entries  
mentor_students  schedules  task_questions  tasks  users
```

### Check Doubts Table Schema
```bash
sqlite3 backend/mentor_portal.db ".schema doubts"
```

**Expected Fields:**
- id
- studentId
- mentorId
- taskId
- concept
- question
- description
- **doubtType** (NEW)
- **subject** (NEW)
- **techStack** (NEW)
- **projectName** (NEW)
- **priority** (NEW)
- status
- createdAt
- updatedAt

---

## 🔌 Socket.IO Verification

### Check WebSocket Connection
Open browser console and check for:
```
Socket connected
```

### Test Real-time Events
The server emits these events:
- `student:registered`
- `entry:created`
- `entry:statusChanged`
- `comment:added`
- `task:assigned`
- `schedule:created`
- `doubt:created` (NEW)
- `doubt:answered` (NEW)
- `doubt:resolved` (NEW)

---

## 🧪 Quick Test Workflow

### 1. Create Test Accounts
```bash
# Create student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Student",
    "email": "john@example.com",
    "password": "pass123",
    "role": "student"
  }'

# Create mentor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Mentor",
    "email": "jane@example.com",
    "password": "pass123",
    "role": "mentor"
  }'
```

### 2. Login and Get Tokens
```bash
# Student login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
# Copy token from response

# Mentor login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "pass123"
  }'
# Copy token from response
```

### 3. Student Creates Doubt
```bash
curl -X POST http://localhost:5000/api/doubts \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doubtType": "project",
    "concept": "E-commerce Architecture",
    "question": "How to design scalable e-commerce?",
    "description": "Building a large-scale e-commerce platform",
    "subject": "System Design",
    "techStack": "MERN",
    "projectName": "E-commerce Platform",
    "priority": "high"
  }'
```

### 4. Mentor Views Doubts
```bash
curl -X GET "http://localhost:5000/api/doubts?status=open&priority=high" \
  -H "Authorization: Bearer MENTOR_TOKEN"
```

### 5. Mentor Answers Doubt
```bash
curl -X POST http://localhost:5000/api/doubts/1/answers \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "For scalable e-commerce, use microservices architecture with separate services for products, orders, payments, etc.",
    "resources": "https://example.com/ecommerce-guide"
  }'
```

### 6. Mentor Marks as Resolved
```bash
curl -X PATCH http://localhost:5000/api/doubts/1/status \
  -H "Authorization: Bearer MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved"
  }'
```

---

## ✅ Verification Checklist

- [x] Backend server running on port 5000
- [x] Database initialized with new schema
- [x] Socket.IO server active
- [x] All routes registered
- [x] Authentication working
- [x] Doubts table has new fields
- [x] Filtering by priority working
- [x] Filtering by doubt type working
- [x] Filtering by subject working
- [x] Answer API functional
- [x] Status update working
- [ ] Frontend connected (next)
- [ ] Real-time updates visible (next)
- [ ] End-to-end testing (next)

---

## 🚨 Troubleshooting

### Server Not Starting
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F

# Restart
npm run dev
```

### Database Errors
```bash
# Delete and recreate database
rm mentor_portal.db
npm run dev
```

### API Errors
1. Check token is valid
2. Verify request format
3. Check Content-Type header
4. Review backend logs

### Connection Issues
1. Verify backend URL
2. Check CORS settings
3. Verify network connectivity
4. Check firewall settings

---

## 📝 Notes

- Backend is running on **http://localhost:5000**
- Database is **SQLite** (mentor_portal.db)
- All new fields are working correctly
- Filtering is implemented and functional
- Real-time events are ready for frontend

---

## 🎯 Next Steps

1. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Update Routes**
   - Add DoubtsEnhanced page
   - Add DoubtsQAEnhanced page

3. **Test Integration**
   - Create doubt in frontend
   - View in mentor dashboard
   - Answer and resolve

4. **Verify Real-time**
   - Check live updates
   - Test notifications
   - Verify filtering

---

**Backend Status:** ✅ VERIFIED AND READY
**Date:** November 27, 2025
**Version:** 2.0.0
