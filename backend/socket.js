import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;
const userSockets = new Map(); // userId -> socket id mapping

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected: ${socket.id}`);
    userSockets.set(socket.userId, socket.id);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      userSockets.delete(socket.userId);
    });

    // Subscribe to mentor room (for mentors)
    socket.on('subscribe:mentor', (mentorId) => {
      if (socket.userRole === 'mentor' && socket.userId === mentorId) {
        socket.join(`mentor:${mentorId}`);
        console.log(`Mentor ${mentorId} subscribed to mentor room`);
      }
    });

    // Subscribe to student room (for students)
    socket.on('subscribe:student', (studentId) => {
      if (socket.userRole === 'student' && socket.userId === studentId) {
        socket.join(`student:${studentId}`);
        console.log(`Student ${studentId} subscribed to student room`);
      }
    });

    // Subscribe to cohort room
    socket.on('subscribe:cohort', (cohortId) => {
      socket.join(`cohort:${cohortId}`);
      console.log(`User ${socket.userId} subscribed to cohort ${cohortId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function getUserSocket(userId) {
  return userSockets.get(userId);
}

// Event emitter functions for real-time updates

// Student registration
export function emitStudentRegistered(student) {
  if (!io) return;
  
  io.to('role:mentor').emit('student:registered', {
    student,
    timestamp: new Date()
  });
}

// Entry events
export function emitEntryCreated(entry, mentorIds = []) {
  if (!io) return;

  mentorIds.forEach(mentorId => {
    io.to(`mentor:${mentorId}`).emit('entry:created', {
      entry,
      timestamp: new Date()
    });
  });
}

export function emitEntryStatusChanged(entry, mentorId, studentId) {
  if (!io) return;

  // Emit to mentor
  io.to(`mentor:${mentorId}`).emit('entry:statusChanged', {
    entryId: entry.id,
    status: entry.status,
    studentId,
    timestamp: new Date()
  });

  // Emit to student
  io.to(`student:${studentId}`).emit('entry:statusChanged', {
    entryId: entry.id,
    status: entry.status,
    timestamp: new Date()
  });
}

export function emitCommentAdded(comment, entry) {
  if (!io) return;

  io.to(`student:${entry.studentId}`).emit('comment:added', {
    comment,
    entryId: entry.id,
    timestamp: new Date()
  });
}

// Task events
export function emitTaskAssigned(task, studentId) {
  if (!io) return;

  io.to(`student:${studentId}`).emit('task:assigned', {
    task,
    timestamp: new Date()
  });
}

export function emitTaskUpdated(task, studentId) {
  if (!io) return;

  io.to(`student:${studentId}`).emit('task:updated', {
    task,
    timestamp: new Date()
  });
}

export function emitTaskCompleted(task, studentId) {
  if (!io) return;

  const payload = {
    task,
    timestamp: new Date()
  };

  // Notify the student
  io.to(`student:${studentId}`).emit('task:completed', payload);

  // Notify all mentors
  io.to('role:mentor').emit('task:completed', payload);
}

// Doubt events
export function emitDoubtCreated(doubt, studentId, mentorId) {
  if (!io) return;

  const payload = {
    doubt,
    studentId,
    timestamp: new Date()
  };

  // Notify all mentors for real-time dashboard updates
  io.to('role:mentor').emit('doubt:created', payload);

  // Notify specific mentor if assigned
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('doubt:created', payload);
  }

  // Notify the student
  io.to(`student:${studentId}`).emit('doubt:created', payload);
}

export function emitDoubtAnswered(doubt, answer, studentId, mentorId) {
  if (!io) return;

  const payload = {
    doubt,
    answer,
    timestamp: new Date()
  };

  // Notify the student who asked the doubt
  io.to(`student:${studentId}`).emit('doubt:answered', payload);

  // Notify the mentor who answered
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('doubt:answered', payload);
  }

  // Notify all mentors for dashboard updates
  io.to('role:mentor').emit('doubt:answered', payload);
}

export function emitDoubtStatusChanged(doubt, studentId, mentorId) {
  if (!io) return;

  const payload = {
    doubt,
    timestamp: new Date()
  };

  // Notify the student
  io.to(`student:${studentId}`).emit('doubt:statusChanged', payload);

  // Notify the mentor
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('doubt:statusChanged', payload);
  }

  // Notify all mentors for real-time dashboard updates
  io.to('role:mentor').emit('doubt:statusChanged', payload);
}

