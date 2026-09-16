import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { restoreSession, signInWithPhone as authenticatePhone, signOut as clearSession } from '@/api/session';

type AuthContextValue = {
  ready: boolean;
  signedIn: boolean;
  signIn: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    restoreSession(() => {
      setSignedIn(true);
      setReady(true);
    })
      .then((ok) => setSignedIn(ok))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      signedIn,
      signIn: async (phone: string) => {
        await authenticatePhone(phone);
        setSignedIn(true);
      },
      signOut: async () => {
        await clearSession();
        setSignedIn(false);
      },
    }),
    [ready, signedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
