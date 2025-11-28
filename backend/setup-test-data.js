import { initializeDatabase, runAsync, getAsync } from './db.js';

async function setupTestData() {
  try {
    const db = await initializeDatabase();
    
    // Get the test student ID
    const student = await getAsync('SELECT id FROM users WHERE email = ?', ['teststudent@gmail.com']);
    if (!student) {
      throw new Error('Test student not found');
    }
    
    // Get a mentor ID
    const mentor = await getAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['mentor']);
    if (!mentor) {
      throw new Error('No mentor found');
    }
    
    console.log(`Using student ID: ${student.id}, mentor ID: ${mentor.id}`);
    
    // Create a test entry with a deadline in the past
    const pastDeadline = new Date();
    pastDeadline.setMinutes(pastDeadline.getMinutes() - 10); // 10 minutes ago
    
    await runAsync(
      'INSERT INTO entries (studentId, title, body, tags, resources, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student.id, 'Test Entry for MCQ', 'This is a test entry for MCQ questions', '["test", "mcq"]', '[]', 'pending', pastDeadline.toISOString()]
    );
    
    // Get the entry ID we just created
    const entry = await getAsync('SELECT id FROM entries WHERE studentId = ? ORDER BY id DESC LIMIT 1', [student.id]);
    const entryId = entry.id;
    console.log(`Created entry ${entryId} with deadline: ${pastDeadline.toISOString()}`);
    
    // Add a question for this entry
    await runAsync(
      'INSERT INTO mcq_questions (entryId, mentorId, question, options, correctAnswer, points) VALUES (?, ?, ?, ?, ?, ?)',
      [entryId, mentor.id, 'What is 2 + 2?', '["3", "4", "5", "6"]', 1, 5]
    );
    
    console.log('Added MCQ question for the entry');
    console.log('\nTest setup complete!');
    console.log('Student can now login with:');
    console.log('Email: teststudent@gmail.com');
    console.log('Password: password123');
    console.log(`And access quiz at: /student/entries/${entryId}/quiz`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
