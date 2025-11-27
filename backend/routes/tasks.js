import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAsync, runAsync, allAsync } from '../db.js';
import { emitTaskCompleted, emitTaskQuestionAdded } from '../socket.js';

const router = express.Router();

// Create task (mentor only)
router.post('/', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { studentId, title, description, dueDate } = req.body;
    const mentorId = req.user.id;

    if (!studentId || !title) {
      return res.status(400).json({ error: 'Student ID and title are required' });
    }

    const student = await getAsync('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { concept } = req.body;
    const result = await runAsync(
      'INSERT INTO tasks (mentorId, studentId, title, description, dueDate, concept) VALUES (?, ?, ?, ?, ?, ?)',
      [mentorId, studentId, title, description || null, dueDate || null, concept || null]
    );

    res.status(201).json({
      id: result.id,
      mentorId,
      studentId,
      title,
      description,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get tasks for student
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = 'SELECT t.*, u.name as mentorName FROM tasks t JOIN users u ON t.mentorId = u.id WHERE 1=1';
    const params = [];

    if (userRole === 'student') {
      query += ' AND t.studentId = ?';
      params.push(userId);
    } else if (studentId) {
      query += ' AND t.studentId = ?';
      params.push(studentId);
    }

    query += ' ORDER BY t.dueDate ASC, t.createdAt DESC';

    const tasks = await allAsync(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, completed } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only mentor who created it or the student can update
    if (userRole === 'mentor' && task.mentorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (userRole === 'student' && task.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (dueDate !== undefined) {
      updates.push('dueDate = ?');
      values.push(dueDate);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
      if (completed) {
        updates.push('completedAt = CURRENT_TIMESTAMP');
        
        // Emit real-time event when task is completed
        const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [id]);
        if (task) {
          emitTaskCompleted(task, task.studentId);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await runAsync(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (mentor only)
router.delete('/:id', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.mentorId !== mentorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get completed tasks for mentor
router.get('/completed', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const mentorId = req.user.id;

    const completedTasks = await allAsync(
      `SELECT t.*, u.name as studentName 
       FROM tasks t 
       JOIN users u ON t.studentId = u.id 
       WHERE t.mentorId = ? AND t.completed = 1 
       ORDER BY t.completedAt DESC`,
      [mentorId]
    );

    // Get questions for each task
    for (const task of completedTasks) {
      const questions = await allAsync(
        `SELECT tq.*, u.name as mentorName 
         FROM task_questions tq 
         JOIN users u ON tq.mentorId = u.id 
         WHERE tq.taskId = ? 
         ORDER BY tq.createdAt ASC`,
        [task.id]
      );
      task.questions = questions;
    }

    res.json(completedTasks);
  } catch (error) {
    console.error('Get completed tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  }
});

export default router;
