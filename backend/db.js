import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const dbPath = path.join(__dirname, 'mentor_portal.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create tables
        const schema = `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            passwordHash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'mentor')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            tags TEXT,
            resources TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'needs_work', 'approved')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entryId INTEGER NOT NULL,
            mentorId INTEGER NOT NULL,
            message TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentorId INTEGER NOT NULL,
            studentId INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            dueDate DATETIME,
            completed BOOLEAN DEFAULT 0,
            completedAt DATETIME,
            concept TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS mentor_students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentorId INTEGER NOT NULL,
            studentId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(mentorId, studentId),
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentorId INTEGER NOT NULL,
            studentId INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            startTime DATETIME NOT NULL,
            endTime DATETIME NOT NULL,
            focusStack TEXT,
            status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'canceled')),
            isGroupSession BOOLEAN DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS activity_feed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventType TEXT NOT NULL,
            actorId INTEGER NOT NULL,
            targetId INTEGER,
            targetType TEXT,
            payload TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entityType TEXT NOT NULL,
            entityId INTEGER NOT NULL,
            action TEXT NOT NULL,
            changedBy INTEGER NOT NULL,
            oldValue TEXT,
            newValue TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (changedBy) REFERENCES users(id) ON DELETE CASCADE
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
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS doubt_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doubtId INTEGER NOT NULL,
            mentorId INTEGER NOT NULL,
            answer TEXT NOT NULL,
            resources TEXT,
            voiceNoteUrl TEXT,
            attachments TEXT,
            rating INTEGER DEFAULT 0,
            feedback TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doubtId) REFERENCES doubts(id) ON DELETE CASCADE,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS task_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            taskId INTEGER NOT NULL,
            mentorId INTEGER NOT NULL,
            studentId INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'answered')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            answeredAt DATETIME,
            FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE INDEX IF NOT EXISTS idx_entries_studentId ON entries(studentId);
          CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
          CREATE INDEX IF NOT EXISTS idx_comments_entryId ON comments(entryId);
          CREATE INDEX IF NOT EXISTS idx_tasks_studentId ON tasks(studentId);
          CREATE INDEX IF NOT EXISTS idx_tasks_mentorId ON tasks(mentorId);
          CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
          CREATE INDEX IF NOT EXISTS idx_schedules_mentorId ON schedules(mentorId);
          CREATE INDEX IF NOT EXISTS idx_schedules_studentId ON schedules(studentId);
          CREATE INDEX IF NOT EXISTS idx_schedules_startTime ON schedules(startTime);
          CREATE INDEX IF NOT EXISTS idx_activity_feed_eventType ON activity_feed(eventType);
          CREATE INDEX IF NOT EXISTS idx_activity_feed_createdAt ON activity_feed(createdAt);
          CREATE INDEX IF NOT EXISTS idx_audit_logs_entityId ON audit_logs(entityType, entityId);
          CREATE INDEX IF NOT EXISTS idx_doubts_studentId ON doubts(studentId);
          CREATE INDEX IF NOT EXISTS idx_doubts_mentorId ON doubts(mentorId);
          CREATE INDEX IF NOT EXISTS idx_doubts_status ON doubts(status);
          CREATE INDEX IF NOT EXISTS idx_doubts_doubtType ON doubts(doubtType);
          CREATE INDEX IF NOT EXISTS idx_doubts_subject ON doubts(subject);
          CREATE INDEX IF NOT EXISTS idx_doubts_priority ON doubts(priority);
          CREATE INDEX IF NOT EXISTS idx_doubt_answers_doubtId ON doubt_answers(doubtId);
          CREATE INDEX IF NOT EXISTS idx_task_questions_taskId ON task_questions(taskId);
          CREATE INDEX IF NOT EXISTS idx_task_questions_status ON task_questions(status);
        `;

        db.exec(schema, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      });
    });
  });
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
