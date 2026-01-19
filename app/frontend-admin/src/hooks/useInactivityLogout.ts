import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../shared/services/api';

/**
 * Hook to force logout after a set period of inactivity.
 * @param timeoutMinutes - Duration of inactivity in minutes before logging out (default: 10)
 */
export const useInactivityLogout = (timeoutMinutes: number = 10) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      // Clear the token using the shared api service
      await logout();
      // Redirect to the login page (adjust '/' to '/login' if that is your route)
      navigate('/'); 
    } catch (error) {
      console.error("Logout failed", error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Avoid setting the timer if already on the login page
    if (window.location.pathname === '/' || window.location.pathname === '/login') return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
    };

    // List of events that reset the inactivity timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    resetTimer();

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [handleLogout, timeoutMinutes]);
};