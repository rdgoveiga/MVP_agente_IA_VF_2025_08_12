import { supabase } from '../lib/supabaseClient';
import type { Prospect, UserSettings } from '../types';

/** Defaults mostrados na UI */
const defaultSettings: UserSettings = {
  messageTemplate:
    'Tenho vasta experiência ajudando negócios a crescerem com marketing digital focado em performance.',
  kanbanColumnTitles: {
    new: 'Novos',
    contacted: 'Contatados',
    negotiating: 'Em Negociação',
    won: 'Contrato fechado',
  },
};

/* ===================== PROSPECTS ===================== */

export async function getProspects(userId: string): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching prospects:', error);
    throw new Error(error.message);
  }

  const list = (data as Prospect[]) ?? [];
  return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function addProspects(
  userId: string,
  prospects: Omit<Prospect, 'id' | 'user_id'>[]
): Promise<Prospect[]> {
  const rows = (prospects ?? []).map((p: any) => {
    const { address, ...rest } = p ?? {};
    return { ...rest, user_id: userId };
  });

  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return (data as Prospect[]) ?? [];
  } catch (err: any) {
    console.warn('Insert with select failed, retrying without select →', err?.message);
    const { error: err2 } = await supabase.from('prospects').insert(rows);
    if (err2) {
      console.error('Error adding prospects:', err2);
      throw new Error(err2.message);
    }
    return []; // front usa fallback para mostrar os resultados
  }
}

export async function updateProspect(
  userId: string,
  prospectId: string,
  updates: Partial<Prospect>
): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', prospectId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating prospect:', error);
    throw new Error(error.message);
  }
}

export async function deleteProspect(userId: string, prospectId: string): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', prospectId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting prospect:', error);
    throw new Error(error.message);
  }
}

export async function clearProspects(userId: string): Promise<void> {
  const { error } = await supabase.from('prospects').delete().eq('user_id', userId);
  if (error) {
    console.error('Error clearing prospects:', error);
    throw new Error(error.message);
  }
}

/* ===================== USER SETTINGS (tolerante a snake_case/camelCase) ===================== */
/**
 * Seu banco pode ter as colunas como:
 *   - snake_case: message_template / kanban_column_titles
 *   - camelCase:  messageTemplate  / kanbanColumnTitles
 *
 * Abaixo lemos com select('*') (evita 400 por coluna inexistente) e
 * fazemos upsert com fallback: tentamos snake_case e, se der 42703, tentamos camelCase.
 */

export async function getSettings(userId: string): Promise<UserSettings> {
  // Lê qualquer coluna existente sem especificar nomes
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = "Results contain 0 rows" em algumas versões
    console.error('Error fetching settings:', error);
    throw new Error(error.message);
  }

  // Se não existe, cria com defaults tentando snake_case -> camelCase
  if (!data) {
    const snakePayload = {
      user_id: userId,
      message_template: defaultSettings.messageTemplate,
      kanban_column_titles: defaultSettings.kanbanColumnTitles,
    };
    const camelPayload = {
      user_id: userId,
      messageTemplate: defaultSettings.messageTemplate,
      kanbanColumnTitles: defaultSettings.kanbanColumnTitles,
    };

    let err1 = null;
    const ins1 = await supabase.from('user_settings').insert([snakePayload]);
    if (ins1.error && ins1.error.code === '42703') {
      err1 = ins1.error;
      const ins2 = await supabase.from('user_settings').insert([camelPayload]);
      if (ins2.error) {
        console.error('Error creating default settings (camelCase):', ins2.error);
        throw new Error(ins2.error.message);
      }
    } else if (ins1.error) {
      console.error('Error creating default settings (snake_case):', ins1.error);
      throw new Error(ins1.error.message);
    }

    return { ...defaultSettings };
  }

  // Mapeia de qualquer formato para o esperado pela UI
  const row: any = data;
  let titles = defaultSettings.kanbanColumnTitles;
  const rawTitles = row.kanban_column_titles ?? row.kanbanColumnTitles;

  if (rawTitles) {
    if (typeof rawTitles === 'string') {
      try { titles = JSON.parse(rawTitles); } catch { titles = defaultSettings.kanbanColumnTitles; }
    } else if (typeof rawTitles === 'object') {
      titles = rawTitles;
    }
  }

  return {
    messageTemplate: row.message_template ?? row.messageTemplate ?? defaultSettings.messageTemplate,
    kanbanColumnTitles: titles,
  };
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<void> {
  // Tenta snake_case
  const snakePayload = {
    user_id: userId,
    message_template: settings.messageTemplate ?? defaultSettings.messageTemplate,
    kanban_column_titles: settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
  };

  let up1 = await supabase.from('user_settings').upsert(snakePayload, { onConflict: 'user_id' });
  if (up1.error && up1.error.code === '42703') {
    // Tenta camelCase
    const camelPayload = {
      user_id: userId,
      messageTemplate: settings.messageTemplate ?? defaultSettings.messageTemplate,
      kanbanColumnTitles: settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
    };
    const up2 = await supabase.from('user_settings').upsert(camelPayload, { onConflict: 'user_id' });
    if (up2.error) {
      console.error('Error updating settings (camelCase):', up2.error);
      throw new Error(up2.error.message);
    }
  } else if (up1.error) {
    console.error('Error updating settings (snake_case):', up1.error);
    throw new Error(up1.error.message);
  }
}
