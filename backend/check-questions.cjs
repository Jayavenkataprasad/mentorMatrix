const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mentor_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking MCQ questions...');

// Check MCQ questions with entry details
db.all(`
  SELECT 
    mq.id,
    mq.question,
    mq.options,
    mq.correctAnswer,
    mq.points,
    mq.entryId,
    e.title as entryTitle,
    e.studentId,
    s.name as studentName,
    e.deadline
  FROM mcq_questions mq
  JOIN entries e ON mq.entryId = e.id
  JOIN users s ON e.studentId = s.id
  ORDER BY mq.id
`, (err, questions) => {
  if (err) {
    console.error('Error fetching questions:', err);
    db.close();
    return;
  }
  
  console.log(`Found ${questions.length} MCQ questions:`);
  
  questions.forEach((q, index) => {
    console.log(`\n--- Question ${index + 1} ---`);
    console.log(`ID: ${q.id}`);
    console.log(`Entry ID: ${q.entryId}`);
    console.log(`Entry Title: ${q.entryTitle}`);
    console.log(`Student: ${q.studentName}`);
    console.log(`Deadline: ${q.deadline}`);
    console.log(`Question: ${q.question}`);
    console.log(`Options: ${JSON.parse(q.options).join(', ')}`);
    console.log(`Correct Answer: ${q.correctAnswer}`);
    console.log(`Points: ${q.points}`);
  });
  
  // Check if there are any answers
  db.get('SELECT COUNT(*) as count FROM mcq_answers', (err, row) => {
    if (err) {
      console.error('Error checking answers:', err);
    } else {
      console.log(`\nTotal MCQ answers submitted: ${row.count}`);
    }
    
    db.close();
  });
});
