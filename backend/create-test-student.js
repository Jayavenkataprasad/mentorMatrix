import bcrypt from 'bcryptjs';
import { initializeDatabase, runAsync } from './db.js';

async function createTestStudent() {
  try {
    const db = await initializeDatabase();
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await runAsync(
      'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      ['teststudent', 'teststudent@gmail.com', hashedPassword, 'student']
    );
    
    console.log('Test student created successfully');
    console.log('Email: teststudent@gmail.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test student:', error);
    process.exit(1);
  }
}

createTestStudent();
