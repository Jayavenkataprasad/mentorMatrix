# Quick Reference Guide

## 🚀 Start Application (2 Commands)

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | password123 |
| Mentor | mentor@example.com | password123 |

## 📍 Key URLs

| Page | URL | Role |
|------|-----|------|
| Login | http://localhost:3000/login | Both |
| Register | http://localhost:3000/register | Both |
| Student Dashboard | http://localhost:3000/student/dashboard | Student |
| Student Entries | http://localhost:3000/student/entries | Student |
| Create Entry | http://localhost:3000/student/entries/create | Student |
| Student Tasks | http://localhost:3000/student/tasks | Student |
| Mentor Dashboard | http://localhost:3000/mentor/dashboard | Mentor |
| Mentor Students | http://localhost:3000/mentor/students | Mentor |
| Assign Task | http://localhost:3000/mentor/tasks/assign | Mentor |

## 🔧 Useful Commands

### Backend Commands
```powershell
# Development
npm run dev

# Start production
npm start

# Seed demo data
npm run seed

# Install dependencies
npm install
```

### Frontend Commands
```powershell
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install
```

## 📊 API Quick Test (cURL)

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

### Create Entry (replace TOKEN)
```bash
curl -X POST http://localhost:5000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test","body":"Body","tags":["test"],"resources":[]}'
```

### Get Entries
```bash
curl http://localhost:5000/api/entries \
  -H "Authorization: Bearer TOKEN"
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🗂️ File Structure Quick Map

```
Backend Routes:
├── /api/auth/register → POST
├── /api/auth/login → POST
├── /api/entries → POST, GET
├── /api/entries/:id → GET, PUT, DELETE
├── /api/entries/:id/status → PATCH
├── /api/entries/:id/comments → POST, GET
├── /api/tasks → POST, GET
├── /api/tasks/:id → PUT, DELETE
├── /api/mentor/students → GET
├── /api/mentor/analytics → GET
├── /api/mentor/student/:id/streak → GET
└── /api/student/dashboard → GET

Frontend Pages:
├── Login.jsx
├── Register.jsx
├── student/Dashboard.jsx
├── student/Entries.jsx
├── student/CreateEntry.jsx
├── student/EntryDetail.jsx
├── student/Tasks.jsx
├── mentor/Dashboard.jsx
├── mentor/Students.jsx
├── mentor/StudentActivity.jsx
├── mentor/EntryReview.jsx
└── mentor/TaskAssignment.jsx
```

## 🐛 Troubleshooting Quick Fixes

### Port Already in Use
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Clear npm Cache
```powershell
npm cache clean --force
```

### Reset Database
```powershell
cd backend
del mentor_portal.db
npm run dev
```

### Install Dependencies Again
```powershell
rmdir /s node_modules
del package-lock.json
npm install
```

## 📋 Feature Checklist

### Student Can:
- [ ] Register and login
- [ ] Create learning entries
- [ ] Add tags and resources
- [ ] Edit own entries
- [ ] Delete own entries
- [ ] View mentor feedback
- [ ] See learning streak
- [ ] View dashboard charts
- [ ] Manage tasks
- [ ] Mark tasks complete

### Mentor Can:
- [ ] Register and login
- [ ] View all students
- [ ] See student activity
- [ ] Review entries
- [ ] Add feedback comments
- [ ] Update entry status
- [ ] Assign tasks
- [ ] View analytics
- [ ] See student streaks
- [ ] Filter entries

## 🔐 Security Notes

- JWT expires in 7 days
- Passwords hashed with bcryptjs
- Role-based access control
- Protected API endpoints
- CORS enabled for localhost:3000
- Environment variables for secrets

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Complete documentation |
| SETUP.md | Quick start guide |
| TESTING.md | Testing procedures |
| DEPLOYMENT.md | Production deployment |
| PROJECT_SUMMARY.md | Project overview |
| QUICK_REFERENCE.md | This file |

## 🎯 Common Tasks

### Create a Student Account
1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. Select "Student" role
4. Click Register

### Create a Mentor Account
1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. Select "Mentor" role
4. Click Register

### Create a Learning Entry
1. Login as student
2. Click "Create New Entry"
3. Fill title and description
4. Add tags (optional)
5. Add resources (optional)
6. Click "Create Entry"

### Review Entry as Mentor
1. Login as mentor
2. Go to "Students"
3. Click "View Activity"
4. Click "Review" on an entry
5. Add feedback
6. Update status
7. Click "Update"

### Assign Task
1. Login as mentor
2. Go to "Assign Task"
3. Select student
4. Enter task details
5. Set due date (optional)
6. Click "Assign Task"

## 🔄 API Response Examples

### Successful Login
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Student",
    "email": "student@example.com",
    "role": "student"
  }
}
```

### Create Entry Response
```json
{
  "id": 1,
  "studentId": 1,
  "title": "Learned React",
  "body": "Today I learned React hooks",
  "tags": ["React"],
  "resources": [],
  "status": "pending",
  "createdAt": "2025-11-27T03:50:00.000Z"
}
```

### Error Response
```json
{
  "error": "Invalid email or password"
}
```

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1920px
- Large: 1921px+

## 🎨 Color Scheme

- Primary Blue: #3B82F6
- Secondary Purple: #8B5CF6
- Accent Pink: #EC4899
- Success Green: #10B981
- Warning Orange: #F59E0B
- Error Red: #EF4444

## 📞 Need Help?

1. Check SETUP.md for common issues
2. Review TESTING.md for API examples
3. See README.md for full documentation
4. Check browser console for errors
5. Check terminal for backend errors

## ✅ Pre-Deployment Checklist

- [ ] All features tested
- [ ] No console errors
- [ ] Database seeded with demo data
- [ ] JWT_SECRET changed
- [ ] CORS configured for production
- [ ] Environment variables set
- [ ] Build tested locally
- [ ] Documentation reviewed

---

**Last Updated:** November 27, 2025
**Version:** 1.0.0
