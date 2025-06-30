import React, { createContext, useContext, useState, ReactNode } from 'react';

const NotificationModalContext = createContext({
  visible: false,
  open: () => {},
  close: () => {},
});

export const useNotificationModal = () => useContext(NotificationModalContext);

interface NotificationModalProviderProps {
  children: ReactNode;
}

export const NotificationModalProvider = ({ children }: NotificationModalProviderProps) => {
  const [visible, setVisible] = useState(false);
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <NotificationModalContext.Provider value={{ visible, open, close }}>
      {children}
    </NotificationModalContext.Provider>
  );
}; 