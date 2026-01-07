import { useEffect, useState } from 'react';
import { getCurrentUser, updateUser } from '../../../shared/services/api';

export function useSettings() {
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isPasswordMismatch = password && confirmPassword && password !== confirmPassword;
  
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user.id) setUserId(user.id);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
      })
      .catch((err) => console.error('Failed to fetch user settings:', err));
  }, []);

  const saveDetails = async () => {
    if (!userId) return;
    try {
      await updateUser(userId, { name, email });
      alert('Details updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update details');
    }
  };

  const savePassword = async () => {
    if (!userId) return;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await updateUser(userId, { password });
      alert('Password updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    }
  };

  return { 
    name, email, password, confirmPassword,
    setName, setEmail, setPassword, setConfirmPassword,
    isPasswordMismatch,
    saveDetails,
    savePassword,
  };
}