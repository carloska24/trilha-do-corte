// Simple utility to manage 'Broadcast' notifications using LocalStorage
// This simulates a backend push notification system.

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'alert' | 'success' | 'opportunity' | 'promo' | 'loyalty';
  read: boolean;
  actionLink?: string; // e.g. 'booking'
}

const STORAGE_KEY = 'TRILHA_NOTIFICATIONS';
// Unique event name for cross-component communication
const EVENT_NAME = 'notification-update';

export const getNotifications = (): Notification[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const sendBroadcastNotification = (
  title: string,
  message: string,
  type: 'info' | 'alert' | 'success' | 'opportunity' | 'promo' | 'loyalty' = 'info'
) => {
  const current = getNotifications();
  const newNotif: Notification = {
    id: Date.now().toString(),
    title,
    message,
    timestamp: new Date().toISOString(),
    type,
    read: false,
    actionLink: 'booking',
  };

  const updated = [newNotif, ...current].slice(0, 20); // Keep last 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch event so other components verify immediately
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const markAllAsRead = () => {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const clearAllNotifications = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const deleteNotification = (id: string) => {
  const current = getNotifications();
  const updated = current.filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
};

// Helper: Get relative time string
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
};

// Hook for React Components
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    refresh();

    // Listen for our custom event (triggered by Admin sending)
    window.addEventListener(EVENT_NAME, refresh);
    // Listen for storage events (if tabs are different)
    window.addEventListener('storage', refresh);

    // Polling fallback (robustness for demo)
    const intervalId = setInterval(refresh, 3000);

    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener('storage', refresh);
      clearInterval(intervalId);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAllAsRead, clearAllNotifications, deleteNotification };
};
