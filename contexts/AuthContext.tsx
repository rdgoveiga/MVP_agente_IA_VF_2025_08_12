

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
    const [actionLoading, setActionLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<{ message: string } | null>(null);

    useEffect(() => {
        // This logic is now compatible with both the real and simulated Supabase client.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session as Session | null);
            setUser(session?.user as User ?? null);
            setInitialLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    
    const handleError = (error: { message: string } | null) => {
        setError(error);
        // Limpa o erro após um tempo
        if(error) setTimeout(() => setError(null), 5000);
        return { error };
    }

    const value: AuthContextType = {
        session,
        user,
        loading: actionLoading,
        initialLoading,
        error,
        signUp: async (email, password, metadata) => {
            setActionLoading(true);
            const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
            setActionLoading(false);
            return handleError(error);
        },
        login: async (email, password) => {
            setActionLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setActionLoading(false);
            // On successful login, the onAuthStateChange listener will handle the session update.
            // So we just need to return the error status.
            if(error) {
                return handleError(error);
            }
            return { error: null };
        },
        signOut: async () => {
            setActionLoading(true);
            await supabase.auth.signOut();
            setActionLoading(false);
        },
        requestPasswordReset: async (email: string) => {
            setActionLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            setActionLoading(false);
            return handleError(error);
        },
        updateUserPlan: async (plan: 'lifetime') => {
            setActionLoading(true);
            const { error } = await supabase.auth.updateUser({ data: { plan } });
            setActionLoading(false);
            if(error) {
                return handleError(error);
            }
            return { error: null };
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};