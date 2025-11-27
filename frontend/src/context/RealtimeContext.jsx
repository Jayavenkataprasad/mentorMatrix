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

  // Subscribe to appropriate room on mount
  useEffect(() => {
    if (!userId) return;

    if (userRole === 'mentor') {
      subscribeMentor(userId);
    } else if (userRole === 'student') {
      subscribeStudent(userId);
    }
  }, [userId, userRole, subscribeMentor, subscribeStudent]);

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
  }, []);

  // Handle entry created (mentor)
  const handleEntryCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'entry:created',
      message: `New entry created`,
      data: data.entry,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setRecentActivity(prev => [notification, ...prev].slice(0, 10));
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  // Handle schedule created (both)
  const handleScheduleCreated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'schedule:created',
      message: `New schedule: ${data.schedule.title}`,
      data: data.schedule,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setScheduleUpdates(prev => [data.schedule, ...prev]);
  }, []);

  // Handle schedule updated (both)
  const handleScheduleUpdated = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: 'schedule:updated',
      message: `Schedule updated: ${data.schedule.title}`,
      data: data.schedule,
      timestamp: new Date(data.timestamp),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setScheduleUpdates(prev => [data.schedule, ...prev]);
  }, []);

  // Handle metrics updated (mentor)
  const handleMetricsUpdated = useCallback((data) => {
    setMetrics(data.metrics);
  }, []);

  // Handle doubt created (primarily mentors, but students can also see confirmation)
  const handleDoubtCreated = useCallback((data) => {
    const { doubt } = data;
    const notification = {
      id: Date.now(),
      type: 'doubt:created',
      message: userRole === 'mentor'
        ? `New doubt: ${doubt.question}`
        : `Your doubt has been submitted: ${doubt.question}`,
      data: doubt,
      timestamp: new Date(data.timestamp || new Date()),
      read: false
    };

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
