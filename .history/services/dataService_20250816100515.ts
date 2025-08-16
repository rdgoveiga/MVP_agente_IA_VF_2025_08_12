// services/dataService.ts
import { supabase } from '../lib/supabaseClient';
import { Prospect, UserSettings } from '../types';

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

/**
 * Executa a operação; se o erro for "JWT expired", força refresh e RE-TENTA uma vez.
 */
async function withAuthRetry<T>(
  op: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  let { data, error } = await op();

  const isJwtExpired =
    error?.code === 'PGRST303' || /jwt expired/i.test(error?.message || '');

  if (isJwtExpired) {
    try {
      await supabase.auth.refreshSession();
    } catch {}
    const retry = await op();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Erro desconhecido no banco.');
  }

  return (data as T) ?? (Array.isArray(data) ? ([] as unknown as T) : ({} as T));
}

/* ----------------- Helpers de mapeamento (snake_case <-> camelCase) ----------------- */

function mapSettingsFromDB(row: any): UserSettings {
  if (!row) return defaultSettings;
  return {
    messageTemplate: row.message_template ?? defaultSettings.messageTemplate,
    kanbanColumnTitles: row.kanban_column_titles ?? defaultSettings.kanbanColumnTitles,
  };
}

function toDBSettings(userId: string, settings: UserSettings) {
  return {
    user_id: userId,
    message_template: settings.messageTemplate ?? defaultSettings.messageTemplate,
    kanban_column_titles: settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
  };
}

/* -------------------------------- Prospects -------------------------------- */

export async function getProspects(userId: string): Promise<Prospect[]> {
  const data = await withAuthRetry<Prospect[]>(() =>
    (supabase as any)
      .from('prospects')
      .select(
        'id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis, analysisBreakdown, improvementSuggestions, foundOn'
      )
      .eq('user_id', userId)
  );

  return (data || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function addProspects(
  userId: string,
  prospects: Omit<Prospect, 'id' | 'user_id'>[]
): Promise<Prospect[]> {
  const prospectsWithUserId = prospects.map((p) => {
    const { address, ...rest } = p as any; // remove campos que não existem na tabela
    return { ...rest, user_id: userId };
  });

  const data = await withAuthRetry<Prospect[]>(() =>
    (supabase as any)
      .from('prospects')
      .insert(prospectsWithUserId)
      .select(
        'id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis, analysisBreakdown, improvementSuggestions, foundOn'
      )
  );

  return data || [];
}

export async function updateProspect(
  userId: string,
  prospectId: string,
  updates: Partial<Prospect>
): Promise<Prospect> {
  const { address, ...clean } = updates as any;

  const data = await withAuthRetry<Prospect[]>(() =>
    (supabase as any)
      .from('prospects')
      .update(clean)
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select(
        'id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis, analysisBreakdown, improvementSuggestions, foundOn'
      )
      .limit(1)
  );

  return (data && data[0]) as Prospect;
}

export async function deleteProspect(userId: string, prospectId: string): Promise<void> {
  await withAuthRetry(() =>
    (supabase as any)
      .from('prospects')
      .delete()
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select('*')
  );
}

export async function clearProspects(userId: string): Promise<void> {
  await withAuthRetry(() =>
    (supabase as any).from('prospects').delete().eq('user_id', userId).select('*')
  );
}

/* ------------------------------- User Settings ------------------------------- */
/** Resolve o userId a partir da sessão caso não venha por parâmetro. */
async function resolveUserId(userId?: string): Promise<string | null> {
  if (userId) return userId;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getSettings(userId?: string): Promise<UserSettings> {
  const uid = await resolveUserId(userId);
  if (!uid) {
    console.warn('getSettings: chamado sem userId — retornando defaults, sem gravar no banco.');
    return defaultSettings;
  }

  // Busca primeiro
  const rows = await withAuthRetry<any[]>(() =>
    (supabase as any)
      .from('user_settings')
      .select('user_id, message_template, kanban_column_titles')
      .eq('user_id', uid)
      .limit(1)
  );
  const row = rows?.[0];
  if (row) return mapSettingsFromDB(row);

  // Se não existe, cria com UPSERT (onConflict garante idempotência)
  await withAuthRetry(() =>
    (supabase as any)
      .from('user_settings')
      .upsert([toDBSettings(uid, defaultSettings)], { onConflict: 'user_id' })
      .select('*')
  );

  return defaultSettings;
}

export async function updateSettings(
  userId: string | undefined,
  settings: UserSettings
): Promise<void> {
  const uid = await resolveUserId(userId);
  if (!uid) {
    console.warn('updateSettings: chamado sem userId — ignorando gravação.');
    return;
  }

  await withAuthRetry(() =>
    (supabase as any)
      .from('user_settings')
      .upsert([toDBSettings(uid, settings)], { onConflict: 'user_id' })
      .select('*')
  );
}
