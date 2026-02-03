import { useEffect, useState, useCallback } from 'react';
import { 
  fetchAllNotifications,
  fetchUsers, 
} from '../../../shared/services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [notificationsData, usersData] = await Promise.all([
          fetchAllNotifications(),
          fetchUsers(),
        ]);

        if (!mounted) return;

        setNotifications(notificationsData);
        setUsers(Array.isArray(usersData) ? usersData : (usersData.results || []));
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load notifications data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [refreshKey]);

  return { 
    notifications, users,
    loading, error, refetch 
  };
}