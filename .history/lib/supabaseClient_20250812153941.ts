import { createClient } from '@supabase/supabase-js';
import { User, Session, Prospect, UserSettings } from '../types';

// --- PRODUCTION/STAGING CLIENT ---
// This part will be used if Supabase credentials are provided in the environment.
const supabaseUrl = process.env.SUPABASE_URL || 'INSIRA_SUA_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'INSIRA_SUA_SUPABASE_ANON_KEY';

const shouldUseRealSupabase = supabaseUrl !== 'INSIRA_SUA_SUPABASE_URL' && supabaseAnonKey !== 'INSIRA_SUA_SUPABASE_ANON_KEY';

if (shouldUseRealSupabase) {
    console.log("Connecting to real Supabase instance.");
} else {
    console.log("Using local simulated Supabase client. Data will be stored in localStorage.");
}

// --- SIMULATED CLIENT (for local development without credentials) ---
// This class mimics the Supabase client API, using localStorage for persistence.

const AUTH_SESSION_KEY = 'sb-session-simulated';

// Function to generate a simple UUID (sufficient for simulation)
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
});

class SimulatedSupabaseClient {
    #subscribers: Set<(event: string, session: Session | null) => void> = new Set();
    #currentSession: Session | null = null;

    constructor() {
        this.#loadSession();
        window.addEventListener('storage', (e) => {
            if (e.key === AUTH_SESSION_KEY) this.#handleStorageChange();
        });
    }

