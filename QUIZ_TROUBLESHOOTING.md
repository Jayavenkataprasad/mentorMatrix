# Quiz Functionality Troubleshooting Guide

## Issue: "No Questions Available" Error

### ✅ **Root Cause Identified**
The error occurs when students try to take a quiz but the system cannot find MCQ questions for the specific entry.

### 🔧 **Step-by-Step Solution**

#### **Step 1: Verify Database is Initialized**
```bash
cd backend
node check-questions.cjs
```
You should see output like:
```
Found 3 MCQ questions:
--- Question 1 ---
ID: 1
Entry ID: 3
Entry Title: Node JS
Student: student2
```

#### **Step 2: Start Backend Server**
```bash
cd backend
node server.js
```
Expected output:
```
Database initialized successfully
Socket.IO initialized
Server running on http://localhost:5000
WebSocket server ready
```

#### **Step 3: Start Frontend Server**
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v5.4.21 ready in 1234 ms
➜  Local: http://localhost:5173/
```

#### **Step 4: Test the Quiz Flow**

1. **Login as a Student**
   - Go to http://localhost:5173/login
   - Use student credentials (e.g., `student2@example.com`)

2. **Navigate to Entries**
   - Click "Student Dashboard" → "My Entries"

3. **Find an Entry with Quiz**
   - Look for entries with "Take Quiz" button
   - The entry should have MCQ questions added by a mentor

4. **Click "Take Quiz"**
   - Should show quiz questions instead of error

### 🐛 **Common Issues & Solutions**

#### **Issue 1: Database Not Initialized**
**Symptom:** "no such table: mcq_questions"
**Solution:** 
```bash
cd backend
node init-db.cjs
```

#### **Issue 2: Backend Server Not Running**
**Symptom:** Network errors in browser console
**Solution:** 
```bash
cd backend
node server.js
```

#### **Issue 3: No Questions for Entry**
**Symptom:** "No questions available for this quiz"
**Solution:** 
- Login as a mentor
- Go to the entry
- Add MCQ questions using the MCQ Manager

#### **Issue 4: Deadline Not Reached**
**Symptom:** "Questions not available until deadline"
**Solution:** 
- Wait until the deadline passes
- Or ask mentor to update the deadline

#### **Issue 5: Already Attempted Quiz**
**Symptom:** "You have already attempted this quiz"
**Solution:** 
- This is expected behavior
- Click "Show Previous Results" to see past performance
- Only one attempt per quiz is allowed

### 🔍 **Debugging Information**

The quiz page now includes enhanced debugging:

1. **Debug Panel** (top of page)
   - Shows loading state, error status, question count, entry ID

2. **Enhanced Error Messages**
   - Specific error details
   - Actionable suggestions
   - Previous results display

3. **Console Logging**
   - Open browser dev tools (F12)
   - Check Console tab for detailed logs

### 📊 **Database Verification**

Check if your database has the required data:

```bash
cd backend
node check-questions.cjs
```

Expected results:
- ✅ At least 1 user with role 'student'
- ✅ At least 1 entry belonging to that student
- ✅ At least 1 MCQ question for that entry

### 🎯 **Test Case Example**

**Working Test Case:**
1. Student: `student2@example.com`
2. Entry: "Node JS" (ID: 3)
3. Questions: 3 MCQ questions available
4. Deadline: Should be passed

**Expected Flow:**
1. Login → Dashboard → Entries → "Take Quiz"
2. Quiz page loads with questions
3. Student can answer and submit
4. Results are displayed

### 🚀 **Quick Start Script**

Use the provided batch file to start both servers:
```bash
# Double-click this file
start-servers.bat
```

This will:
- Start backend server on port 5000
- Start frontend server on port 5173
- Open both in separate windows

### 📞 **Getting Help**

If issues persist:
1. Check browser console (F12) for errors
2. Verify backend server is running
3. Check database has required data
4. Review the debug panel on quiz page

### ✅ **Success Indicators**

You'll know it's working when:
- ✅ Backend server shows "Server running on http://localhost:5000"
- ✅ Frontend loads without errors
- ✅ Quiz page shows questions instead of error
- ✅ Student can submit answers and see results
