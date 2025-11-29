import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../db.js';
import {
  emitDoubtCreatedToMentorsAndStudent,
  emitDoubtAnsweredToMentorsAndStudent,
  emitDoubtResolvedToMentorsAndStudent
} from '../socket.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Doubts route is working', timestamp: new Date() });
});

// Create doubt (student only)
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    console.log('Creating doubt with body:', req.body);
    console.log('User info:', req.user);
    
    const { 
      concept, 
      question, 
      description, 
      taskId, 
      doubtType, 
      subject, 
      techStack, 
      projectName, 
      priority 
    } = req.body;
    const studentId = req.user.id;

    if (!concept || !question) {
      return res.status(400).json({ error: 'Concept and question are required' });
    }

    console.log('All validations passed, inserting into database...');

    const result = await runAsync(
      `INSERT INTO doubts (
        studentId, concept, question, description, taskId, 
        doubtType, subject, techStack, projectName, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        studentId, 
        concept, 
        question, 
        description || null, 
        taskId || null,
        doubtType || 'concept',
        subject || null,
        techStack || null,
        projectName || null,
        priority || 'medium'
      ]
    );

    console.log('Insert result:', result);

    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [result.id]);
    console.log('Retrieved doubt:', doubt);

    // Emit real-time event to mentors and the student
    try {
      emitDoubtCreatedToMentorsAndStudent(doubt, studentId);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Continue even if socket fails
    }

    res.status(201).json(doubt);
  } catch (error) {
    console.error('Error creating doubt:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create doubt', details: error.message });
  }
});

// Get doubts (mentor sees all, student sees own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, concept, priority, doubtType, subject } = req.query;

    let query = 'SELECT d.*, u.name as studentName FROM doubts d JOIN users u ON d.studentId = u.id WHERE 1=1';
    const params = [];

    if (userRole === 'student') {
      query += ' AND d.studentId = ?';
      params.push(userId);
    } else if (userRole === 'mentor') {
      query += ' AND (d.mentorId IS NULL)';
    }

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND d.priority = ?';
      params.push(priority);
    }

    if (doubtType) {
      query += ' AND d.doubtType = ?';
      params.push(doubtType);
    }

    if (subject) {
      query += ' AND d.subject LIKE ?';
      params.push(`%${subject}%`);
    }

    if (concept) {
      query += ' AND d.concept LIKE ?';
      params.push(`%${concept}%`);
    }

    // Order by priority (high first) then by creation date (newest first)
    query += ' ORDER BY CASE WHEN d.priority = "high" THEN 1 WHEN d.priority = "medium" THEN 2 ELSE 3 END, d.createdAt DESC';

    const doubts = await allAsync(query, params);
    res.json(doubts);
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ error: 'Failed to fetch doubts' });
  }
});

// Get single doubt
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const doubt = await getAsync(
      `SELECT d.*, u.name as studentName FROM doubts d 
       JOIN users u ON d.studentId = u.id WHERE d.id = ?`,
      [id]
    );

    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    // Authorization check
    if (userRole === 'student' && doubt.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (userRole === 'mentor' && doubt.mentorId && doubt.mentorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get answers
    const answers = await allAsync(
      `SELECT da.*, u.name as mentorName FROM doubt_answers da 
       JOIN users u ON da.mentorId = u.id WHERE da.doubtId = ? ORDER BY da.createdAt ASC`,
      [id]
    );

    doubt.answers = answers;
    res.json(doubt);
  } catch (error) {
    console.error('Error fetching doubt:', error);
    res.status(500).json({ error: 'Failed to fetch doubt' });
  }
});

// Add answer to doubt (mentor only)
router.post('/:id/answers', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, resources, voiceNoteUrl, attachments } = req.body;
    const mentorId = req.user.id;

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Get doubt and assign to mentor
    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [id]);

    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    // Assign mentor if not already assigned
    if (!doubt.mentorId) {
      await runAsync('UPDATE doubts SET mentorId = ? WHERE id = ?', [mentorId, id]);
    }

    // Create answer
    const result = await runAsync(
      `INSERT INTO doubt_answers (doubtId, mentorId, answer, resources, voiceNoteUrl, attachments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, mentorId, answer, resources || null, voiceNoteUrl || null, attachments ? JSON.stringify(attachments) : null]
    );

    // Update doubt status to answered
    await runAsync('UPDATE doubts SET status = ? WHERE id = ?', ['answered', id]);

    const doubtAnswer = await getAsync('SELECT * FROM doubt_answers WHERE id = ?', [result.id]);

    // Re-fetch doubt with latest status
    const updatedDoubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [id]);

    // Emit real-time event to mentors and the student
    emitDoubtAnsweredToMentorsAndStudent(
      updatedDoubt,
      doubtAnswer,
      doubt.studentId
    );

    res.status(201).json(doubtAnswer);
  } catch (error) {
    console.error('Error adding answer:', error);
    res.status(500).json({ error: 'Failed to add answer' });
  }
});

