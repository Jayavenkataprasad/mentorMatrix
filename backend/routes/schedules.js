import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../db.js';
import { emitScheduleCreated, emitScheduleUpdated } from '../socket.js';

const router = express.Router();

// Create schedule (mentor only)
router.post('/', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { studentId, title, description, startTime, endTime, focusStack, isGroupSession } = req.body;
    const mentorId = req.user.id;

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, startTime, and endTime are required' });
    }

    // Create schedule
    const result = await runAsync(
      `INSERT INTO schedules (mentorId, studentId, title, description, startTime, endTime, focusStack, isGroupSession, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [mentorId, studentId || null, title, description || null, startTime, endTime, focusStack || null, isGroupSession ? 1 : 0]
    );

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [result.id]);

    // Emit real-time event
    if (studentId) {
      emitScheduleCreated(schedule, [studentId]);
    }

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Get schedules (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, mentorId, startDate, endDate, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = 'SELECT * FROM schedules WHERE 1=1';
    const params = [];

    // Authorization: mentors see their own schedules, students see assigned schedules
    if (userRole === 'mentor') {
      query += ' AND mentorId = ?';
      params.push(userId);
    } else if (userRole === 'student') {
      query += ' AND studentId = ?';
      params.push(userId);
    }

    // Filters
    if (studentId && userRole === 'mentor') {
      query += ' AND studentId = ?';
      params.push(studentId);
    }

    if (startDate) {
      query += ' AND startTime >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND endTime <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY startTime ASC';

    const schedules = await allAsync(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get single schedule
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Authorization check
    if (userRole === 'mentor' && schedule.mentorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (userRole === 'student' && schedule.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update schedule (mentor only)
router.put('/:id', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;
    const { title, description, startTime, endTime, focusStack, isGroupSession } = req.body;

    // Check authorization
    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.mentorId !== mentorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update schedule
    await runAsync(
      `UPDATE schedules SET title = ?, description = ?, startTime = ?, endTime = ?, focusStack = ?, isGroupSession = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title || schedule.title, description || schedule.description, startTime || schedule.startTime, 
       endTime || schedule.endTime, focusStack || schedule.focusStack, isGroupSession !== undefined ? isGroupSession : schedule.isGroupSession, id]
    );

    const updated = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    // Emit real-time event
    if (schedule.studentId) {
      emitScheduleUpdated(updated, [schedule.studentId]);
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Update schedule status (mentor or student)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate status
    if (!['scheduled', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get schedule
    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Authorization check
    if (userRole === 'mentor' && schedule.mentorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (userRole === 'student' && schedule.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update status
    await runAsync(
      'UPDATE schedules SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const updated = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    // Emit real-time event
    if (schedule.studentId) {
      emitScheduleUpdated(updated, [schedule.studentId]);
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ error: 'Failed to update schedule status' });
  }
});

// Delete schedule (mentor only)
router.delete('/:id', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;

    // Check authorization
    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.mentorId !== mentorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete schedule
    await runAsync('DELETE FROM schedules WHERE id = ?', [id]);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
