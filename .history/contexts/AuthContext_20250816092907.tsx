// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '../types';

/**
 * URL base do app (prod: Vercel / dev: localhost)
 * Defina em produção: VITE_SITE_URL = https://seu-projeto.vercel.app
 */
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
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

    // Normaliza: Supabase mostra "Display name" com base em full_name
    const full_name = (metadata?.full_name || metadata?.fullName || '').trim();
    const whatsapp = (metadata?.whatsapp || '').trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, whatsapp }, // auth.users.raw_user_meta_data
        // SPA + hash routing => use "#login" para evitar 404 na Vercel
        emailRedirectTo: `${SITE_URL}/#login`,
        autoSignIn: false,
      },
    });

    // Força refletir meta imediatamente no painel (às vezes demora)
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
    // Direciona para a "tela" de reset do seu SPA com hash
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/#reset-password`,
    });
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
