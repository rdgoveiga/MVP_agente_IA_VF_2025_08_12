
import { supabase } from '../lib/supabaseClient';
import { Prospect, UserSettings, ProspectStatus } from '../types';

const defaultSettings: UserSettings = {
    messageTemplate: 'Tenho vasta experiência ajudando negócios a crescerem com marketing digital focado em performance.',
    kanbanColumnTitles: {
        new: 'Novos',
        contacted: 'Contatados',
        negotiating: 'Em Negociação',
        won: 'Contrato fechado',
    },
};

// --- Prospects ---

export async function getProspects(userId: string): Promise<Prospect[]> {
    const { data, error } = await (supabase as any).from('prospects').select('id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis');
    if (error) {
        console.error('Error fetching prospects:', error);
        throw new Error(error.message);
    }
    return (data as Prospect[] || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function addProspects(userId: string, prospects: Omit<Prospect, 'id'| 'user_id'>[]): Promise<Prospect[]> {
    const prospectsWithUserId = prospects.map(p => {
        // Remove unsupported columns like address before inserting
        const { address, ...rest } = p as any;
        return { ...rest, user_id: userId };
    });
    const { data, error } = await (supabase as any).from('prospects').insert(prospectsWithUserId).select('id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis');

    if (error) {
        console.error('Error adding prospects:', error);
        throw new Error(error.message);
    }
    return data as Prospect[];
}

export async function updateProspect(userId: string, prospectId: string, updates: Partial<Prospect>): Promise<void> {
    const { error } = await (supabase as any).from('prospects').update(updates).eq('id', prospectId);

    if (error) {
        console.error('Error updating prospect:', error);
        throw new Error(error.message);
    }
}

export async function deleteProspect(userId: string, prospectId: string): Promise<void> {
    const { error } = await (supabase as any).from('prospects').delete().eq('id', prospectId);

    if (error) {
        console.error('Error deleting prospect:', error);
        throw new Error(error.message);
    }
}

export async function clearProspects(userId: string): Promise<void> {
    const { error } = await (supabase as any).from('prospects').delete().eq('user_id', userId);

    if (error) {
        console.error('Error clearing prospects:', error);
        throw new Error(error.message);
    }
}

// --- User Settings ---

export async function getSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await (supabase as any).from('user_settings').select('*');
     if (error) {
        console.error('Error fetching settings:', error);
        throw new Error(error.message);
    }
    if (data && data.length > 0) {
        // Ensure old settings with 'dismissed' are compatible
        const settings = data[0] as UserSettings;
        if (!settings.kanbanColumnTitles.won) {
             settings.kanbanColumnTitles = defaultSettings.kanbanColumnTitles;
        }
        return settings;
    }
    // If no settings exist, create and return default ones
    await (supabase as any).from('user_settings').upsert([{ ...defaultSettings, user_id: userId }]);
    return defaultSettings;
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<void> {
    const { error } = await (supabase as any).from('user_settings').upsert([{ ...settings, user_id: userId }]);
     if (error) {
        console.error('Error updating settings:', error);
        throw new Error(error.message);
    }
}