import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeDatabase } from './db.js';
import { initializeSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import commentsRoutes from './routes/comments.js';
import tasksRoutes from './routes/tasks.js';
import mentorRoutes from './routes/mentor.js';
import studentRoutes from './routes/student.js';
import schedulesRoutes from './routes/schedules.js';
import doubtsRoutes from './routes/doubts.js';
import taskQuestionsRoutes from './routes/task-questions.js';
import usersRoutes from './routes/users.js';
import mcqRoutes from './routes/mcq.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/entries', commentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/doubts', doubtsRoutes);
app.use('/api/task-questions', taskQuestionsRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Initialize Socket.IO
    initializeSocket(server);
    console.log('Socket.IO initialized');

    server.listen(() => {
      console.log(`Server running on https://mentormatrix.onrender.com`);
      console.log(`WebSocket server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
