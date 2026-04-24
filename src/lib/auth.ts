import { useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'user' | 'manager' | 'partner' | 'admin' | 'superuser';

interface UserData {
  role: UserRole;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() as UserData;
        setUserData(userData);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'yourdomain.com' // Restrict to your Google Workspace domain
    });
    await signInWithPopup(auth, provider);
  };

  const signOut = () => firebaseSignOut(auth);

  const canAccessEmail = (emailTo: string[]) => {
    if (!user || !userData) return false;
    
    // Superusers can access all emails
    if (userData.role === 'superuser') return true;
    
    // Partners and admins can access all emails
    if (['partner', 'admin'].includes(userData.role)) return true;
    
    // Managers can view but not modify staff emails
    if (userData.role === 'manager') return true;
    
    // Regular users can only access their own emails
    return emailTo.includes(user.email!);
  };

  const canModifyEmail = (emailTo: string[]) => {
    if (!user || !userData) return false;
    
    // Only partners, admins, and superusers can modify emails
    if (['partner', 'admin', 'superuser'].includes(userData.role)) return true;
    
    // Regular users can only modify their own emails
    return emailTo.includes(user.email!);
  };

  const canAccessRule = () => {
    if (!userData) return false;
    return ['partner', 'admin', 'superuser'].includes(userData.role);
  };

  const canAccessPartnerDashboard = () => {
    if (!userData) return false;
    return ['partner', 'admin', 'superuser'].includes(userData.role);
  };

  const canAccessManagerDashboard = () => {
    if (!userData) return false;
    return ['manager', 'partner', 'admin', 'superuser'].includes(userData.role);
  };

  const canAccessAdminSettings = () => {
    if (!userData) return false;
    return ['admin', 'superuser'].includes(userData.role);
  };

  const canAccessDeveloperTools = () => {
    if (!userData) return false;
    return userData.role === 'superuser';
  };

  return {
    user,
    userData,
    loading,
    signIn,
    signOut,
    canAccessEmail,
    canModifyEmail,
    canAccessRule,
    canAccessPartnerDashboard,
    canAccessManagerDashboard,
    canAccessAdminSettings,
    canAccessDeveloperTools
  };
}