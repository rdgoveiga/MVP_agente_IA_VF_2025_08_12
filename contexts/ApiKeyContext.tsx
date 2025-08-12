import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type ApiProvider = 'gemini' | 'openai';

interface ApiKeyContextType {
  apiKey: string | null;
  provider: ApiProvider | null;
  loading: boolean;
  setApiKey: (key: string, provider: ApiProvider) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'ai-prospector-api-key';
const API_PROVIDER_STORAGE_KEY = 'ai-prospector-api-provider';

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [apiKey, setApiKeyState] = useState<string | null>(null);
    const [provider, setProviderState] = useState<ApiProvider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            const storedProvider = localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiProvider | null;
            if (storedKey && storedProvider) {
                setApiKeyState(storedKey);
                setProviderState(storedProvider);
            }
        } catch (error) {
            console.error("Failed to load API key from storage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const setApiKey = useCallback((key: string, prov: ApiProvider) => {
        try {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            localStorage.setItem(API_PROVIDER_STORAGE_KEY, prov);
            setApiKeyState(key);
            setProviderState(prov);
        } catch (error) {
            console.error("Failed to save API key to storage", error);
        }
    }, []);

    const clearApiKey = useCallback(() => {
        try {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            localStorage.removeItem(API_PROVIDER_STORAGE_KEY);
            setApiKeyState(null);
            setProviderState(null);
        } catch (error) {
            console.error("Failed to clear API key from storage", error);
        }
    }, []);

    const value = { apiKey, provider, loading, setApiKey, clearApiKey };

    return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKey = (): ApiKeyContextType => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within an ApiKeyProvider');
    }
    return context;
};
