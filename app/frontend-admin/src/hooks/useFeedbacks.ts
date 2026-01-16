import { useState, useEffect, useCallback } from 'react';
import { fetchFeedbacks as fetchFeedbacksApi, fetchUsers } from '../../../shared/services/api';

export interface Feedback {
  id: number;
  user_id: number;
  user_name: string;
  title: string;
  message: string;
  created_at: string;
}

export const useFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feedbacksData, usersData] = await Promise.all([
        fetchFeedbacksApi(),
        fetchUsers()
      ]);

      const users = Array.isArray(usersData) ? usersData : (usersData.results || []);
      const userMap = new Map(users.map((u: any) => [u.id, u.name]));

      const enrichedFeedbacks = feedbacksData.map((f: any) => ({
        ...f,
        user_name: userMap.get(f.user_id) || `User ${f.user_id}`
      }));

      // Sort by date desc
      enrichedFeedbacks.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFeedbacks(enrichedFeedbacks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  return { feedbacks, loading, error, refetch: fetchFeedbacks };
};