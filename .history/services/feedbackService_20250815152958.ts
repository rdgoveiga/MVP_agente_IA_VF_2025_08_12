// src/services/feedbackService.ts
import { supabase } from '../lib/supabaseClient';

export interface FeedbackPayload {
  suggestion: string;     // texto do feedback
  rating?: number;        // 1..5 (opcional)
  userId: string;         // id do usuário (auth.users)
  name?: string;          // nome de cadastro (user_metadata.name ou fallback)
  email?: string;         // e-mail do usuário
  whatsapp?: string;      // whatsapp salvo no user_metadata (formato livre)
}

/**
 * Envia uma sugestão/avaliação para a tabela 'feedback' no Supabase.
 * Colunas esperadas: id (uuid, default), user_id (uuid), suggestion (text),
 * rating (int, opcional), name (text), email (text), whatsapp (text), created_at (timestamptz default now()).
 */
export const submitSuggestion = async (
  payload: FeedbackPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const suggestion = (payload.suggestion || '').trim();
    if (!suggestion && !payload.rating) {
      return { success: false, error: 'O feedback não pode estar vazio.' };
    }

    // Normaliza strings vazias para null (fica mais limpo no banco)
    const normalize = (v?: string | null) => {
      if (v === undefined || v === null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };

    const row = {
      user_id: payload.userId,
      suggestion,
      rating: payload.rating ?? null,
      name: normalize(payload.name),
      email: normalize(payload.email),
      whatsapp: normalize(payload.whatsapp),
    };

    const { error } = await supabase.from('feedback').insert([row]);

    if (error) {
      console.error('Erro ao enviar feedback para o Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado ao enviar feedback.' };
  }
};
