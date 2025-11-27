# Doubts & Q&A System - Feature Documentation

## 🎯 Overview

The Doubts & Q&A system enables students to ask questions about concepts and mentors to verify learning through concept-based questions on completed tasks. This creates a two-way communication channel for better learning outcomes.

## ✨ Key Features

### For Students

1. **Ask Doubts**
   - Ask questions about any concept
   - Provide detailed descriptions
   - Link doubts to specific tasks
   - Track doubt status (open → answered → resolved)

2. **View Mentor Answers**
   - See mentor's responses with resources
   - Track resolution status
   - Delete own doubts

3. **Answer Task Questions**
   - Respond to mentor's concept verification questions
   - Demonstrate understanding
   - Get feedback on answers

### For Mentors

1. **Review Student Doubts**
   - See all student doubts
   - Filter by status (open, answered, resolved)
   - Provide detailed answers with resources
   - Mark doubts as resolved

2. **Ask Concept Questions**
   - Ask questions about completed tasks
   - Verify student understanding
   - Assess learning depth
   - Track student responses

3. **Task Management**
   - View pending and completed tasks
   - See completion timestamps
   - Ask verification questions for completed tasks
   - Monitor student progress

## 📊 Database Schema

### Doubts Table
```sql
CREATE TABLE doubts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  mentorId INTEGER,
  taskId INTEGER,
  concept TEXT NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Doubt Answers Table
```sql
CREATE TABLE doubt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doubtId INTEGER NOT NULL,
  mentorId INTEGER NOT NULL,
  answer TEXT NOT NULL,
  resources TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Task Questions Table
```sql
CREATE TABLE task_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskId INTEGER NOT NULL,
  mentorId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  answeredAt DATETIME
);
```

### Updated Tasks Table
```sql
-- Added fields:
completedAt DATETIME,
concept TEXT
```

## 🔌 API Endpoints

### Doubts Endpoints

#### Create Doubt (Student)
```
POST /api/doubts
Authorization: Bearer {token}
Content-Type: application/json

{
  "concept": "React Hooks",
  "question": "How do I use useState?",
  "description": "I'm confused about how to manage state in functional components",
  "taskId": 1 (optional)
}

Response: 201 Created
{
  "id": 1,
  "studentId": 2,
  "mentorId": null,
  "taskId": 1,
  "concept": "React Hooks",
  "question": "How do I use useState?",
  "description": "I'm confused...",
  "status": "open",
  "createdAt": "2025-11-27T10:00:00Z"
}
```

#### Get Doubts
```
GET /api/doubts?status=open&concept=React
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "studentId": 2,
    "studentName": "John Student",
    "concept": "React Hooks",
    "question": "How do I use useState?",
    "status": "open",
    "answers": []
  }
]
```

#### Get Single Doubt
```
GET /api/doubts/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "studentId": 2,
  "studentName": "John Student",
  "concept": "React Hooks",
  "question": "How do I use useState?",
  "description": "I'm confused...",
  "status": "answered",
  "answers": [
    {
      "id": 1,
      "doubtId": 1,
      "mentorId": 1,
      "mentorName": "Jane Mentor",
      "answer": "useState is a hook that lets you add state to functional components...",
      "resources": "https://react.dev/reference/react/useState",
      "createdAt": "2025-11-27T11:00:00Z"
    }
  ]
}
```

#### Add Answer to Doubt (Mentor)
```
POST /api/doubts/:id/answers
Authorization: Bearer {token}
Content-Type: application/json

{
  "answer": "useState is a hook that lets you add state to functional components...",
  "resources": "https://react.dev/reference/react/useState"
}

Response: 201 Created
{
  "id": 1,
  "doubtId": 1,
  "mentorId": 1,
  "answer": "useState is a hook...",
  "resources": "https://react.dev/reference/react/useState",
  "createdAt": "2025-11-27T11:00:00Z"
}
```

#### Update Doubt Status (Mentor)
```
PATCH /api/doubts/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "resolved"
}

Response: 200 OK
{
  "id": 1,
  "status": "resolved",
  "updatedAt": "2025-11-27T12:00:00Z"
}
```

