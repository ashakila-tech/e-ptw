import { useState, useCallback, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { fetchNotifications } from "../../shared/services/api";

export function useNotification() {
  const { userId } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { notifications, loading, refetch: fetch };
}