import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  job: string;
  phone: string;
  zip: string;
  address: string;
  businessName: string;
  businessAddress: string;
  businessContent: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '山田 太郎',
    job: '個人事業主',
    phone: '090-1234-5678',
    zip: '100-0001',
    address: '東京都千代田区千代田1-1',
    businessName: '山田テック',
    businessAddress: '東京都千代田区千代田1-1',
    businessContent: 'Webサイト制作、システム開発、ITコンサルティング'
  });

  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, googleToken, setGoogleToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};