#### Delete Doubt (Student)
```
DELETE /api/doubts/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Doubt deleted successfully"
}
```

### Task Questions Endpoints

#### Create Task Question (Mentor)
```
POST /api/task-questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskId": 1,
  "studentId": 2,
  "question": "Can you explain how you implemented the state management?"
}

Response: 201 Created
{
  "id": 1,
  "taskId": 1,
  "mentorId": 1,
  "studentId": 2,
  "question": "Can you explain how you implemented the state management?",
  "answer": null,
  "status": "pending",
  "createdAt": "2025-11-27T10:00:00Z"
}
```

#### Get Task Questions
```
GET /api/task-questions?taskId=1&status=pending
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "taskId": 1,
    "taskTitle": "Build React Todo App",
    "mentorId": 1,
    "mentorName": "Jane Mentor",
    "studentId": 2,
    "question": "Can you explain how you implemented the state management?",
    "answer": null,
    "status": "pending",
    "createdAt": "2025-11-27T10:00:00Z"
  }
]
```

#### Answer Task Question (Student)
```
PATCH /api/task-questions/:id/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "answer": "I used useState to manage the todo list and used useEffect to persist to localStorage..."
}

Response: 200 OK
{
  "id": 1,
  "answer": "I used useState to manage the todo list...",
  "status": "answered",
  "answeredAt": "2025-11-27T11:00:00Z"
}
```

#### Delete Task Question (Mentor)
```
DELETE /api/task-questions/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Question deleted successfully"
}
```

## 🎨 UI Components

### Student Pages

#### Doubts.jsx
- **Location:** `frontend/src/pages/student/Doubts.jsx`
- **Features:**
  - Create new doubt form
  - Filter doubts by status
  - View doubt details with mentor answers
  - Delete own doubts
  - Beautiful gradient UI with status badges

### Mentor Pages

#### DoubtsQA.jsx
- **Location:** `frontend/src/pages/mentor/DoubtsQA.jsx`
- **Features:**
  - Two tabs: Student Doubts & Task Questions
  - Filter by status
  - View doubt/question details
  - Add answers with resources
  - Mark doubts as resolved
  - Track student answers to task questions

#### TasksManagement.jsx
- **Location:** `frontend/src/pages/mentor/TasksManagement.jsx`
- **Features:**
  - Create and assign tasks
  - View pending tasks
  - View completed tasks with timestamps
  - Ask concept verification questions
  - Beautiful UI with status indicators

## 🔄 Workflow Examples

### Student Asking a Doubt

1. Student navigates to "My Doubts" page
2. Clicks "Ask a Doubt" button
3. Fills in concept, question, and description
4. Optionally links to a task
5. Submits the doubt
6. Doubt appears in "Open" status
7. Mentor reviews and provides answer
8. Student sees answer with resources
9. Doubt status changes to "Answered"
10. Mentor can mark as "Resolved"

### Mentor Verifying Learning

1. Mentor navigates to "Task Management"
2. Views completed tasks section
3. Clicks "Ask Questions" on a completed task
4. Enters a concept verification question
5. Question is sent to student
6. Student receives notification
7. Student navigates to their doubts/questions
8. Student answers the question
9. Mentor sees the answer
10. Mentor can provide feedback

## 🔐 Access Control

### Student Permissions
- ✅ Create own doubts
- ✅ View own doubts and mentor answers
- ✅ Delete own doubts
- ✅ Answer task questions from mentors
- ✅ View task questions and mentor feedback
- ❌ Cannot view other students' doubts
- ❌ Cannot answer other students' task questions

### Mentor Permissions
- ✅ View all student doubts
- ✅ Answer student doubts
- ✅ Mark doubts as resolved
- ✅ Create task questions for completed tasks
- ✅ View student answers
- ✅ Delete task questions
- ❌ Cannot delete student doubts
- ❌ Cannot create doubts (only students can)

## 📱 UI/UX Features

### Beautiful Design Elements
- Gradient backgrounds (blue to purple to pink)
- Color-coded status badges
- Smooth transitions and hover effects
- Responsive grid layouts
- Modal dialogs for detailed views
- Icon indicators for status

