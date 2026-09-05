import React, {createContext, useEffect, useState} from 'react';

const ADMIN_SESSION_KEY = 'ltc-admin-session';
const ADMIN_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

const readAdminSession = () => {
  try {
    const storedSession = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (
      storedSession?.username &&
      Number(storedSession.expiresAt) > Date.now()
    ) {
      return storedSession;
    }
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (storageError) {
      /* Browser storage is unavailable. */
    }
  }
  return null;
};

const AuthContext = createContext({
  isLoggedIn: false,
  adminName: '',
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({children}) => {
  const [session, setSession] = useState(readAdminSession);

  const login = username => {
    const nextSession = {
      username: String(username || '').trim(),
      expiresAt: Date.now() + ADMIN_SESSION_DURATION,
    };
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
    } catch (error) {
      /* The in-memory session still works when browser storage is unavailable. */
    }
    setSession(nextSession);
  };

  const logout = () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      /* The in-memory session can still be cleared. */
    }
    setSession(null);
  };

  useEffect(() => {
    const expiryCheck = window.setInterval(() => {
      if (session && session.expiresAt <= Date.now()) {
        try {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        } catch (error) {
          /* The in-memory session can still expire. */
        }
        setSession(null);
      }
    }, 60 * 60 * 1000);
    return () => window.clearInterval(expiryCheck);
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: Boolean(session),
        adminName: session?.username || '',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
