import express from 'express';
import { getAsync, runAsync, allAsync } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all MCQ questions for an entry (mentor only)
router.get('/entries/:entryId/questions', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const user = req.user;

    // Verify user is a mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can view questions' });
    }

    const questions = await allAsync(
      `SELECT mq.*, u.name as mentorName 
       FROM mcq_questions mq 
       JOIN users u ON mq.mentorId = u.id 
       WHERE mq.entryId = ? 
       ORDER BY mq.createdAt`,
      [entryId]
    );

    // Parse options from JSON
    const questionsWithParsedOptions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json(questionsWithParsedOptions);
  } catch (error) {
    console.error('Error fetching MCQ questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get MCQ questions for student (only after deadline)
router.get('/entries/:entryId/questions/student', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const user = req.user;

    console.log(`Student ${user.id} requesting questions for entry ${entryId}`);

    // Verify user is a student
    if (user.role !== 'student') {
      console.log(`Access denied: User ${user.id} is not a student`);
      return res.status(403).json({ error: 'Only students can view questions' });
    }

    // Check if entry belongs to the student
    const entry = await getAsync(
      'SELECT * FROM entries WHERE id = ? AND studentId = ?',
      [entryId, user.id]
    );

    if (!entry) {
      console.log(`Entry not found: Entry ${entryId} not found for student ${user.id}`);
      return res.status(404).json({ error: 'Entry not found or you do not have access to this entry' });
    }

    console.log(`Entry found: ${entry.title}, deadline: ${entry.deadline}`);

    // Check if deadline has passed
    if (entry.deadline && new Date(entry.deadline) > new Date()) {
      const deadlineDate = new Date(entry.deadline);
      const now = new Date();
      console.log(`Deadline not reached: ${deadlineDate} > ${now}`);
      return res.status(403).json({ 
        error: `Questions not available until deadline: ${deadlineDate.toLocaleString()}` 
      });
    }

    // Check if student has already attempted this quiz
    const existingAnswers = await getAsync(
      'SELECT COUNT(*) as count FROM mcq_answers WHERE studentId = ?',
      [user.id]
    );

    // Check if this specific entry has been attempted
    const entryAttemptCheck = await getAsync(
      `SELECT COUNT(*) as count FROM mcq_answers ma 
       JOIN mcq_questions mq ON ma.questionId = mq.id 
       WHERE ma.studentId = ? AND mq.entryId = ?`,
      [user.id, entryId]
    );

    if (entryAttemptCheck.count > 0) {
      console.log(`Student ${user.id} has already attempted quiz for entry ${entryId}`);
      return res.status(403).json({ 
        error: 'You have already attempted this quiz. You can only take it once.' 
      });
    }

    const questions = await allAsync(
      `SELECT mq.id, mq.question, mq.options, mq.points 
       FROM mcq_questions mq 
       WHERE mq.entryId = ? 
       ORDER BY mq.createdAt`,
      [entryId]
    );

    console.log(`Found ${questions.length} questions for entry ${entryId}`);

    // Parse options from JSON and remove correctAnswer
    const questionsForStudent = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json(questionsForStudent);
  } catch (error) {
    console.error('Error fetching MCQ questions for student:', error);
    res.status(500).json({ error: 'Failed to fetch questions: ' + error.message });
  }
});

