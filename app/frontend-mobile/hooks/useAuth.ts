import { useUser } from "@/contexts/UserContext";
import * as api from "@/services/api"; // adjust import path if needed
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const { setUserId, setIsApproval } = useUser();

  const login = async (email: string, password: string) => {
    const token = await api.login(email, password);
    const user = await api.getCurrentUser();

    console.log("Logged in user:", user);

    setUserId(user.id);
    setIsApproval(user.user_type === "approver");

    return user;
  };

  const register = async (payload: {
    company_id: number;
    name: string;
    email: string;
    user_type: string;
    password: string;
  }) => {
    return await api.registerUser(payload);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setUserId(null);
    setIsApproval(false);
  };

  return { login, register, logout };
}