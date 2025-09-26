import React, { createContext, useContext, useState, ReactNode } from "react";

type UserContextType = {
  userId: number | null;
  setUserId: (id: number | null) => void;
  isApproval: boolean;
  setIsApproval: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);

  // global isApproval flag
  const [isApproval, setIsApproval] = useState<boolean>(false);

  return (
    <UserContext.Provider value={{ userId, setUserId, isApproval, setIsApproval }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};