# Quick Start Guide

## Prerequisites
- Node.js v16 or higher
- npm or yarn
- Git (optional)

## Step 1: Backend Setup

### Open Terminal/PowerShell and navigate to backend:
```powershell
cd backend
```

### Install dependencies:
```powershell
npm install
```

### Start the backend server:
```powershell
npm run dev
```

You should see:
```
Database initialized successfully
Server running on http://localhost:5000
```

**Keep this terminal open!**

## Step 2: Frontend Setup

### Open a NEW Terminal/PowerShell and navigate to frontend:
```powershell
cd frontend
```

### Install dependencies:
```powershell
npm install
```

### Start the frontend development server:
```powershell
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
```

## Step 3: Access the Application

Open your browser and go to: **http://localhost:3000**

## Step 4: Create Demo Accounts (Optional)

### Create a Student Account:
1. Click "Register here" on the login page
2. Fill in:
   - Name: `John Student`
   - Email: `student@example.com`
   - Password: `password123`
   - Role: Select "Student"
3. Click "Register"

### Create a Mentor Account:
1. Click "Register here" on the login page
2. Fill in:
   - Name: `Jane Mentor`
   - Email: `mentor@example.com`
   - Password: `password123`
   - Role: Select "Mentor"
3. Click "Register"

## Step 5: Test the Application

### As a Student:
1. Login with student credentials
2. Click "Create New Entry"
3. Fill in:
   - Title: "Learned React Hooks"
   - Description: "Today I learned about useState and useEffect hooks"
   - Tags: Add "React"
   - Resources: Add a URL (optional)
4. Click "Create Entry"
5. Go to "My Entries" to see your entry
6. Go to "My Tasks" to see assigned tasks

### As a Mentor:
1. Login with mentor credentials
2. Go to "Students" to see all students
3. Click "View Activity" on a student
4. Click "Review" on an entry
5. Add feedback and update status
6. Go to "Assign Task" to create a task for a student

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:

**For Backend (port 5000):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**For Frontend (port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Dependencies Installation Issues
If npm install fails:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Reinstall
npm install
```

### Database Issues
If you encounter database errors:
```powershell
# Delete the database file (it will be recreated)
cd backend
del mentor_portal.db

# Restart the backend
npm run dev
```

### CORS Errors
If you see CORS errors in browser console:
- Ensure backend is running on port 5000
- Check that frontend proxy is configured correctly in vite.config.js
- Restart both servers

## File Structure Quick Reference

```
backend/
├── server.js          # Main server file
├── db.js              # Database setup
├── routes/            # API routes
└── middleware/        # Auth middleware

frontend/
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── api/           # API client
│   ├── context/       # React context
│   └── App.jsx        # Main app component
└── index.html         # HTML entry point
```

## Key Endpoints to Test

### Authentication
- POST http://localhost:5000/api/auth/register
- POST http://localhost:5000/api/auth/login

### Health Check
- GET http://localhost:5000/api/health

## Environment Variables

### Backend (.env file already created)
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

### Frontend (uses Vite proxy)
- Proxy configured in vite.config.js
- All /api requests forward to http://localhost:5000

## Next Steps

1. Explore the student dashboard
2. Create some learning entries
3. Switch to mentor account and review entries
4. Assign tasks to students
5. Check the analytics dashboard

## Support

For issues:
1. Check the README.md for detailed documentation
2. Verify both servers are running
3. Check browser console for errors
4. Check terminal/console for backend errors

Happy learning! 🚀
