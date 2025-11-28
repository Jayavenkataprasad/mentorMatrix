import { initializeDatabase, getAsync, allAsync } from './db.js';

async function testQuestions() {
  try {
    console.log('Testing MCQ questions...');
    
    const db = await initializeDatabase();
    
    // Check all entries
    const entries = await allAsync('SELECT id, title, studentId, deadline FROM entries');
    console.log('All entries:', entries);
    
    // Check all MCQ questions
    const questions = await allAsync('SELECT * FROM mcq_questions');
    console.log('All MCQ questions:', questions);
    
    // Check for a specific entry (change ID as needed)
    const entryId = 3; // Change this to test a specific entry
    const entryQuestions = await allAsync(
      'SELECT * FROM mcq_questions WHERE entryId = ?',
      [entryId]
    );
    console.log(`Questions for entry ${entryId}:`, entryQuestions);
    
    // Check if entry exists and belongs to a student
    const entry = await getAsync('SELECT * FROM entries WHERE id = ?', [entryId]);
    console.log(`Entry ${entryId}:`, entry);
    
    if (entry) {
      console.log(`Entry deadline: ${entry.deadline}`);
      console.log(`Current time: ${new Date()}`);
      console.log(`Deadline passed: ${!entry.deadline || new Date(entry.deadline) <= new Date()}`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testQuestions();
