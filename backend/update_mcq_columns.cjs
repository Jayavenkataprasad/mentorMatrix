const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mentor_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding MCQ support to task_questions table...');

db.serialize(() => {
  // Add questionType column
  db.run('ALTER TABLE task_questions ADD COLUMN questionType TEXT DEFAULT "text" CHECK(questionType IN ("text", "mcq"))', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding questionType:', err.message);
    } else {
      console.log('✓ questionType column added or already exists');
    }
  });

  // Add options column for MCQs
  db.run('ALTER TABLE task_questions ADD COLUMN options TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding options:', err.message);
    } else {
      console.log('✓ options column added or already exists');
    }
  });

  // Add correctAnswer column for MCQs
  db.run('ALTER TABLE task_questions ADD COLUMN correctAnswer TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding correctAnswer:', err.message);
    } else {
      console.log('✓ correctAnswer column added or already exists');
    }
  });

  // Add studentAnswer column for MCQs
  db.run('ALTER TABLE task_questions ADD COLUMN studentAnswer TEXT', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding studentAnswer:', err.message);
    } else {
      console.log('✓ studentAnswer column added or already exists');
    }
  });

  // Add isCorrect column for MCQs
  db.run('ALTER TABLE task_questions ADD COLUMN isCorrect INTEGER DEFAULT 0', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding isCorrect:', err.message);
    } else {
      console.log('✓ isCorrect column added or already exists');
    }
  });
});

setTimeout(() => {
  console.log('\nVerifying updated schema...');
  db.all('PRAGMA table_info(task_questions)', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('Updated columns:');
    rows.forEach(row => {
      console.log('- ' + row.name + ': ' + row.type);
    });
    
    db.close();
  });
}, 1000);
