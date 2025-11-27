import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAsync, runAsync, allAsync } from '../db.js';

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    // Total entries
    const totalEntries = await getAsync(
      'SELECT COUNT(*) as count FROM entries WHERE studentId = ?',
      [studentId]
    );

    // Entries by status
    const entriesByStatus = await allAsync(
      'SELECT status, COUNT(*) as count FROM entries WHERE studentId = ? GROUP BY status',
      [studentId]
    );

    // Doubts statistics
    const totalDoubts = await getAsync(
      'SELECT COUNT(*) as count FROM doubts WHERE studentId = ?',
      [studentId]
    );

    const resolvedDoubts = await getAsync(
      'SELECT COUNT(*) as count FROM doubts WHERE studentId = ? AND status = "resolved"',
      [studentId]
    );

    const doubtsByStatus = await allAsync(
      'SELECT status, COUNT(*) as count FROM doubts WHERE studentId = ? GROUP BY status',
      [studentId]
    );

    // Learning streak
    const entries = await allAsync(
      'SELECT DISTINCT DATE(createdAt) as date FROM entries WHERE studentId = ? ORDER BY date DESC',
      [studentId]
    );

    let streak = 0;
    if (entries.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        const diffTime = currentDate - entryDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
          streak++;
          currentDate = entryDate;
        } else {
          break;
        }
      }
    }

    // Weekly data
    const weeklyData = await allAsync(
      `SELECT 
        strftime('%w', createdAt) as dayOfWeek,
        COUNT(*) as count 
       FROM entries 
       WHERE studentId = ? AND createdAt >= datetime('now', '-7 days')
       GROUP BY dayOfWeek
       ORDER BY dayOfWeek`,
      [studentId]
    );

    // Recent entries
    const recentEntries = await allAsync(
      'SELECT * FROM entries WHERE studentId = ? ORDER BY createdAt DESC LIMIT 5',
      [studentId]
    );

    // Pending tasks
    const pendingTasks = await allAsync(
      'SELECT * FROM tasks WHERE studentId = ? AND completed = 0 ORDER BY dueDate ASC',
      [studentId]
    );

    res.json({
      totalEntries: totalEntries?.count || 0,
      entriesByStatus: entriesByStatus || [],
      totalDoubts: totalDoubts?.count || 0,
      resolvedDoubts: resolvedDoubts?.count || 0,
      doubtsByStatus: doubtsByStatus || [],
      streak,
      totalDays: entries.length,
      weeklyData: weeklyData || [],
      recentEntries: recentEntries.map(e => ({
        ...e,
        tags: e.tags ? JSON.parse(e.tags) : [],
        resources: e.resources ? JSON.parse(e.resources) : []
      })),
      pendingTasks: pendingTasks || []
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
