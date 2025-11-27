import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAsync, runAsync, allAsync } from '../db.js';

const router = express.Router();

// Add comment (mentor only)
router.post('/:entryId/comments', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { entryId } = req.params;
    const { message } = req.body;
    const mentorId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [entryId]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const result = await runAsync(
      'INSERT INTO comments (entryId, mentorId, message) VALUES (?, ?, ?)',
      [entryId, mentorId, message]
    );

    res.status(201).json({
      id: result.id,
      entryId,
      mentorId,
      message,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments for entry
router.get('/:entryId/comments', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [entryId]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const comments = await allAsync(
      'SELECT c.*, u.name as mentorName FROM comments c JOIN users u ON c.mentorId = u.id WHERE c.entryId = ? ORDER BY c.createdAt DESC',
      [entryId]
    );

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
