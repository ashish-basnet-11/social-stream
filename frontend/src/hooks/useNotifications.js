// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll();
      const data = res.data.data.notifications;
      setNotifications(data);
      // Count unread locally
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 15 seconds to keep the sidebar updated
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, refresh: fetchNotifications };
};