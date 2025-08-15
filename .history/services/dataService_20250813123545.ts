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
 * Tenta executar a operação; se o erro for "JWT expired", força refresh e RE-TENTA uma vez.
 */
async function withAuthRetry<T>(
  op: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  let { data, error } = await op();

  const isJwtExpired =
    error?.code === 'PGRST303' || /jwt expired/i.test(error?.message || '');

  if (isJwtExpired) {
    try {
      // força renovação do token
      await supabase.auth.refreshSession();
    } catch {
      // ignora — a próxima chamada já vai falhar se não renovar
    }
    // tenta de novo
    const retry = await op();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'Erro desconhecido no banco.');
  }

  // Para selects, o supabase sempre retorna array/objeto. Para segurança:
  return (data as T) ?? (Array.isArray(data) ? ([] as unknown as T) : ({} as T));
}

/* ----------------- Helpers de mapeamento (snake_case <-> camelCase) ----------------- */

function mapSettingsFromDB(row: any): UserSettings {
  if (!row) return defaultSettings;
  return {
    messageTemplate:
      row.message_template ?? defaultSettings.messageTemplate,
    kanbanColumnTitles:
      row.kanban_column_titles ?? defaultSettings.kanbanColumnTitles,
  };
}

function toDBSettings(userId: string, settings: UserSettings) {
  return {
    user_id: userId,
    message_template:
      settings.messageTemplate ?? defaultSettings.messageTemplate,
    kanban_column_titles:
      settings.kanbanColumnTitles ?? defaultSettings.kanbanColumnTitles,
  };
}

/* -------------------------------- Prospects -------------------------------- */

export async function getProspects(userId: string): Promise<Prospect[]> {
  const data = await withAuthRetry<Prospect[]>(() =>
    (supabase as any)
      .from('prospects')
      .select(
        // mantenho nomes camelCase porque sua tabela já usa essas colunas
        'id, user_id, name, description, website, instagramUrl, phone, status, aiScore, nextRecommendedAction, analysis, analysisBreakdown, improvementSuggestions, foundOn'
      )
      .eq('user_id', userId)
  );

  return (data || []).sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );
}

export async function addProspects(
  userId: string,
  prospects: Omit<Prospect, 'id' | 'user_id'>[]
): Promise<Prospect[]> {
  const prospectsWithUserId = prospects.map((p) => {
    // remove campos que não existem na tabela (evita 400)
    const { address, ...rest } = p as any;
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

export async function deleteProspect(
  userId: string,
  prospectId: string
): Promise<void> {
  await withAuthRetry(() =>
    (supabase as any)
      .from('prospects')
      .delete()
      .eq('id', prospectId)
      .eq('user_id', userId)
      .select('*') // para passar pelo wrapper
  );
}

export async function clearProspects(userId: string): Promise<void> {
  await withAuthRetry(() =>
    (supabase as any)
      .from('prospects')
      .delete()
      .eq('user_id', userId)
      .select('*') // para passar pelo wrapper
  );
}

/* ------------------------------- User Settings ------------------------------- */

export async function getSettings(userId: string): Promise<UserSettings> {
  // tenta buscar
  const rows = await withAuthRetry<any[]>(() =>
    (supabase as any)
      .from('user_settings')
      .select('user_id, message_template, kanban_column_titles')
      .eq('user_id', userId)
      .limit(1)
  );

  const row = rows?.[0];

  if (row) {
    return mapSettingsFromDB(row);
  }

  // se não existir, cria padrão (UPSERT) e retorna
  await withAuthRetry(() =>
    (supabase as any)
      .from('user_settings')
      .upsert([toDBSettings(userId, defaultSettings)])
      .select('*')
  );

  // devolve o padrão imediatamente (sem nova chamada)
  return defaultSettings;
}

export async function updateSettings(
  userId: string,
  settings: UserSettings
): Promise<void> {
  await withAuthRetry(() =>
    (supabase as any)
      .from('user_settings')
      .upsert([toDBSettings(userId, settings)])
      .select('*') // garante que o wrapper tenha "data"
  );
}
