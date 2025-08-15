// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
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
    metadata?: any
  ) => Promise<{ error: { message: string } | null }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ error: { message: string } | null }>;
  updateUserPlan: (
    plan: 'lifetime'
  ) => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: ReactNode;
  navigate: (page: string) => void;
}> = ({ children, navigate }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);

  const isRecoveryRef = useRef(false);

  // 1) Se a URL já vier com #...type=recovery..., manda direto p/ tela e libera o loading
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      isRecoveryRef.current = true;
      navigate('reset-password');
      // importante: liberar o spinner
      setInitialLoading(false);
    }
  }, [navigate]);

  // 2) Listener do Supabase
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY' || isRecoveryRef.current) {
        isRecoveryRef.current = true;
        navigate('reset-password');
        // importante: liberar o spinner e limpar qualquer sessão antiga
        setSession(null);
        setUser(null);
        setInitialLoading(false);
        return;
      }

      setSession(s as Session);
      setUser(s?.user as User);
      setInitialLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleError = (err: { message: string } | null) => {
    setError(err);
    if (err) setTimeout(() => setError(null), 5000);
    return { error: err };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ...(metadata || {}), is_validated: false },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    return handleError(error as any);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return handleError(error as any);

    const isValidated = (data.user as any)?.user_metadata?.is_validated;
    if (!isValidated) {
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

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // local e produção
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
