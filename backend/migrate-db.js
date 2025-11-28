import { initializeDatabase } from './db.js';

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    const db = await initializeDatabase();
    
    // Check if deadline column exists in entries table
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(entries)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const hasDeadlineColumn = tableInfo.some(column => column.name === 'deadline');
    
    if (!hasDeadlineColumn) {
      console.log('Adding deadline column to entries table...');
      await new Promise((resolve, reject) => {
        db.run('ALTER TABLE entries ADD COLUMN deadline DATETIME', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Deadline column added successfully');
    } else {
      console.log('Deadline column already exists');
    }
    
    // Check if mcq_questions table exists
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const hasMCQQuestions = tables.some(table => table.name === 'mcq_questions');
    
    if (!hasMCQQuestions) {
      console.log('Creating MCQ tables...');
      
      // Create mcq_questions table
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS mcq_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entryId INTEGER NOT NULL,
            mentorId INTEGER NOT NULL,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correctAnswer INTEGER NOT NULL,
            points INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Create mcq_answers table
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS mcq_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            questionId INTEGER NOT NULL,
            studentId INTEGER NOT NULL,
            selectedAnswer INTEGER NOT NULL,
            isCorrect BOOLEAN NOT NULL,
            points INTEGER DEFAULT 0,
            answeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (questionId) REFERENCES mcq_questions(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Create indexes
      await new Promise((resolve, reject) => {
        db.run('CREATE INDEX IF NOT EXISTS idx_mcq_questions_entryId ON mcq_questions(entryId)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('CREATE INDEX IF NOT EXISTS idx_mcq_questions_mentorId ON mcq_questions(mentorId)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('CREATE INDEX IF NOT EXISTS idx_mcq_answers_questionId ON mcq_answers(questionId)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('CREATE INDEX IF NOT EXISTS idx_mcq_answers_studentId ON mcq_answers(studentId)', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('MCQ tables created successfully');
    } else {
      console.log('MCQ tables already exist');
    }
    
    console.log('Database migration completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
