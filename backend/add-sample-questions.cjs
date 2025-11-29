const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding sample MCQ questions...');

// First, let's see what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error checking tables:', err);
    return;
  }
  
  console.log('Existing tables:', tables.map(t => t.name));
  
  // Check if entries table exists and has data
  db.get('SELECT COUNT(*) as count FROM entries', (err, row) => {
    if (err) {
      console.error('Error checking entries:', err);
      return;
    }
    
    console.log('Total entries:', row.count);
    
    if (row.count > 0) {
      // Get a sample entry ID
      db.get('SELECT id FROM entries LIMIT 1', (err, entry) => {
        if (err) {
          console.error('Error getting entry:', err);
          return;
        }
        
        const sampleEntryId = entry.id;
        console.log('Using entry ID:', sampleEntryId);
        
        // Add sample MCQ questions
        const sampleQuestions = [
          {
            question: "What is the time complexity of binary search?",
            options: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n²)"]),
            correctAnswer: 1,
            points: 2,
            entryId: sampleEntryId,
            mentorId: 1 // Assuming mentor ID 1 exists
          },
          {
            question: "Which data structure uses LIFO principle?",
            options: JSON.stringify(["Queue", "Stack", "Array", "Linked List"]),
            correctAnswer: 1,
            points: 1,
            entryId: sampleEntryId,
            mentorId: 1
          },
          {
            question: "What is the primary purpose of normalization in database design?",
            options: JSON.stringify([
              "To improve query performance",
              "To reduce data redundancy",
              "To increase storage capacity",
              "To encrypt data"
            ]),
            correctAnswer: 1,
            points: 3,
            entryId: sampleEntryId,
            mentorId: 1
          }
        ];
        
        // Insert sample questions
        const insertQuestion = (question, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO mcq_questions (question, options, correctAnswer, points, entryId, mentorId) VALUES (?, ?, ?, ?, ?, ?)`,
              [question.question, question.options, question.correctAnswer, question.points, question.entryId, question.mentorId],
              function(err) {
                if (err) {
                  console.error(`Error inserting question ${index + 1}:`, err);
                  reject(err);
                } else {
                  console.log(`Inserted question ${index + 1} with ID: ${this.lastID}`);
                  resolve(this.lastID);
                }
              }
            );
          });
        };
        
        // Insert all questions
        Promise.all(sampleQuestions.map((q, i) => insertQuestion(q, i)))
          .then(() => {
            console.log('All sample questions added successfully!');
            
            // Verify the questions were added
            db.all('SELECT * FROM mcq_questions WHERE entryId = ?', [sampleEntryId], (err, questions) => {
              if (err) {
                console.error('Error verifying questions:', err);
              } else {
                console.log(`Verification: Found ${questions.length} questions for entry ${sampleEntryId}`);
                console.log('Questions:', questions);
              }
              
              db.close();
            });
          })
          .catch((error) => {
            console.error('Failed to add sample questions:', error);
            db.close();
          });
      });
    } else {
      console.log('No entries found. Please create some entries first.');
      db.close();
    }
  });
});
