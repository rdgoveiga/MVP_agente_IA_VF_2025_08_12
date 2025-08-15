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
      .insert(rows, { returning: 'minimal' }); // evita ?columns= no POST

    if (error) throw error;
    return []; // sem retorno (RLS pode bloquear), a UI usa fallback
  } catch (err: any) {
    console.error('Error adding prospects:', err);
    throw new Error(err.message ?? 'insert prospects failed');
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

/* ===================== USER SETTINGS (tolerante) ===================== */
/**
 * Evita 400 mesmo que as colunas tenham nomes diferentes ou não existam.
 * Estratégia:
 *  1) GET com select('*') para não quebrar por nome de coluna.
 *  2) Se não existir registro do usuário:
 *     - cria com { user_id } SOMENTE (returning: 'minimal' → sem ?columns=)
 *     - tenta setar message_template OU messageTemplate
 *     - tenta setar kanban_column_titles OU kanbanColumnTitles
 *     (se a coluna não existir, ignoramos o erro 42703)
 */

export async function getSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    throw new Error(error.message);
  }

  // Não há registro → cria registro mínimo
  if (!data) {
    // cria só com user_id (evita erro de coluna inexistente)
    const ins = await supabase
      .from('user_settings')
      .insert([{ user_id: userId }], { returning: 'minimal' });
    if (ins.error) {
      console.error('Error creating base settings row:', ins.error);
      throw new Error(ins.error.message);
    }

    // tenta setar o template (snake → camel)
    const trySetTemplate = async () => {
      const v = defaultSettings.messageTemplate;
      let up = await supabase
        .from('user_settings')
        .update({ message_template: v })
        .eq('user_id', userId);
      if (up.error && up.error.code === '42703') {
        up = await supabase
          .from('user_settings')
          .update({ messageTemplate: v })
          .eq('user_id', userId);
      }
      // se ainda der erro, ignora; a UI usa o default em memória
    };

    // tenta setar os títulos (snake → camel)
    const trySetKanban = async () => {
      const v = defaultSettings.kanbanColumnTitles;
      let up = await supabase
        .from('user_settings')
        .update({ kanban_column_titles: v })
        .eq('user_id', userId);
      if (up.error && up.error.code === '42703') {
        up = await supabase
          .from('user_settings')
          .update({ kanbanColumnTitles: v })
          .eq('user_id', userId);
      }
    };

    await Promise.all([trySetTemplate(), trySetKanban()]);
    // devolve defaults para a UI já seguir em frente
    return { ...defaultSettings };
  }

  // Já existe registro → mapeia qualquer formato para a UI
  const row: any = data;
  const msg =
    row.message_template ?? row.messageTemplate ?? defaultSettings.messageTemplate;

  let titles = defaultSettings.kanbanColumnTitles;
  const raw = row.kanban_column_titles ?? row.kanbanColumnTitles;
  if (raw) {
    if (typeof raw === 'string') {
      try { titles = JSON.parse(raw); } catch { titles = defaultSettings.kanbanColumnTitles; }
    } else if (typeof raw === 'object') {
      titles = raw;
    }
  }

  return {
    messageTemplate: msg,
    kanbanColumnTitles: titles,
  };
}

export async function updateSettings(userId: string, settings: UserSettings): Promise<void> {
  // tenta snake_case primeiro (sem retorno para não gerar ?columns=)
  const snake = {
    user_id: userId,
    message_template: settings.messageTemplate,
    kanban_column_titles: settings.kanbanColumnTitles,
  };

  let up = await supabase
    .from('user_settings')
    .upsert(snake, { onConflict: 'user_id', returning: 'minimal' });

  if (up.error && up.error.code === '42703') {
    // tenta camelCase
    const camel = {
      user_id: userId,
      messageTemplate: settings.messageTemplate,
      kanbanColumnTitles: settings.kanbanColumnTitles,
    };
    up = await supabase
      .from('user_settings')
      .upsert(camel, { onConflict: 'user_id', returning: 'minimal' });
  }

  if (up.error && up.error.code !== '42703') {
    console.error('Error updating settings:', up.error);
    throw new Error(up.error.message);
  }
}
