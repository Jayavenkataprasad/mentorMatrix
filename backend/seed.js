import bcrypt from 'bcryptjs';
import { initializeDatabase, runAsync, getAsync } from './db.js';

async function seedDatabase() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Check if users already exist
    const existingStudent = await getAsync('SELECT id FROM users WHERE email = ?', ['student@example.com']);
    const existingMentor = await getAsync('SELECT id FROM users WHERE email = ?', ['mentor@example.com']);

    let studentId, mentorId;

    if (!existingStudent) {
      const studentResult = await runAsync(
        'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
        ['John Student', 'student@example.com', hashedPassword, 'student']
      );
      studentId = studentResult.id;
      console.log('✓ Student user created');
    } else {
      studentId = existingStudent.id;
      console.log('✓ Student user already exists');
    }

    if (!existingMentor) {
      const mentorResult = await runAsync(
        'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
        ['Jane Mentor', 'mentor@example.com', hashedPassword, 'mentor']
      );
      mentorId = mentorResult.id;
      console.log('✓ Mentor user created');
    } else {
      mentorId = existingMentor.id;
      console.log('✓ Mentor user already exists');
    }

    // Create sample entries
    const sampleEntries = [
      {
        title: 'Learned React Hooks',
        body: 'Today I learned about useState and useEffect hooks. These are fundamental for managing state and side effects in functional components.',
        tags: JSON.stringify(['React', 'JavaScript']),
        resources: JSON.stringify(['https://react.dev/reference/react/useState', 'https://react.dev/reference/react/useEffect']),
        status: 'pending'
      },
      {
        title: 'DSA: Arrays and Strings',
        body: 'Studied array manipulation techniques and string algorithms. Practiced problems on LeetCode.',
        tags: JSON.stringify(['DSA', 'Algorithms']),
        resources: JSON.stringify(['https://leetcode.com']),
        status: 'reviewed'
      },
      {
        title: 'HTML & CSS Basics',
        body: 'Completed HTML semantic elements and CSS flexbox layout. Built a responsive navigation bar.',
        tags: JSON.stringify(['HTML', 'CSS']),
        resources: JSON.stringify(['https://developer.mozilla.org/en-US/docs/Web/HTML']),
        status: 'approved'
      }
    ];

    for (const entry of sampleEntries) {
      const existingEntry = await getAsync(
        'SELECT id FROM entries WHERE studentId = ? AND title = ?',
        [studentId, entry.title]
      );

      if (!existingEntry) {
        await runAsync(
          'INSERT INTO entries (studentId, title, body, tags, resources, status) VALUES (?, ?, ?, ?, ?, ?)',
          [studentId, entry.title, entry.body, entry.tags, entry.resources, entry.status]
        );
      }
    }
    console.log('✓ Sample entries created');

    // Create sample task
    const existingTask = await getAsync(
      'SELECT id FROM tasks WHERE studentId = ? AND title = ?',
      [studentId, 'Complete React Project']
    );

    if (!existingTask) {
      await runAsync(
        'INSERT INTO tasks (mentorId, studentId, title, description, dueDate, completed) VALUES (?, ?, ?, ?, ?, ?)',
        [mentorId, studentId, 'Complete React Project', 'Build a todo app with React and localStorage', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 0]
      );
    }
    console.log('✓ Sample task created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Student - Email: student@example.com, Password: password123');
    console.log('Mentor - Email: mentor@example.com, Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
