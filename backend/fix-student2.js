import bcrypt from 'bcryptjs';
import { initializeDatabase, runAsync } from './db.js';

async function fixStudent2Password() {
  try {
    const db = await initializeDatabase();
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await runAsync(
      'UPDATE users SET passwordHash = ? WHERE email = ?',
      [hashedPassword, 'student2@gmail.com']
    );
    
    console.log('Student2 password updated successfully');
    console.log('Email: student2@gmail.com');
    console.log('Password: password123');
    
    // Also add a question for entry 3 if it doesn't exist
    const mentor = await runAsync('SELECT id FROM users WHERE role = ? LIMIT 1', ['mentor']);
    
    await runAsync(
      'INSERT OR IGNORE INTO mcq_questions (entryId, mentorId, question, options, correctAnswer, points) VALUES (?, ?, ?, ?, ?, ?)',
      [3, mentor.lastID, 'What is Node.js?', '["A database", "A JavaScript runtime", "A frontend framework", "A programming language"]', 1, 3]
    );
    
    console.log('Added question for entry 3');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixStudent2Password();