### Status Indicators
- **Open:** 🔴 Red - Waiting for mentor response
- **Answered:** 🟡 Yellow - Mentor has responded
- **Resolved:** 🟢 Green - Issue resolved
- **Pending:** 🔵 Blue - Waiting for student answer

### Interactive Elements
- Expandable doubt cards
- Filter buttons
- Tab navigation
- Modal dialogs
- Form inputs with validation
- Delete confirmations

## 🔔 Real-time Notifications

When integrated with Socket.IO:
- Student receives notification when mentor answers doubt
- Mentor receives notification when student answers question
- Doubts and questions appear in activity feed
- Real-time status updates

## 📊 Analytics & Tracking

### For Students
- Total doubts asked
- Doubts resolved
- Average response time
- Concepts covered

### For Mentors
- Total doubts answered
- Average answer time
- Student questions answered
- Learning verification rate

## 🚀 Integration Steps

### 1. Database Migration
```bash
# Delete existing database to recreate with new schema
rm backend/mentor_portal.db

# Restart backend to create new schema
npm run dev
```

### 2. Add Routes to App.jsx
```jsx
// Student routes
<Route path="/student/doubts" element={<Doubts />} />

// Mentor routes
<Route path="/mentor/doubts-qa" element={<DoubtsQA />} />
<Route path="/mentor/tasks" element={<TasksManagement />} />
```

### 3. Update Navbar
Add navigation links to:
- Student: "My Doubts"
- Mentor: "Doubts & Q&A" and "Task Management"

### 4. Test Features
- Create a doubt as student
- Answer doubt as mentor
- Create a task and mark as complete
- Ask question on completed task
- Answer task question as student

## 🎓 Learning Benefits

### For Students
- Clarify concepts with mentor
- Get personalized feedback
- Track learning progress
- Demonstrate understanding
- Build confidence

### For Mentors
- Understand student struggles
- Provide targeted help
- Verify learning outcomes
- Track student progress
- Identify knowledge gaps

## 📈 Future Enhancements

1. **AI-powered Suggestions**
   - Auto-suggest similar doubts
   - Recommend resources

2. **Peer Learning**
   - Allow students to answer each other's doubts
   - Community knowledge base

3. **Analytics Dashboard**
   - Track doubt resolution time
   - Identify common concepts
   - Student progress reports

4. **Notifications**
   - Email notifications for new doubts
   - Push notifications for answers
   - Digest emails

5. **Search & Discovery**
   - Full-text search on doubts
   - Tag-based organization
   - Doubt history

## 🆘 Troubleshooting

### Doubt not appearing
- Refresh the page
- Check network tab for API errors
- Verify you're logged in as correct role

### Cannot answer doubt
- Ensure you're logged in as mentor
- Check if doubt is still open
- Verify database connection

### Task question not sent
- Ensure task is marked as completed
- Check student ID is correct
- Verify mentor-student relationship

## 📝 Code Examples

### Create Doubt (Frontend)
```javascript
const handleCreateDoubt = async (e) => {
  e.preventDefault();
  try {
    await api.post('/doubts', {
      concept: 'React Hooks',
      question: 'How do I use useState?',
      description: 'I\'m confused about state management',
      taskId: 1
    });
    // Refresh doubts list
    fetchDoubts();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Answer Doubt (Frontend)
```javascript
const handleAnswerDoubt = async () => {
  try {
    await api.post(`/doubts/${doubtId}/answers`, {
      answer: 'useState is a hook that lets you add state...',
      resources: 'https://react.dev/reference/react/useState'
    });
    // Refresh doubt details
    fetchDoubt();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## ✅ Checklist

- [x] Database schema created
- [x] API endpoints implemented
- [x] Student Doubts page created
- [x] Mentor DoubtsQA page created
- [x] Task Management page created
- [x] Access control implemented
- [x] Beautiful UI with gradients
- [ ] Real-time notifications (Socket.IO)
- [ ] Email notifications
- [ ] Analytics dashboard

---

**Status:** ✅ Complete and Ready to Use
**Last Updated:** November 27, 2025
**Version:** 1.0.0
