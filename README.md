# Student Mentoring Portal

A full-stack web application that helps students document their daily learning and doubts, while providing mentors an easy dashboard to review progress, give feedback, and track student activity.

## Features

### Student Features
- ✅ User authentication (Login/Signup)
- ✅ Create daily learning entries with title, description, tags, and resources
- ✅ Edit and delete their own entries
- ✅ View mentor feedback and comments
- ✅ Track learning streak (consecutive active days)
- ✅ Dashboard with weekly progress chart
- ✅ View and manage assigned tasks
- ✅ Filter entries by status and tags

### Mentor Features
- ✅ Login and view assigned students
- ✅ Access each student's learning logs
- ✅ Filter logs by tags, status, date, and student
- ✅ Add comments/feedback on entries
- ✅ Update entry status (Pending, Reviewed, Needs Work, Approved)
- ✅ Assign tasks with due dates to students
- ✅ Dashboard with analytics:
  - Total entries submitted
  - Active vs inactive students
  - Weekly submission chart
  - Recent submissions list
  - Entry status distribution

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Project Structure

```
Mentorproject/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── entries.js
│   │   ├── comments.js
│   │   ├── tasks.js
│   │   ├── mentor.js
│   │   └── student.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── student/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Entries.jsx
    │   │   │   ├── CreateEntry.jsx
    │   │   │   ├── EntryDetail.jsx
    │   │   │   └── Tasks.jsx
    │   │   └── mentor/
    │   │       ├── Dashboard.jsx
    │   │       ├── Students.jsx
    │   │       ├── StudentActivity.jsx
    │   │       ├── EntryReview.jsx
    │   │       └── TaskAssignment.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created with defaults):
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Demo Credentials

### Student Account
- **Email:** student@example.com
- **Password:** password123

### Mentor Account
- **Email:** mentor@example.com
- **Password:** password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Entries (Learning Logs)
- `POST /api/entries` - Create entry (student)
- `GET /api/entries` - Get entries with filters
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry (student)
- `DELETE /api/entries/:id` - Delete entry (student)
- `PATCH /api/entries/:id/status` - Update status (mentor)

### Comments (Feedback)
- `POST /api/entries/:entryId/comments` - Add comment (mentor)
- `GET /api/entries/:entryId/comments` - Get comments

### Tasks
- `POST /api/tasks` - Create task (mentor)
- `GET /api/tasks` - Get tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (mentor)

### Mentor Dashboard
- `GET /api/mentor/students` - Get assigned students
- `GET /api/mentor/analytics` - Get dashboard analytics
- `GET /api/mentor/student/:studentId/streak` - Get student streak

### Student Dashboard
- `GET /api/student/dashboard` - Get student dashboard data

## Database Schema

### Users
- id (Primary Key)
- name
- email (Unique)
- passwordHash
- role (student/mentor)
- createdAt

### Entries
- id (Primary Key)
- studentId (Foreign Key)
- title
- body
- tags (JSON)
- resources (JSON)
- status (pending/reviewed/needs_work/approved)
- createdAt
- updatedAt

### Comments
- id (Primary Key)
- entryId (Foreign Key)
- mentorId (Foreign Key)
- message
- createdAt

### Tasks
- id (Primary Key)
- mentorId (Foreign Key)
- studentId (Foreign Key)
- title
- description
- dueDate
- completed (Boolean)
- createdAt

### Mentor_Students
- id (Primary Key)
- mentorId (Foreign Key)
- studentId (Foreign Key)
- createdAt

## Key Features Explained

### Learning Streak
Tracks consecutive days a student has submitted entries. The streak resets if a day is missed.

### Entry Status Workflow
1. **Pending** - Entry submitted, awaiting mentor review
2. **Reviewed** - Mentor has reviewed the entry
3. **Needs Work** - Mentor feedback suggests improvements
4. **Approved** - Entry meets all requirements

### Task Management
Mentors can assign tasks with optional due dates. Students can mark tasks as complete.

### Analytics Dashboard
Mentors get insights into:
- Total entries submitted by their students
- Distribution of entry statuses
- Weekly submission trends
- Active student count
- Recent submissions

## Security Features

- JWT-based authentication with 7-day expiration
- Password hashing using bcryptjs
- Role-based access control (RBAC)
- Protected API endpoints
- CORS enabled for frontend-backend communication
- Foreign key constraints in database

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination support for entries
- Efficient query filtering
- Client-side caching of auth tokens

## Future Enhancements

- Email notifications for feedback
- Real-time notifications using WebSockets
- Advanced analytics and reporting
- File upload support for resources
- Peer review system
- Gamification (badges, leaderboards)
- Mobile app
- Dark mode
- Multi-language support

## Troubleshooting

### Backend won't start
- Ensure port 5000 is not in use
- Check Node.js version (v16+)
- Verify all dependencies are installed

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify proxy configuration in vite.config.js

### Database issues
- Delete `mentor_portal.db` to reset database
- Check file permissions in backend directory
- Ensure SQLite is properly installed

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues or questions, please create an issue in the repository.
