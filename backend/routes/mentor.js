import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAsync, runAsync, allAsync } from '../db.js';

const router = express.Router();

// Get all students for mentor
router.get('/students', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Get students assigned to this mentor
    const students = await allAsync(
      `SELECT DISTINCT u.id, u.name, u.email, u.createdAt 
       FROM users u 
       JOIN entries e ON u.id = e.studentId 
       WHERE u.role = 'student' 
       UNION 
       SELECT DISTINCT u.id, u.name, u.email, u.createdAt 
       FROM users u 
       JOIN tasks t ON u.id = t.studentId 
       WHERE u.role = 'student' AND t.mentorId = ?
       ORDER BY u.name`,
      [mentorId]
    );

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get analytics for mentor dashboard
router.get('/analytics', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Total entries submitted by students
    const totalEntries = await getAsync(
      `SELECT COUNT(*) as count FROM entries e 
       JOIN tasks t ON e.studentId = t.studentId 
       WHERE t.mentorId = ?`,
      [mentorId]
    );

    // Get entries by status
    const entriesByStatus = await allAsync(
      `SELECT e.status, COUNT(*) as count FROM entries e 
       JOIN tasks t ON e.studentId = t.studentId 
       WHERE t.mentorId = ? 
       GROUP BY e.status`,
      [mentorId]
    );

    // Recent submissions
    const recentSubmissions = await allAsync(
      `SELECT e.*, u.name as studentName FROM entries e 
       JOIN users u ON e.studentId = u.id 
       JOIN tasks t ON e.studentId = t.studentId 
       WHERE t.mentorId = ? 
       ORDER BY e.createdAt DESC LIMIT 5`,
      [mentorId]
    );

    // Active students (with entries in last 7 days)
    const activeStudents = await getAsync(
      `SELECT COUNT(DISTINCT e.studentId) as count FROM entries e 
       JOIN tasks t ON e.studentId = t.studentId 
       WHERE t.mentorId = ? AND e.createdAt >= datetime('now', '-7 days')`,
      [mentorId]
    );

    // Weekly submission count
    const weeklyData = await allAsync(
      `SELECT 
        strftime('%w', e.createdAt) as dayOfWeek,
        COUNT(*) as count 
       FROM entries e 
       JOIN tasks t ON e.studentId = t.studentId 
       WHERE t.mentorId = ? AND e.createdAt >= datetime('now', '-7 days')
       GROUP BY dayOfWeek
       ORDER BY dayOfWeek`,
      [mentorId]
    );

    res.json({
      totalEntries: totalEntries?.count || 0,
      entriesByStatus: entriesByStatus || [],
      recentSubmissions: recentSubmissions.map(e => ({
        ...e,
        tags: e.tags ? JSON.parse(e.tags) : [],
        resources: e.resources ? JSON.parse(e.resources) : []
      })),
      activeStudents: activeStudents?.count || 0,
      weeklyData: weeklyData || []
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get student's learning streak
router.get('/student/:studentId/streak', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all entry dates for the student
    const entries = await allAsync(
      `SELECT DISTINCT DATE(createdAt) as date FROM entries WHERE studentId = ? ORDER BY date DESC`,
      [studentId]
    );

    if (entries.length === 0) {
      return res.json({ streak: 0, totalDays: 0 });
    }

    let streak = 0;
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

    res.json({ streak, totalDays: entries.length });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

export default router;
