import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, getCurrentUser, updateNotification } from '../../../shared/services/api';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useNotificationsData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Notification[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const markAsRead = useCallback(async (notificationId: number) => {
    const originalData = [...data];
    setData(currentData =>
      currentData.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    try {
      await updateNotification(notificationId, { is_read: true });
    } catch (err) {
      setData(originalData);
      alert('Failed to mark notification as read.');
    }
  }, [data]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const user = await getCurrentUser();
        const notifications = await fetchNotifications(user.id);

        if (!mounted) return;
        setData(notifications);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load notifications');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return { loading, error, data, refetch, markAsRead };
}