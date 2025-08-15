// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  error: { message: string } | null;

  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string; fullName?: string; whatsapp?: string }
  ) => Promise<{ error: { message: string } | null }>;

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s as Session);
      setUser(s?.user as User);
      setInitialLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleError = (err: { message: string } | null) => {
    setError(err);
    if (err) setTimeout(() => setError(null), 5000);
    return { error: err };
  };

  // ------------------- SIGN UP -------------------
  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; fullName?: string; whatsapp?: string }
  ) => {
    setLoading(true);

    // normaliza chaves: Supabase mostra "Display name" a partir de full_name
    const full_name = metadata?.full_name || metadata?.fullName || '';
    const whatsapp = metadata?.whatsapp || '';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Estes campos ficam em auth.users.raw_user_meta_data
        data: { full_name, whatsapp },
        emailRedirectTo: `${window.location.origin}/login`,
        autoSignIn: false,
      },
    });

    // Reforça a atualização do metadata para refletir de imediato no painel
    if (!error && data.user) {
      await supabase.auth.updateUser({ data: { full_name, whatsapp } });
    }

    setLoading(false);
    return handleError(error as any);
  };

  // ------------------- LOGIN -------------------
  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return handleError(error as any);

    const isValidated = (data.user as any)?.user_metadata?.is_validated;
    if (isValidated === false) {
      await supabase.auth.signOut();
      return handleError({ message: 'Conta não validada. Aguarde confirmação.' });
    }

    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  // ------------------- RESET PASSWORD -------------------
  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    const redirectTo = `${window.location.origin}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    return handleError(error as any);
  };

  const updateUserPlan = async (plan: 'lifetime') => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { plan } });
    setLoading(false);
    return error ? handleError(error as any) : { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        initialLoading,
        error,
        signUp,
        login,
        signOut,
        requestPasswordReset,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
