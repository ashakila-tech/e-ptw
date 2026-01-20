import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as api from "@/services/api";
import * as api from "../../shared/services/api";

type UserContextType = {
  profile: any | null;
  userId: number | null;
  setUserId: (id: number | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  companyId: number | null;
  setCompanyId: (id: number | null) => void;
  isApproval: boolean;
  setIsApproval: (value: boolean) => void;
  isSecurity: boolean;
  setIsSecurity: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isApproval, setIsApproval] = useState<boolean>(false);
  const [isSecurity, setIsSecurity] = useState<boolean>(false);

  useEffect(() => {
    const rehydrateUser = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const user = await api.getCurrentUser();
          setProfile(user);
          setUserId(user.id);
          setUserName(user.name);
          setCompanyId(user.company_id);
          setIsApproval(user.is_approver);
          setIsSecurity(user.is_security);
        }
      } catch (error) {
        console.error("Failed to rehydrate user:", error);
        // Could also clear token here if it's invalid
      }
    };

    rehydrateUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        userId,
        setUserId,
        userName,
        setUserName,
        companyId,
        setCompanyId,
        isApproval,
        setIsApproval,
        isSecurity,
        setIsSecurity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};