
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AIPathChat from './pages/AIPathChat';
import Fitness from './pages/Fitness';
import Community from './pages/Community';
import Store from './pages/Store';
import SkinCare from './pages/SkinCare';
import FamilyCare from './pages/FamilyCare';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import { db } from './firebase';
import { doc, getDoc } from '@firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string, password?: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nestgirl_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (phone: string, password?: string): Promise<{success: boolean, message?: string}> => {
    setLoading(true);
    try {
      // Admin check
      if (phone === '0781285431') {
        const adminUser: UserProfile = {
          uid: 'admin',
          name: 'الأدمن',
          phone,
          dob: '1990-01-01',
          height: 170,
          weight: 60,
          status: 'أم' as any,
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('nestgirl_user', JSON.stringify(adminUser));
        return { success: true };
      }

      // User check in Firestore
      const userRef = doc(db, 'users', phone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        
        // Verify password
        if (password && userData.password === password) {
          setUser(userData);
          localStorage.setItem('nestgirl_user', JSON.stringify(userData));
          return { success: true };
        } else {
          return { success: false, message: 'كلمة المرور غير صحيحة' };
        }
      }
      return { success: false, message: 'هذا الرقم غير مسجل لدينا' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'حدث خطأ غير متوقع' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nestgirl_user');
  };

  const refreshUser = async () => {
    if (user?.phone) {
      const userRef = doc(db, 'users', user.phone);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        setUser(userData);
        localStorage.setItem('nestgirl_user', JSON.stringify(userData));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.isAdmin ? "/admin" : "/dashboard"} /> : <Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/" />} />
          <Route path="/chat" element={user ? <Layout><AIPathChat /></Layout> : <Navigate to="/" />} />
          <Route path="/fitness" element={user ? <Layout><Fitness /></Layout> : <Navigate to="/" />} />
          <Route path="/community" element={user ? <Layout><Community /></Layout> : <Navigate to="/" />} />
          <Route path="/store" element={user ? <Layout><Store /></Layout> : <Navigate to="/" />} />
          <Route path="/skincare" element={user ? <Layout><SkinCare /></Layout> : <Navigate to="/" />} />
          <Route path="/family" element={user ? <Layout><FamilyCare /></Layout> : <Navigate to="/" />} />
          
          <Route path="/admin" element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
