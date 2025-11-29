const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mentor_portal.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Create tables schema
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('student', 'mentor')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  techStack TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  deadline DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entryId INTEGER NOT NULL,
  mentorId INTEGER NOT NULL,
  comment TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentorId INTEGER NOT NULL,
  studentId INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'task' CHECK(type IN ('task', 'assignment')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
  dueDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentorId INTEGER NOT NULL,
  studentId INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  meetingLink TEXT,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  type TEXT DEFAULT 'meeting' CHECK(type IN ('meeting', 'session', 'review')),
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doubts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  mentorId INTEGER,
  taskId INTEGER,
  concept TEXT NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  doubtType TEXT DEFAULT 'concept' CHECK(doubtType IN ('concept', 'project')),
  subject TEXT,
  techStack TEXT,
  projectName TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'answered', 'resolved', 'needs_more_explanation')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doubt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doubtId INTEGER NOT NULL,
  mentorId INTEGER NOT NULL,
  answer TEXT NOT NULL,
  resources TEXT,
  voiceNoteUrl TEXT,
  attachments TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doubtId) REFERENCES doubts(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  askedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  answeredAt DATETIME,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mcq_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entryId INTEGER NOT NULL,
  mentorId INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of options
  correctAnswer INTEGER NOT NULL, -- Index of correct option
  points INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mcq_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  questionId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  selectedAnswer INTEGER NOT NULL, -- Index of selected option
  isCorrect BOOLEAN NOT NULL,
  points INTEGER DEFAULT 0,
  answeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (questionId) REFERENCES mcq_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);
`;

db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Execute schema
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
      db.close();
      return;
    }
    
    console.log('Database initialized successfully!');
    
    // Check if we have users and entries
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
      } else {
        console.log('Users in database:', row.count);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM entries', (err, row) => {
      if (err) {
        console.error('Error checking entries:', err);
      } else {
        console.log('Entries in database:', row.count);
      }
    });
    
    db.get('SELECT COUNT(*) as count FROM mcq_questions', (err, row) => {
      if (err) {
        console.error('Error checking MCQ questions:', err);
      } else {
        console.log('MCQ questions in database:', row.count);
      }
    });
    
    db.close();
  });
});
