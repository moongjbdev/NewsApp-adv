import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/Config';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Remove /api from the URL for socket connection
      const socketUrl = API_BASE_URL.replace('/api', '');
      console.log('🔌 Connecting to socket:', socketUrl);
      
      socketRef.current = io(socketUrl, { 
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current?.id);
        socketRef.current?.emit('register', user.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      return () => {
        console.log('🔌 Disconnecting socket...');
        socketRef.current?.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}; 