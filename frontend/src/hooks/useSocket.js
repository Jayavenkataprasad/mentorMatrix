import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Create socket connection
    socketRef.current = io('https://mentormatrix.onrender.com', {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      isConnectedRef.current = true;
    });

    // Disconnection event
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      isConnectedRef.current = false;
    });

    // Error event
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Subscribe to mentor room
  const subscribeMentor = useCallback((mentorId) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('subscribe:mentor', mentorId);
    }
  }, []);

  // Subscribe to student room
  const subscribeStudent = useCallback((studentId) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('subscribe:student', studentId);
    }
  }, []);

  // Subscribe to cohort room
  const subscribeCohort = useCallback((cohortId) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('subscribe:cohort', cohortId);
    }
  }, []);

  // Listen to event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Stop listening to event
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Emit event
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
    subscribeMentor,
    subscribeStudent,
    subscribeCohort,
    on,
    off,
    emit
  };
}
