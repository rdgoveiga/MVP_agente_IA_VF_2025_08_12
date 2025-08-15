import { supabase } from '../lib/supabaseClient';
import type { Prospect, UserSettings } from '../types';

/** Defaults para a tela (mantendo seu formato com chaves) */
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
    .select(
      'id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis, created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prospects:', error);
    throw new Error(error.message);
  }
  return (data as Prospect[]) ?? [];
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

  // 1ª tentativa: insert + select (se policy permitir)
  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert(rows)
      .select('*');

    if (error) throw error;
    return (data as Prospect[]) ?? [];
  } catch (err: any) {
    // Se o SELECT no retorno for bloqueado por RLS, fazemos um insert simples
    console.warn('Insert with select failed, retrying without select →', err?.message);
    const { error: err2 } = await supabase.from('prospects').insert(rows);
    if (err2) {
      console.error('Error adding prospects:', err2);
      throw new Error(err2.message);
    }
    // Sem os IDs retornados; o front usa um fallback para exibir os resultados
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

/* ===================== USER SETTINGS ===================== */
/**
 * Ajustes importantes para evitar 400:
 * - Sempre filtrar por user_id.
 * - NÃO encadear .select() logo após insert/upsert (algumas versões geram ?columns= e o PostgREST retorna 400).
 * - Quando não existir registro, inserir sem .select() e retornar o default.
 */

export async function getSettings(userId: string): Promise<UserSettings> {
  // Lê apenas do usuário atual
  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, messageTemplate, kanbanColumnTitles')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    throw new Error(error.message);
  }

  if (!data) {
    // Cria defaults sem .select() para evitar 400
    const { error: errInsert } = await supabase
      .from('user_settings')
      .insert([{ user_id: userId, ...defaultSettings }]);
    if (errInsert) {
      console.error('Error creating default settings:', errInsert);
      throw new Error(errInsert.message);
    }
    return { ...defaultSettings };
  }

  // Normaliza e mantém seu formato (objeto com chaves new/…/won)
  const titles =
    data.kanbanColumnTitles &&
    typeof data.kanbanColumnTitles === 'object' &&
    'new' in data.kanbanColumnTitles
      ? data.kanbanColumnTitles
      : defaultSettings.kanbanColumnTitles;

  return {
    messageTemplate: data.messageTemplate ?? defaultSettings.messageTemplate,
    kanbanColumnTitles: titles,
  } as UserSettings;
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<void> {
  // Upsert sem .select() para não disparar ?columns=... → 400
  const payload = {
    user_id: userId,
    messageTemplate: settings.messageTemplate ?? defaultSettings.messageTemplate,
    kanbanColumnTitles: settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
  };

  const { error } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    console.error('Error updating settings:', error);
    throw new Error(error.message);
  }
}
