import { useUser } from "@/contexts/UserContext";
import * as api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const { setUserId, setUserName, setIsApproval } = useUser();

  // useAuth.ts
  const login = async (email: string, password: string) => {
    try {
      const token = await api.login(email, password);
      await AsyncStorage.setItem("access_token", token);
      const user = await api.getCurrentUser();

      setUserId(user.id);
      setUserName(user.name);
      setIsApproval(user.is_approver);

      return user;
    } catch (err: any) {
      console.error("Login failed:", err);
      // Extract useful message if available
      const message =
        err.message?.includes("Failed to fetch user") || err.message?.includes("Invalid")
          ? "Invalid email or password."
          : err.message || "Login failed.";
      throw new Error(message);
    }
  };

  const register = async (payload: {
    company_id: number;
    name: string;
    email: string;
    user_type: number;
    password: string;
  }) => {
    try {
      return await api.registerApplicant(payload);
    } catch (err: any) {
      console.error("Register failed:", err);
      const message =
        err.message?.includes("already exists") || err.message?.includes("duplicate")
          ? "An account with this email already exists."
          : err.message || "Registration failed.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setUserId(null);
    setIsApproval(false);
  };

  return { login, register, logout };
}