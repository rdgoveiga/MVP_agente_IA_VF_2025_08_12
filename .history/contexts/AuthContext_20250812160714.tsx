import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  error: { message: string } | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: { message: string } | null }>;
  login: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: { message: string } | null }>;
  updateUserPlan: (plan: 'lifetime') => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session);
      setUser(session?.user as User);
      setInitialLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleError = (error: { message: string } | null) => {
    setError(error);
    if (error) setTimeout(() => setError(null), 5000);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp(
      { email, password },
      { options: { data: { ...metadata, is_validated: false }, emailRedirectTo: `${window.location.origin}/login`, autoSignIn: false } }
    );
    setLoading(false);
    return handleError(error);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return handleError(error);
    const isValidated = data.user?.user_metadata?.is_validated;
    if (!isValidated) {
      await supabase.auth.signOut();
      return handleError({ message: 'Conta não validada. Aguarde confirmação.' });
    }
    return { error: null };
  };

  const signOut = async () => { setLoading(true); await supabase.auth.signOut(); setLoading(false); };
  const requestPasswordReset = async (email: string) => { setLoading(true); const { error } = await supabase.auth.resetPasswordForEmail(email); setLoading(false); return handleError(error); };
  const updateUserPlan = async (plan: 'lifetime') => { setLoading(true); const { error } = await supabase.auth.updateUser({ data: { plan } }); setLoading(false); return error ? handleError(error) : { error: null }; };

  return (
    <AuthContext.Provider value={{ session, user, loading, initialLoading, error, signUp, login, signOut, requestPasswordReset, updateUserPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};