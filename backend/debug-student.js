import { initializeDatabase, getAsync, allAsync } from './db.js';

async function debugStudentAccess() {
  try {
    console.log('=== Debugging Student Access ===');
    
    const db = await initializeDatabase();
    
    // Test student access to entry 3
    const studentId = 2; // Change this to match your student
    const entryId = 3;
    
    console.log(`\nTesting student ${studentId} access to entry ${entryId}`);
    
    // Check if student exists
    const student = await getAsync('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
    console.log('Student:', student);
    
    if (!student) {
      console.log('Student not found or not a student role');
      process.exit(1);
    }
    
    // Check if entry exists and belongs to student
    const entry = await getAsync(
      'SELECT * FROM entries WHERE id = ? AND studentId = ?',
      [entryId, studentId]
    );
    
    console.log('Entry:', entry);
    
    if (!entry) {
      console.log('Entry not found or does not belong to student');
      process.exit(1);
    }
    
    // Check deadline
    if (entry.deadline) {
      const deadline = new Date(entry.deadline);
      const now = new Date();
      console.log(`Deadline: ${deadline}`);
      console.log(`Current time: ${now}`);
      console.log(`Deadline passed: ${deadline <= now}`);
    } else {
      console.log('No deadline set - questions should be available');
    }
    
    // Check questions for this entry
    const questions = await allAsync(
      'SELECT * FROM mcq_questions WHERE entryId = ?',
      [entryId]
    );
    
    console.log(`Found ${questions.length} questions:`, questions);
    
    // Test the exact query that the API uses
    const questionsForStudent = await allAsync(
      `SELECT mq.id, mq.question, mq.options, mq.points 
       FROM mcq_questions mq 
       WHERE mq.entryId = ? 
       ORDER BY mq.createdAt`,
      [entryId]
    );
    
    console.log('Questions for student (API query):', questionsForStudent);
    
    console.log('\n=== Debug Complete ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
}

debugStudentAccess();
