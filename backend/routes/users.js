import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { allAsync } from '../db.js';

const router = express.Router();

// Get all students (mentor only)
router.get('/students', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const students = await allAsync(
      `SELECT id, name, email, createdAt FROM users WHERE role = 'student' ORDER BY createdAt DESC`
    );
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get all mentors (admin only - optional)
router.get('/mentors', authenticateToken, async (req, res) => {
  try {
    // Only allow admins or mentors to see other mentors
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const mentors = await allAsync(
      `SELECT id, name, email, createdAt FROM users WHERE role = 'mentor' ORDER BY createdAt DESC`
    );
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

export default router;
