import { supabase } from '../lib/supabaseClient';
import type { Prospect, UserSettings } from '../types';

/** Defaults exibidos na UI */
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
  // Seleciona tudo e filtra por user_id (deixa compatível com qualquer schema de colunas que você já tenha)
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching prospects:', error);
    throw new Error(error.message);
  }

  const list = (data as Prospect[]) ?? [];
  // Ordena por nome só para ficar estável na UI
  return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function addProspects(
  userId: string,
  prospects: Omit<Prospect, 'id' | 'user_id'>[]
): Promise<Prospect[]> {
  const rows = (prospects ?? []).map((p: any) => {
    // remove campos que não existem na tabela (ex.: address)
    const { address, ...rest } = p ?? {};
    return { ...rest, user_id: userId };
  });

  // 1ª tentativa: insert + select (se a policy permitir SELECT no retorno)
  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return (data as Prospect[]) ?? [];
  } catch (err: any) {
    // Se o SELECT no retorno for bloqueado por RLS, faz insert simples
    console.warn('Insert with select failed, retrying without select →', err?.message);
    const { error: err2 } = await supabase.from('prospects').insert(rows);
    if (err2) {
      console.error('Error adding prospects:', err2);
      throw new Error(err2.message);
    }
    // Sem IDs retornados; o front usa fallback para exibir os resultados
    return [];
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

/* ===================== USER SETTINGS (snake_case no DB) ===================== */
/**
 * DB está com colunas: user_id, message_template (text), kanban_column_titles (jsonb).
 * Aqui mapeamos para o formato camelCase usado na UI:
 *   - message_template           → messageTemplate
 *   - kanban_column_titles (json)→ kanbanColumnTitles
 */

export async function getSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, message_template, kanban_column_titles')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw new Error(error.message);
  }

  if (!data) {
    // cria registro padrão (SEM .select() depois, para não gerar ?columns= e 400)
    const insertPayload = {
      user_id: userId,
      message_template: defaultSettings.messageTemplate,
      kanban_column_titles: defaultSettings.kanbanColumnTitles,
    };
    const { error: errInsert } = await supabase.from('user_settings').insert([insertPayload]);
    if (errInsert) {
      console.error('Error creating default settings:', errInsert);
      throw new Error(errInsert.message);
    }
    return { ...defaultSettings };
  }

  // normaliza o JSON (pode vir objeto nativo do PostgREST)
  let titles = defaultSettings.kanbanColumnTitles;
  const raw = (data as any).kanban_column_titles;
  if (raw && typeof raw === 'object') {
    titles = raw;
  } else if (typeof raw === 'string') {
    try { titles = JSON.parse(raw); } catch {}
  }

  return {
    messageTemplate: (data as any).message_template ?? defaultSettings.messageTemplate,
    kanbanColumnTitles: titles,
  };
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<void> {
  const payload = {
    user_id: userId,
    message_template: settings.messageTemplate ?? defaultSettings.messageTemplate,
    kanban_column_titles: settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
  };

  // upsert sem .select() para evitar 400
  const { error } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    console.error('Error updating settings:', error);
    throw new Error(error.message);
  }
}
