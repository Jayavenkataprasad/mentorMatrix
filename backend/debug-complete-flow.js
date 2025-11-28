// Complete debugging script for MCQ flow
import { initializeDatabase, allAsync, getAsync } from './db.js';

async function debugCompleteFlow() {
  try {
    console.log('=== Complete MCQ Flow Debug ===');
    
    const db = await initializeDatabase();
    
    // 1. Check all users
    console.log('\n1. All Users:');
    const users = await allAsync('SELECT id, name, email, role FROM users');
    users.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    // 2. Check all entries with student info
    console.log('\n2. All Entries with Student Info:');
    const entries = await allAsync(`
      SELECT e.id, e.title, e.deadline, e.studentId, u.name as studentName, u.email as studentEmail
      FROM entries e 
      JOIN users u ON e.studentId = u.id
      ORDER BY e.id
    `);
    
    entries.forEach(entry => {
      const deadlineStatus = entry.deadline ? 
        (new Date(entry.deadline) <= new Date() ? 'PASSED' : 'NOT PASSED') : 
        'NO DEADLINE';
      console.log(`  Entry ${entry.id}: "${entry.title}" - Student: ${entry.studentName} (${entry.studentEmail}) - Deadline: ${deadlineStatus}`);
    });
    
    // 3. Check all MCQ questions with entry and student info
    console.log('\n3. All MCQ Questions with Entry Info:');
    const questions = await allAsync(`
      SELECT mq.id, mq.question, mq.entryId, mq.mentorId, 
             e.title as entryTitle, e.studentId,
             u1.name as mentorName, u2.name as studentName
      FROM mcq_questions mq
      JOIN entries e ON mq.entryId = e.id
      JOIN users u1 ON mq.mentorId = u1.id
      JOIN users u2 ON e.studentId = u2.id
      ORDER BY mq.id
    `);
    
    questions.forEach(q => {
      console.log(`  Question ${q.id}: "${q.question}" - Entry: ${q.entryId} ("${q.entryTitle}") - Student: ${q.studentName} - Mentor: ${q.mentorName}`);
    });
    
    // 4. Check specific student access
    console.log('\n4. Testing Student Access:');
    
    // Test student2 (ID: 2)
    console.log('\n  Testing Student2 (ID: 2):');
    const student2Entries = await allAsync('SELECT * FROM entries WHERE studentId = 2');
    console.log(`    Found ${student2Entries.length} entries for student2`);
    
    for (const entry of student2Entries) {
      const questions = await allAsync('SELECT * FROM mcq_questions WHERE entryId = ?', [entry.id]);
      console.log(`    Entry ${entry.id}: "${entry.title}" - ${questions.length} questions`);
      if (questions.length > 0) {
        console.log(`      Question: "${questions[0].question}"`);
      }
    }
    
    // Test student7 (ID: 7)
    console.log('\n  Testing Student7 (ID: 7):');
    const student7Entries = await allAsync('SELECT * FROM entries WHERE studentId = 7');
    console.log(`    Found ${student7Entries.length} entries for student7`);
    
    for (const entry of student7Entries) {
      const questions = await allAsync('SELECT * FROM mcq_questions WHERE entryId = ?', [entry.id]);
      console.log(`    Entry ${entry.id}: "${entry.title}" - ${questions.length} questions`);
      if (questions.length > 0) {
        console.log(`      Question: "${questions[0].question}"`);
      }
    }
    
    // 5. Summary
    console.log('\n5. Summary:');
    console.log(`  Total Users: ${users.length}`);
    console.log(`  Total Entries: ${entries.length}`);
    console.log(`  Total Questions: ${questions.length}`);
    console.log(`  Students with questions: ${[...new Set(questions.map(q => q.studentName))].join(', ')}`);
    
    console.log('\n=== Debug Complete ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Debug failed:', error);
    process.exit(1);
  }
}

debugCompleteFlow();
