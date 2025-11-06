import { useUser } from "@/contexts/UserContext";
import * as api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const { setUserId, setUserName, setIsApproval } = useUser();

  const login = async (email: string, password: string) => {
    try {
      const token = await api.login(email, password);
      // Store token first — getCurrentUser() will read it from AsyncStorage
      await AsyncStorage.setItem("access_token", token);

      const user = await api.getCurrentUser();

      setUserId(user.id);
      setUserName(user.name);
      setIsApproval(user.is_approver);

      return user;
    } catch (err: any) {
      console.error("Login failed:", err);
      throw new Error(err.message || "Invalid credentials");
    }
  };

  const register = async (payload: {
    company_id: number;
    name: string;
    email: string;
    user_type: number;
    password: string;
  }) => {
    return await api.registerApplicant(payload);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setUserId(null);
    setIsApproval(false);
  };

  return { login, register, logout };
}