// Rate answer (student only)
router.post('/:id/answers/:answerId/rate', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id, answerId } = req.params;
    const { rating, feedback } = req.body;
    const studentId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify doubt belongs to student
    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ? AND studentId = ?', [id, studentId]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found or unauthorized' });
    }

    // Update answer rating
    await runAsync(
      'UPDATE doubt_answers SET rating = ?, feedback = ? WHERE id = ? AND doubtId = ?',
      [rating, feedback || null, answerId, id]
    );

    // Update doubt status to resolved
    await runAsync('UPDATE doubts SET status = ? WHERE id = ?', ['resolved', id]);

    const updatedAnswer = await getAsync('SELECT * FROM doubt_answers WHERE id = ?', [answerId]);

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error rating answer:', error);
    res.status(500).json({ error: 'Failed to rate answer' });
  }
});

// Update doubt status (mentor only)
router.patch('/:id/status', authenticateToken, authorizeRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'answered', 'resolved', 'needs_more_explanation'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await runAsync('UPDATE doubts SET status = ? WHERE id = ?', [status, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const updatedDoubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [id]);

    // Emit real-time event to mentors and the student
    if (status === 'resolved') {
      emitDoubtResolvedToMentorsAndStudent(updatedDoubt, updatedDoubt.studentId);
    }

    res.json(updatedDoubt);
  } catch (error) {
    console.error('Error updating doubt status:', error);
    res.status(500).json({ error: 'Failed to update doubt status' });
  }
});

// Mark doubt as needing more explanation (student only)
router.patch('/:id/needs-more', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Verify doubt belongs to student
    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ? AND studentId = ?', [id, studentId]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found or unauthorized' });
    }

    // Only allow "needs more explanation" if doubt is answered
    if (doubt.status !== 'answered') {
      return res.status(400).json({ error: 'Can only request more explanation for answered doubts' });
    }

    // Update doubt status
    const result = await runAsync('UPDATE doubts SET status = ? WHERE id = ?', ['needs_more_explanation', id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    const updatedDoubt = await getAsync('SELECT * FROM doubts WHERE id = ?', [id]);

    // Emit real-time event to mentors and the student
    try {
      emitDoubtAnsweredToMentorsAndStudent(
        updatedDoubt,
        null, // no new answer, just status change
        studentId
      );
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Continue even if socket fails
    }

    res.json(updatedDoubt);
  } catch (error) {
    console.error('Error marking doubt as needing more explanation:', error);
    res.status(500).json({ error: 'Failed to update doubt' });
  }
});

// Delete doubt (student only)
router.delete('/:id', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Verify doubt belongs to student
    const doubt = await getAsync('SELECT * FROM doubts WHERE id = ? AND studentId = ?', [id, studentId]);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found or unauthorized' });
    }

    // Delete doubt and related answers
    await runAsync('DELETE FROM doubt_answers WHERE doubtId = ?', [id]);
    const result = await runAsync('DELETE FROM doubts WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }

    // Emit real-time event to mentors
    try {
      emitDoubtCreatedToMentorsAndStudent(doubt, studentId); // Reuse existing function
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Continue even if socket fails
    }

    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    res.status(500).json({ error: 'Failed to delete doubt' });
  }
});

export default router;