export function emitDoubtResolved(doubt, studentId, mentorId) {
  if (!io) return;

  const payload = {
    doubt,
    timestamp: new Date()
  };

  // Notify the student
  io.to(`student:${studentId}`).emit('doubt:resolved', payload);

  // Notify the mentor
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('doubt:resolved', payload);
  }

  // Notify all mentors
  io.to('role:mentor').emit('doubt:resolved', payload);
}

// MCQ events
export function emitMCQQuestionCreated(question, mentorId) {
  if (!io) return;

  io.to('role:mentor').emit('mcq:question:created', {
    question,
    timestamp: new Date()
  });
}

export function emitMCQQuestionUpdated(question, mentorId) {
  if (!io) return;

  io.to('role:mentor').emit('mcq:question:updated', {
    question,
    timestamp: new Date()
  });
}

export function emitMCQQuestionDeleted(questionId, mentorId) {
  if (!io) return;

  io.to('role:mentor').emit('mcq:question:deleted', {
    questionId,
    mentorId,
    timestamp: new Date()
  });
}

export function emitMCQAnswerSubmitted(answer, mentorId) {
  if (!io) return;

  const payload = {
    answer,
    timestamp: new Date()
  };

  // Notify the mentor
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('mcq:answer:submitted', payload);
  }

  // Notify all mentors for real-time analytics
  io.to('role:mentor').emit('mcq:answer:submitted:global', payload);
}

// Schedule events
export function emitScheduleCreated(schedule, studentId) {
  if (!io) return;

  const payload = {
    schedule,
    timestamp: new Date()
  };

  // Emit to student
  if (studentId) {
    io.to(`student:${studentId}`).emit('schedule:created', payload);
  }

  // Emit to all mentors
  io.to('role:mentor').emit('schedule:created:global', payload);

  // Emit to specific mentor
  if (schedule.mentorId) {
    io.to(`mentor:${schedule.mentorId}`).emit('schedule:created', payload);
  }
}

export function emitScheduleUpdated(schedule, studentId) {
  if (!io) return;

  const payload = {
    schedule,
    timestamp: new Date()
  };

  // Emit to student
  if (studentId) {
    io.to(`student:${studentId}`).emit('schedule:updated', payload);
  }

  // Emit to all mentors
  io.to('role:mentor').emit('schedule:updated:global', payload);

  // Emit to specific mentor
  if (schedule.mentorId) {
    io.to(`mentor:${schedule.mentorId}`).emit('schedule:updated', payload);
  }
}

export function emitScheduleCancelled(schedule, studentId) {
  if (!io) return;

  const payload = {
    schedule,
    timestamp: new Date()
  };

  // Emit to student
  if (studentId) {
    io.to(`student:${studentId}`).emit('schedule:cancelled', payload);
  }

  // Emit to all mentors
  io.to('role:mentor').emit('schedule:cancelled:global', payload);

  // Emit to specific mentor
  if (schedule.mentorId) {
    io.to(`mentor:${schedule.mentorId}`).emit('schedule:cancelled', payload);
  }
}

// Task Question events
export function emitTaskQuestionAdded(question, studentId) {
  if (!io) return;

  const payload = {
    question,
    timestamp: new Date()
  };

  // Notify the student
  io.to(`student:${studentId}`).emit('task:question_added', payload);

  // Notify all mentors
  io.to('role:mentor').emit('task:question_added', payload);
}

export function emitTaskQuestionAnswered(question, mentorId) {
  if (!io) return;

  const payload = {
    question,
    timestamp: new Date()
  };

  // Notify the mentor
  if (mentorId) {
    io.to(`mentor:${mentorId}`).emit('task:question_answered', payload);
  }

  // Notify all mentors
  io.to('role:mentor').emit('task:question_answered', payload);
}

// Utility functions
export function broadcastToStudent(studentId, event, data) {
  if (!io) return;
  io.to(`student:${studentId}`).emit(event, data);
}

export function broadcastToMentor(mentorId, event, data) {
  if (!io) return;
  io.to(`mentor:${mentorId}`).emit(event, data);
}

export function broadcastToAllMentors(event, data) {
  if (!io) return;
  io.to('role:mentor').emit(event, data);
}

export function broadcastToAllStudents(event, data) {
  if (!io) return;
  io.to('role:student').emit(event, data);
}

export function broadcastToCohort(cohortId, event, data) {
  if (!io) return;
  io.to(`cohort:${cohortId}`).emit(event, data);
}