// Create MCQ question (mentor only)
router.post('/entries/:entryId/questions', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { question, options, correctAnswer, points } = req.body;
    const user = req.user;

    // Verify user is a mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can create questions' });
    }

    // Validate input
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options are required' });
    }

    if (typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ error: 'Valid correct answer index is required' });
    }

    // Verify entry exists
    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [entryId]);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const result = await runAsync(
      `INSERT INTO mcq_questions (entryId, mentorId, question, options, correctAnswer, points) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entryId, user.id, question, JSON.stringify(options), correctAnswer, points || 1]
    );

    res.status(201).json({
      id: result.id,
      entryId,
      mentorId: user.id,
      question,
      options,
      correctAnswer,
      points: points || 1
    });
  } catch (error) {
    console.error('Error creating MCQ question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update MCQ question (mentor only)
router.put('/questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options, correctAnswer, points } = req.body;
    const user = req.user;

    // Verify user is a mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can update questions' });
    }

    // Verify question exists and belongs to mentor
    const existingQuestion = await getAsync(
      'SELECT * FROM mcq_questions WHERE id = ? AND mentorId = ?',
      [questionId, user.id]
    );

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Validate input
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options are required' });
    }

    if (typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ error: 'Valid correct answer index is required' });
    }

    await runAsync(
      `UPDATE mcq_questions 
       SET question = ?, options = ?, correctAnswer = ?, points = ? 
       WHERE id = ?`,
      [question, JSON.stringify(options), correctAnswer, points || 1, questionId]
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating MCQ question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete MCQ question (mentor only)
router.delete('/questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const user = req.user;

    // Verify user is a mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can delete questions' });
    }

    // Verify question exists and belongs to mentor
    const existingQuestion = await getAsync(
      'SELECT * FROM mcq_questions WHERE id = ? AND mentorId = ?',
      [questionId, user.id]
    );

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await runAsync('DELETE FROM mcq_questions WHERE id = ?', [questionId]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCQ question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Submit MCQ answers (student only)
router.post('/entries/:entryId/answers', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }
    const user = req.user;

    // Verify user is a student
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit answers' });
    }

    // Check if entry belongs to the student
    const entry = await getAsync(
      'SELECT * FROM entries WHERE id = ? AND studentId = ?',
      [entryId, user.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check if deadline has passed
    if (entry.deadline && new Date(entry.deadline) > new Date()) {
      return res.status(403).json({ error: 'Cannot submit answers before deadline' });
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    let totalPoints = 0;
    const results = [];

    for (const answer of answers) {
      const { questionId, selectedAnswer } = answer;

      // Get the question with correct answer
      const question = await getAsync(
        'SELECT * FROM mcq_questions WHERE id = ? AND entryId = ?',
        [questionId, entryId]
      );

      if (!question) {
        return res.status(404).json({ error: `Question ${questionId} not found` });
      }

      // Check if student has already answered this question
      const existingAnswer = await getAsync(
        'SELECT * FROM mcq_answers WHERE questionId = ? AND studentId = ?',
        [questionId, user.id]
      );

      if (existingAnswer) {
        return res.status(400).json({ error: `Question ${questionId} already answered` });
      }

      // Check if answer is correct
      const isCorrect = selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      totalPoints += pointsEarned;

      // Save the answer
      await runAsync(
        'INSERT INTO mcq_answers (questionId, studentId, selectedAnswer, isCorrect, points) VALUES (?, ?, ?, ?, ?)',
        [questionId, user.id, selectedAnswer, isCorrect, pointsEarned]
      );

      results.push({
        questionId,
        selectedAnswer,
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer
      });
    }

    res.json({
      message: 'Answers submitted successfully',
      results,
      totalPoints
    });
  } catch (error) {
    console.error('Error submitting MCQ answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// Get student's answers for an entry (student only)
router.get('/entries/:entryId/answers', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const user = req.user;

    // Verify user is a student
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their answers' });
    }

    // Check if entry belongs to the student
    const entry = await getAsync(
      'SELECT * FROM entries WHERE id = ? AND studentId = ?',
      [entryId, user.id]
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const answers = await allAsync(
      `SELECT ma.*, mq.question, mq.options 
       FROM mcq_answers ma 
       JOIN mcq_questions mq ON ma.questionId = mq.id 
       WHERE ma.studentId = ? AND mq.entryId = ?`,
      [user.id, entryId]
    );

    const answersWithParsedOptions = answers.map(a => ({
      ...a,
      options: JSON.parse(a.options)
    }));

    res.json(answersWithParsedOptions);
  } catch (error) {
    console.error('Error fetching MCQ answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// Get all student answers for an entry (mentor only)
router.get('/entries/:entryId/student-answers', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const user = req.user;

    // Verify user is a mentor
    if (user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can view student answers' });
    }

    const answers = await allAsync(
      `SELECT ma.*, u.name as studentName, mq.question, mq.options, mq.correctAnswer 
       FROM mcq_answers ma 
       JOIN users u ON ma.studentId = u.id 
       JOIN mcq_questions mq ON ma.questionId = mq.id 
       WHERE mq.entryId = ? 
       ORDER BY u.name, mq.createdAt`,
      [entryId]
    );

    const answersWithParsedOptions = answers.map(a => ({
      ...a,
      options: JSON.parse(a.options)
    }));

    res.json(answersWithParsedOptions);
  } catch (error) {
    console.error('Error fetching student MCQ answers:', error);
    res.status(500).json({ error: 'Failed to fetch student answers' });
  }
});

export default router;
