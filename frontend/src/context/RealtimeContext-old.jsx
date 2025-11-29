import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket.js';

const RealtimeContext = createContext();

export function RealtimeProvider({ children, userId, userRole }) {
  const { subscribeMentor, subscribeStudent, on, off } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [scheduleUpdates, setScheduleUpdates] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0); // Counter to force component refreshes

  // Subscribe to appropriate room on mount
  useEffect(() => {
    if (!userId) return;

    if (userRole === 'mentor') {
      subscribeMentor(userId);
    } else if (userRole === 'student') {
      subscribeStudent(userId);
    }
  }, [userId, userRole, subscribeMentor, subscribeStudent]);

  // Generic refresh trigger
  const triggerRefresh = useCallback(() => {
    setForceRefresh(prev => prev + 1);
  }, []);

  // Handle student registration (mentor)
  const handleStudentRegistered = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'student:registered',
      message: `New student registered: ${data.student.name}`,
      data: data.student,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle entry created (mentor)
  const handleEntryCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'entry:created',
      message: `New entry created: ${data.entry.title}`,
      data: data.entry,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle entry status changed (both)
  const handleEntryStatusChanged = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'entry:statusChanged',
      message: `Entry status changed to ${data.status}`,
      data,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle comment added (student)
  const handleCommentAdded = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'comment:added',
      message: `New feedback on entry`,
      data: data.comment,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle task assigned (student)
  const handleTaskAssigned = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'task:assigned',
      message: `New task assigned: ${data.task.title}`,
      data: data.task,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle task updated (student)
  const handleTaskUpdated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'task:updated',
      message: `Task updated: ${data.task.title}`,
      data: data.task,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle task completed (both)
  const handleTaskCompleted = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'task:completed',
      message: `Task completed: ${data.task.title}`,
      data: data.task,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle doubt created (both)
  const handleDoubtCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'doubt:created',
      message: `New doubt: ${data.doubt.question.substring(0, 50)}...`,
      data: data.doubt,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle doubt answered (both)
  const handleDoubtAnswered = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'doubt:answered',
      message: `Doubt answered: ${data.doubt.question.substring(0, 50)}...`,
      data: data,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle doubt status changed (both)
  const handleDoubtStatusChanged = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'doubt:statusChanged',
      message: `Doubt status changed to ${data.doubt.status}`,
      data: data.doubt,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle doubt resolved (both)
  const handleDoubtResolved = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'doubt:resolved',
      message: `Doubt resolved: ${data.doubt.question.substring(0, 50)}...`,
      data: data.doubt,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle MCQ question created (mentor)
  const handleMCQQuestionCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'mcq:question:created',
      message: `New MCQ question created`,
      data: data.question,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle MCQ question updated (mentor)
  const handleMCQQuestionUpdated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'mcq:question:updated',
      message: `MCQ question updated`,
      data: data.question,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle MCQ question deleted (mentor)
  const handleMCQQuestionDeleted = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'mcq:question:deleted',
      message: `MCQ question deleted`,
      data: data,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle MCQ answer submitted (mentor)
  const handleMCQAnswerSubmitted = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'mcq:answer:submitted',
      message: `Student submitted MCQ answers`,
      data: data.answer,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle schedule created (both)
  const handleScheduleCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'schedule:created',
      message: `New meeting scheduled: ${data.schedule.title}`,
      data: data.schedule,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    setScheduleUpdates(prev => [data.schedule, ...prev]);
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle schedule updated (both)
  const handleScheduleUpdated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'schedule:updated',
      message: `Meeting updated: ${data.schedule.title}`,
      data: data.schedule,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    setScheduleUpdates(prev => [data.schedule, ...prev]);
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle schedule cancelled (both)
  const handleScheduleCancelled = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'schedule:cancelled',
      message: `Meeting cancelled: ${data.schedule.title}`,
      data: data.schedule,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle task question added (both)
  const handleTaskQuestionAdded = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'task:question_added',
      message: `New task question added`,
      data: data.question,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle task question answered (both)
  const handleTaskQuestionAnswered = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'task:question_answered',
      message: `Task question answered`,
      data: data.question,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
    triggerRefresh();
  }, [triggerRefresh]);

  // Set up event listeners
  useEffect(() => {
    if (!userId) return;

    // Student events
    on('student:registered', handleStudentRegistered);
    
    // Entry events
    on('entry:created', handleEntryCreated);
    on('entry:statusChanged', handleEntryStatusChanged);
    on('comment:added', handleCommentAdded);
    
    // Task events
    on('task:assigned', handleTaskAssigned);
    on('task:updated', handleTaskUpdated);
    on('task:completed', handleTaskCompleted);
    on('task:question_added', handleTaskQuestionAdded);
    on('task:question_answered', handleTaskQuestionAnswered);
    
    // Doubt events
    on('doubt:created', handleDoubtCreated);
    on('doubt:answered', handleDoubtAnswered);
    on('doubt:statusChanged', handleDoubtStatusChanged);
    on('doubt:resolved', handleDoubtResolved);
    
    // MCQ events
    on('mcq:question:created', handleMCQQuestionCreated);
    on('mcq:question:updated', handleMCQQuestionUpdated);
    on('mcq:question:deleted', handleMCQQuestionDeleted);
    on('mcq:answer:submitted', handleMCQAnswerSubmitted);
    on('mcq:answer:submitted:global', handleMCQAnswerSubmitted);
    
    // Schedule events
    on('schedule:created', handleScheduleCreated);
    on('schedule:created:global', handleScheduleCreated);
    on('schedule:updated', handleScheduleUpdated);
    on('schedule:updated:global', handleScheduleUpdated);
    on('schedule:cancelled', handleScheduleCancelled);
    on('schedule:cancelled:global', handleScheduleCancelled);

    return () => {
      off('student:registered', handleStudentRegistered);
      off('entry:created', handleEntryCreated);
      off('entry:statusChanged', handleEntryStatusChanged);
      off('comment:added', handleCommentAdded);
      off('task:assigned', handleTaskAssigned);
      off('task:updated', handleTaskUpdated);
      off('task:completed', handleTaskCompleted);
      off('task:question_added', handleTaskQuestionAdded);
      off('task:question_answered', handleTaskQuestionAnswered);
      off('doubt:created', handleDoubtCreated);
      off('doubt:answered', handleDoubtAnswered);
      off('doubt:statusChanged', handleDoubtStatusChanged);
      off('doubt:resolved', handleDoubtResolved);
      off('mcq:question:created', handleMCQQuestionCreated);
      off('mcq:question:updated', handleMCQQuestionUpdated);
      off('mcq:question:deleted', handleMCQQuestionDeleted);
      off('mcq:answer:submitted', handleMCQAnswerSubmitted);
      off('mcq:answer:submitted:global', handleMCQAnswerSubmitted);
      off('schedule:created', handleScheduleCreated);
      off('schedule:created:global', handleScheduleCreated);
      off('schedule:updated', handleScheduleUpdated);
      off('schedule:updated:global', handleScheduleUpdated);
      off('schedule:cancelled', handleScheduleCancelled);
      off('schedule:cancelled:global', handleScheduleCancelled);
    };
  }, [userId, on, off, 
    handleStudentRegistered, handleEntryCreated, handleEntryStatusChanged, handleCommentAdded,
    handleTaskAssigned, handleTaskUpdated, handleTaskCompleted, handleTaskQuestionAdded, handleTaskQuestionAnswered,
    handleDoubtCreated, handleDoubtAnswered, handleDoubtStatusChanged, handleDoubtResolved,
    handleMCQQuestionCreated, handleMCQQuestionUpdated, handleMCQQuestionDeleted, handleMCQAnswerSubmitted,
    handleScheduleCreated, handleScheduleUpdated, handleScheduleCancelled,
    triggerRefresh
  ]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <RealtimeContext.Provider value={{
      notifications,
      unreadCount,
      recentActivity,
      metrics,
      scheduleUpdates,
      forceRefresh,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      triggerRefresh
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
  }, [userRole]);

  // Handle doubt answered (student + mentors)
  const handleDoubtAnswered = useCallback((data) => {
    const { doubt, answer } = data;
    const notification = {
      id: Date.now(),
      type: 'doubt:answered',
      message: userRole === 'student'
        ? `Your doubt has been answered: ${doubt.question}`
        : `Doubt answered: ${doubt.question}`,
      data: { doubt, answer },
      timestamp: new Date(data.timestamp || new Date()),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
  }, [userRole]);

  // Handle doubt resolved (student + mentors)
  const handleDoubtResolved = useCallback((data) => {
    const { doubt } = data;
    const notification = {
      id: Date.now(),
      type: 'doubt:resolved',
      message: userRole === 'student'
        ? `Doubt marked as resolved: ${doubt.question}`
        : `Doubt resolved: ${doubt.question}`,
      data: doubt,
      timestamp: new Date(data.timestamp || new Date()),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
  }, [userRole]);

  // Register event listeners
  useEffect(() => {
    on('student:registered', handleStudentRegistered);
    on('entry:created', handleEntryCreated);
    on('entry:statusChanged', handleEntryStatusChanged);
    on('comment:added', handleCommentAdded);
    on('task:assigned', handleTaskAssigned);
    on('schedule:created', handleScheduleCreated);
    on('schedule:updated', handleScheduleUpdated);
    on('metrics:updated', handleMetricsUpdated);
    on('doubt:created', handleDoubtCreated);
    on('doubt:answered', handleDoubtAnswered);
    on('doubt:resolved', handleDoubtResolved);

    return () => {
      off('student:registered', handleStudentRegistered);
      off('entry:created', handleEntryCreated);
      off('entry:statusChanged', handleEntryStatusChanged);
      off('comment:added', handleCommentAdded);
      off('task:assigned', handleTaskAssigned);
      off('schedule:created', handleScheduleCreated);
      off('schedule:updated', handleScheduleUpdated);
      off('metrics:updated', handleMetricsUpdated);
      off('doubt:created', handleDoubtCreated);
      off('doubt:answered', handleDoubtAnswered);
      off('doubt:resolved', handleDoubtResolved);
    };
  }, [
    on,
    off,
    handleStudentRegistered,
    handleEntryCreated,
    handleEntryStatusChanged,
    handleCommentAdded,
    handleTaskAssigned,
    handleScheduleCreated,
    handleScheduleUpdated,
    handleMetricsUpdated,
    handleDoubtCreated,
    handleDoubtAnswered,
    handleDoubtResolved
  ]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    recentActivity,
    metrics,
    scheduleUpdates,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}
