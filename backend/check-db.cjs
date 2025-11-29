const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database contents...');

// Check MCQ questions
db.get('SELECT COUNT(*) as count FROM mcq_questions', (err, row) => {
  if (err) {
    console.error('Error checking MCQ questions:', err);
  } else {
    console.log('Total MCQ questions in database:', row.count);
    
    if (row.count > 0) {
      db.all('SELECT * FROM mcq_questions LIMIT 3', (err, rows) => {
        if (err) {
          console.error('Error fetching sample questions:', err);
        } else {
          console.log('Sample questions:', rows);
        }
      });
    }
  }
});

// Check entries
db.get('SELECT COUNT(*) as count FROM entries', (err, row) => {
  if (err) {
    console.error('Error checking entries:', err);
  } else {
    console.log('Total entries in database:', row.count);
  }
});

// Check MCQ answers
db.get('SELECT COUNT(*) as count FROM mcq_answers', (err, row) => {
  if (err) {
    console.error('Error checking MCQ answers:', err);
  } else {
    console.log('Total MCQ answers in database:', row.count);
  }
});

// Close connection after 2 seconds
setTimeout(() => {
  db.close();
  console.log('Database check completed.');
}, 2000);