    #loadSession() {
        try {
            const sessionJson = localStorage.getItem(AUTH_SESSION_KEY);
            if (!sessionJson) {
                this.#currentSession = null;
                return;
            }
            const session: Session = JSON.parse(sessionJson);
            // Simple expiration check
            if (session.expires_at && session.expires_at * 1000 < Date.now()) {
                this.#clearSession();
            } else {
                this.#currentSession = session;
            }
        } catch (e) {
            console.error("Error loading simulated session", e);
            this.#currentSession = null;
        }
    }

    #saveSession(session: Session) {
        this.#currentSession = session;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    }

    #clearSession() {
        this.#currentSession = null;
        localStorage.removeItem(AUTH_SESSION_KEY);
    }
    
    #handleStorageChange() {
        this.#loadSession();
        this.#emitAuthStateChange('SIGNED_IN_FROM_ANOTHER_TAB');
    }

    #emitAuthStateChange(event: string) {
        this.#subscribers.forEach(cb => cb(event, this.#currentSession));
    }

    #getTableData<T>(key: string): Record<string, T[]> {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    }

    #saveTableData<T>(key: string, data: Record<string, T[]>) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    from(tableName: 'prospects' | 'user_settings' | 'db_users') {
        const userId = this.#currentSession?.user?.id;

        return {
            select: async (columns = '*') => {
                if (!userId) return { data: [], error: { message: 'User not authenticated' }};
                const allData = this.#getTableData<any>(`db_${tableName}`);
                const userData = allData[userId] || [];
                return { data: userData, error: null };
            },
            insert: async (rows: any[]) => {
                 if (!userId) return { data: [], error: { message: 'User not authenticated' }};
                 const allData = this.#getTableData<any>(`db_${tableName}`);
                 const userRows = allData[userId] || [];
                 const newRowsWithIds = rows.map(row => ({ ...row, id: uuid(), user_id: userId, created_at: new Date().toISOString() }));
                 allData[userId] = [...userRows, ...newRowsWithIds];
                 this.#saveTableData(`db_${tableName}`, allData);
                 return { data: newRowsWithIds, error: null };
            },
            update: (updates: any) => ({
                eq: async (column: string, value: any) => {
                    if (!userId) return { data: [], error: { message: 'User not authenticated' }};
                    const allData = this.#getTableData<any>(`db_${tableName}`);
                    const userRows = allData[userId] || [];
                    const updatedRows = userRows.map(row => row[column] === value ? { ...row, ...updates } : row);
                    allData[userId] = updatedRows;
                    this.#saveTableData(`db_${tableName}`, allData);
                    return { data: updatedRows.filter(row => row[column] === value), error: null };
                }
            }),
            delete: () => ({
                eq: async (column: string, value: any) => {
                    if (!userId) return { error: { message: 'User not authenticated' } };
                    const allData = this.#getTableData<any>(`db_${tableName}`);
                    
                    if (column === 'user_id' && allData[value]) {
                        // Delete all rows for a user
                        delete allData[value];
                        this.#saveTableData(`db_${tableName}`, allData);
                    } else if (column === 'id' && value) {
                        // Delete a single row by its ID
                        const userRows = allData[userId] || [];
                        allData[userId] = userRows.filter(row => row.id !== value);
                        this.#saveTableData(`db_${tableName}`, allData);
                    }
                    
                    return { error: null };
                }
            }),
            upsert: async (rows: any[]) => {
                if (!userId) return { data: [], error: { message: 'User not authenticated' }};
                const allData = this.#getTableData<any>(`db_${tableName}`);
                const newSettings = { ...rows[0], user_id: userId, id: userId }; // Use user ID as ID for settings
                allData[userId] = [newSettings]; // Overwrite
                this.#saveTableData(`db_${tableName}`, allData);
                return { data: [newSettings], error: null };
            }
        }
    }
    
    auth = {
        signUp: async ({ email, password, options }: { email?: string; password?: string; options?: { data: any } }) => {
            if (!email || !password) return { data: { user: null }, error: { message: "Email and password are required." }};
            const users = this.#getTableData<User>('db_users')['all_users'] || [];
            if (users.find(u => u.email === email)) return { data: { user: null }, error: { message: 'User with this email already exists.' } };
            const newUser: User = { id: uuid(), email, user_metadata: { ...options?.data }, app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
            const allUsers = this.#getTableData<User>('db_users');
            allUsers['all_users'] = [...(allUsers['all_users'] || []), newUser];
            this.#saveTableData('db_users', allUsers);
            return { data: { user: newUser, session: null }, error: null };
        },

        signInWithPassword: async ({ email, password }: { email?: string, password?: string }) => {
            if (!email || !password) return { data: { user: null, session: null }, error: { message: "Email and password are required." }};
            const users = this.#getTableData<User>('db_users')['all_users'] || [];
            const user = users.find(u => u.email === email);
            if (!user || password === 'senhaerrada') return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
            
            const session: Session = {
                user,
                access_token: uuid(),
                refresh_token: uuid(),
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                token_type: "bearer"
            };
            this.#saveSession(session);
            this.#emitAuthStateChange('SIGNED_IN');
            return { data: { user, session }, error: null };
        },
        
        updateUser: async ({ data }: { data: any }) => {
            if (!this.#currentSession?.user) return { data: { user: null }, error: { message: "No user is signed in." } };
            const allUsersData = this.#getTableData<User>('db_users');
            let users = allUsersData['all_users'] || [];
            const updatedUsers = users.map(u => u.id === this.#currentSession!.user.id ? { ...u, user_metadata: { ...u.user_metadata, ...data } } : u);
            allUsersData['all_users'] = updatedUsers;
            this.#saveTableData('db_users', allUsersData);
            const updatedUser = updatedUsers.find(u => u.id === this.#currentSession!.user.id)!;
            const newSession: Session = { ...this.#currentSession, user: updatedUser };
            this.#saveSession(newSession);
            this.#emitAuthStateChange('USER_UPDATED');
            return { data: { user: updatedUser }, error: null };
        },

        signOut: async () => {
            this.#clearSession();
            this.#emitAuthStateChange('SIGNED_OUT');
            return { error: null };
        },

        getSession: async () => {
            this.#loadSession();
            return { data: { session: this.#currentSession }, error: null };
        },

        onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
            this.#subscribers.add(callback);
            // Simulate the initial state emission
            Promise.resolve().then(() => {
                this.#loadSession();
                callback('INITIAL_SESSION', this.#currentSession);
            });
            return {
                data: {
                    subscription: { // Match the real API structure
                        unsubscribe: () => this.#subscribers.delete(callback),
                    }
                }
            }
        },
        
        resetPasswordForEmail: async (email: string) => {
            console.log(`(Simulação) E-mail de redefinição de senha enviado para ${email}`);
            return { data: {}, error: null };
        }
    }
}

// Export either the real client or the simulated one.
export const supabase = shouldUseRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new SimulatedSupabaseClient();