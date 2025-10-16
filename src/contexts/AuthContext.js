'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isAdmin = session?.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ session, status, isAuthenticated, isAdmin, user: session?.user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


