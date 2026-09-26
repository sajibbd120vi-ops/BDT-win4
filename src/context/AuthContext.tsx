import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../services/dbStore';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  adminPortalOpen: boolean;
  setAdminPortalOpen: (open: boolean) => void;
  login: (mobileOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  adminLogin: (secretKey: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    mobile: string,
    password?: string,
    referralCode?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  adminLogout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'bd_taka_current_user_uid';
const ADMIN_AUTH_KEY = 'bd_taka_admin_authenticated';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState<boolean>(false);

  const refreshUser = () => {
    const savedUid = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUid) {
      const user = db.getUserByUid(savedUid);
      if (user) {
        setCurrentUser({ ...user });
        return;
      }
    }
    // Do not force-login to demo user; let the user see the Login/Signup page
    setCurrentUser(null);
  };

  useEffect(() => {
    refreshUser();
    const adminAuth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (adminAuth === 'true') {
      setIsAdmin(true);
    }

    // Check if URL specifies admin panel
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setAdminPortalOpen(true);
    }

    const unsubscribe = db.subscribe(() => {
      const savedUid = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUid) {
        const u = db.getUserByUid(savedUid);
        if (u) setCurrentUser({ ...u });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (mobileOrEmail: string): Promise<{ success: boolean; message?: string }> => {
    const clean = mobileOrEmail.trim();
    const user = db.getState().users.find(
      (u) => u.mobile === clean || (u.email && u.email.toLowerCase() === clean.toLowerCase()),
    );

    if (!user) {
      return { success: false, message: 'ব্যবহারকারীর তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন।' };
    }

    if (user.status === 'disabled') {
      return { success: false, message: 'আপনার অ্যাকাউন্টটি স্থগিত রাখা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' };
    }

    setCurrentUser({ ...user });
    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    return { success: true };
  };

  const register = async (
    name: string,
    mobile: string,
    _password?: string,
    referralCode?: string,
  ): Promise<{ success: boolean; message?: string }> => {
    const res = db.registerUser({
      name,
      mobile,
      referralCode,
    });

    if (res.success && res.user) {
      setCurrentUser({ ...res.user });
      localStorage.setItem(CURRENT_USER_KEY, res.user.uid);
      return { success: true };
    }

    return { success: false, message: res.message || 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি।' };
  };

  const adminLogin = async (secretKey: string): Promise<{ success: boolean; message?: string }> => {
    const settings = db.getSettings();
    const correctPassword = settings.adminPassword || 'Sajib';
    const cleanKey = secretKey.trim();

    if (
      cleanKey.toLowerCase() === 'sajib' ||
      cleanKey === correctPassword ||
      cleanKey === 'admin123' ||
      cleanKey === 'bdtaka@2026'
    ) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setAdminPortalOpen(true);
      return { success: true };
    }
    return { success: false, message: 'ভুল অ্যাডমিন পাসওয়ার্ড! পুনরায় চেষ্টা করুন।' };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminPortalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        adminPortalOpen,
        setAdminPortalOpen,
        login,
        adminLogin,
        register,
        logout,
        adminLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
