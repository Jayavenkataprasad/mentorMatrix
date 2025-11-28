import { initializeDatabase, allAsync } from './db.js';

async function checkUsers() {
  try {
    const db = await initializeDatabase();
    
    const users = await allAsync('SELECT id, name, email, role FROM users');
    console.log('All users:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
