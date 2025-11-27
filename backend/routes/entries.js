import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAsync, runAsync, allAsync } from '../db.js';

const router = express.Router();

// Create entry (student only)
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { title, body, tags, resources } = req.body;
    const studentId = req.user.id;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const tagsStr = tags ? JSON.stringify(tags) : null;
    const resourcesStr = resources ? JSON.stringify(resources) : null;

    const result = await runAsync(
      'INSERT INTO entries (studentId, title, body, tags, resources) VALUES (?, ?, ?, ?, ?)',
      [studentId, title, body, tagsStr, resourcesStr]
    );

    res.status(201).json({
      id: result.id,
      studentId,
      title,
      body,
      tags: tags || [],
      resources: resources || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Get entries with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, tag, status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = 'SELECT e.*, u.name as studentName FROM entries e JOIN users u ON e.studentId = u.id WHERE 1=1';
    const params = [];

    // Students can only see their own entries
    if (userRole === 'student') {
      query += ' AND e.studentId = ?';
      params.push(userId);
    } else if (studentId) {
      // Mentors can filter by student
      query += ' AND e.studentId = ?';
      params.push(studentId);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (tag) {
      query += " AND json_extract(e.tags, '$[*]') LIKE ?";
      params.push(`%${tag}%`);
    }

    query += ' ORDER BY e.createdAt DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const entries = await allAsync(query, params);

    const formattedEntries = entries.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : [],
      resources: e.resources ? JSON.parse(e.resources) : []
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get single entry
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const entry = await getAsync(
      'SELECT e.*, u.name as studentName FROM entries e JOIN users u ON e.studentId = u.id WHERE e.id = ?',
      [id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check permissions
    if (userRole === 'student' && entry.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    entry.tags = entry.tags ? JSON.parse(entry.tags) : [];
    entry.resources = entry.resources ? JSON.parse(entry.resources) : [];

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Update entry (student only)
router.put('/:id', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tags, resources } = req.body;
    const userId = req.user.id;

    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tagsStr = tags ? JSON.stringify(tags) : entry.tags;
    const resourcesStr = resources ? JSON.stringify(resources) : entry.resources;

    await runAsync(
      'UPDATE entries SET title = ?, body = ?, tags = ?, resources = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title || entry.title, body || entry.body, tagsStr, resourcesStr, id]
    );

    res.json({ message: 'Entry updated successfully' });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry (student only)
router.delete('/:id', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await runAsync('DELETE FROM entries WHERE id = ?', [id]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Update entry status (mentor only)
router.patch('/:id/status', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'needs_work', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [id]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await runAsync('UPDATE entries SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
