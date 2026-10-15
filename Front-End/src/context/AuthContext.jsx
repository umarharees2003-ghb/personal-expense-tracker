import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as loginRequest, register as registerRequest, updateCurrentUser } from '../services/authService.js';
import { getApiError, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'finora.jwt';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setAuthError('');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        if (!error.response || error.response.status !== 401) {
          setAuthError('Could not verify your session. Please retry when the server is available.');
        }
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async (credentials) => {
    setAuthBusy(true);
    try {
      const result = await loginRequest(credentials);
      sessionStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      setAuthError('');
    } catch (error) {
      setAuthError(getApiError(error, 'Unable to sign in with those credentials.'));
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const register = useCallback(async (account) => {
    setAuthBusy(true);
    try {
      await registerRequest(account);
      const result = await loginRequest({ email: account.email, password: account.password });
      sessionStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      setAuthError('');
    } catch (error) {
      setAuthError(getApiError(error, 'Unable to create your account.'));
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const result = await updateCurrentUser(profile);
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const value = useMemo(() => ({
    user, loading, authBusy, authError, login, register, logout, updateProfile,
    clearAuthError: () => setAuthError(''),
  }), [user, loading, authBusy, authError, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
