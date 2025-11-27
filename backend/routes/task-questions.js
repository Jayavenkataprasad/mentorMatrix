import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../db.js';
import { emitTaskQuestionAdded, emitTaskQuestionAnswered } from '../socket.js';

const router = express.Router();

// Create question about completed task (mentor only)
router.post('/', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { taskId, studentId, questionType, question, options, correctAnswer } = req.body;
    const mentorId = req.user.id;

    if (!taskId || !studentId || !question) {
      return res.status(400).json({ error: 'TaskId, studentId, and question are required' });
    }

    // Verify task exists and is completed
    const task = await getAsync('SELECT * FROM tasks WHERE id = ? AND completed = 1', [taskId]);

    if (!task) {
      return res.status(404).json({ error: 'Completed task not found' });
    }

    const result = await runAsync(
      `INSERT INTO task_questions (taskId, mentorId, studentId, question, questionType, options, correctAnswer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [taskId, mentorId, studentId, question, questionType || 'text', options || null, correctAnswer || null]
    );

    const taskQuestion = await getAsync('SELECT * FROM task_questions WHERE id = ?', [result.id]);

    // Emit real-time event
    emitTaskQuestionAdded(taskQuestion, studentId);

    res.status(201).json(taskQuestion);
  } catch (error) {
    console.error('Error creating task question:', error);
    res.status(500).json({ error: 'Failed to create task question' });
  }
});

// Get task questions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { taskId, status } = req.query;

    let query = `SELECT tq.*, t.title as taskTitle, u.name as mentorName 
                 FROM task_questions tq 
                 JOIN tasks t ON tq.taskId = t.id 
                 JOIN users u ON tq.mentorId = u.id 
                 WHERE 1=1`;
    const params = [];

    if (userRole === 'student') {
      query += ' AND tq.studentId = ?';
      params.push(userId);
    } else if (userRole === 'mentor') {
      query += ' AND tq.mentorId = ?';
      params.push(userId);
    }

    if (taskId) {
      query += ' AND tq.taskId = ?';
      params.push(taskId);
    }

    if (status) {
      query += ' AND tq.status = ?';
      params.push(status);
    }

    query += ' ORDER BY tq.createdAt DESC';

    const questions = await allAsync(query, params);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching task questions:', error);
    res.status(500).json({ error: 'Failed to fetch task questions' });
  }
});

// Get single task question
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const question = await getAsync(
      `SELECT tq.*, t.title as taskTitle, u.name as mentorName 
       FROM task_questions tq 
       JOIN tasks t ON tq.taskId = t.id 
       JOIN users u ON tq.mentorId = u.id 
       WHERE tq.id = ?`,
      [id]
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Authorization check
    if (userRole === 'student' && question.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (userRole === 'mentor' && question.mentorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching task question:', error);
    res.status(500).json({ error: 'Failed to fetch task question' });
  }
});

// Answer task question (student only)
router.patch('/:id/answer', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, studentAnswer } = req.body;
    const studentId = req.user.id;

    if (!answer && !studentAnswer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Get question details
    const question = await getAsync('SELECT * FROM task_questions WHERE id = ?', [id]);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.studentId !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let isCorrect = 0;
    let finalAnswer = answer || studentAnswer;

    // For MCQ questions, check if answer is correct
    if (question.questionType === 'mcq' && studentAnswer) {
      isCorrect = studentAnswer === question.correctAnswer ? 1 : 0;
    }

    // Update question with answer
    await runAsync(
      `UPDATE task_questions 
       SET answer = ?, studentAnswer = ?, status = 'answered', answeredAt = CURRENT_TIMESTAMP, isCorrect = ?
       WHERE id = ?`,
      [finalAnswer, studentAnswer || null, isCorrect, id]
    );

    const updatedQuestion = await getAsync('SELECT * FROM task_questions WHERE id = ?', [id]);

    // Emit real-time event
    emitTaskQuestionAnswered(updatedQuestion, question.mentorId);

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error answering task question:', error);
    res.status(500).json({ error: 'Failed to answer task question' });
  }
});

// Delete task question (mentor only)
router.delete('/:id', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;

    const question = await getAsync('SELECT * FROM task_questions WHERE id = ?', [id]);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.mentorId !== mentorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await runAsync('DELETE FROM task_questions WHERE id = ?', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting task question:', error);
    res.status(500).json({ error: 'Failed to delete task question' });
  }
});

export default router;
