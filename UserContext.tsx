import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

export interface UserProfile {
  id?: number;
  name: string;
  job: string;
  phone: string;
  zip: string;
  address: string;
  businessName: string;
  businessAddress: string;
  businessContent: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '山田 太郎',
  job: '個人事業主',
  phone: '090-1234-5678',
  zip: '100-0001',
  address: '東京都千代田区千代田1-1',
  businessName: '山田テック',
  businessAddress: '東京都千代田区千代田1-1',
  businessContent: 'Webサイト制作、システム開発、ITコンサルティング'
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => Promise<void>;
  targetYear: number;
  setTargetYear: (year: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const profile = useLiveQuery(() => db.profile.get(1));
  const [targetYear, setTargetYear] = React.useState(new Date().getFullYear());

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    // If accessing for the first time, profile might be undefined
    const currentProfile = profile || DEFAULT_PROFILE;
    await db.profile.put({ ...currentProfile, ...newProfile, id: 1 });
  };

  // While loading, we can return default or null. using default for now to prevent UI flicker
  const currentProfile = profile || DEFAULT_PROFILE;

  return (
    <UserContext.Provider value={{ profile: currentProfile, updateProfile, targetYear, setTargetYear }}>
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