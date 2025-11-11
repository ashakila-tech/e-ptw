import React, { createContext, useContext, useState, ReactNode } from "react";

type UserContextType = {
  userId: number | null;
  setUserId: (id: number | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  isApproval: boolean;
  setIsApproval: (value: boolean) => void;
  isSecurity: boolean;
  setIsSecurity: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isApproval, setIsApproval] = useState<boolean>(false);
  const [isSecurity, setIsSecurity] = useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userName,
        setUserName,
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