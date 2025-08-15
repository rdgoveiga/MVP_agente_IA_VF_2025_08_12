// src/services/feedbackService.ts
import { supabase } from '../lib/supabaseClient';

export interface FeedbackPayload {
  suggestion: string;     // texto do feedback
  rating?: number;        // 1..5 (opcional)
  userId: string;         // id do usuário (auth.users)
  name?: string;          // nome de cadastro (user_metadata.name)
  email?: string;         // e-mail do usuário
  whatsapp?: string;      // whatsapp salvo no user_metadata (formato livre)
}

/**
 * Envia uma sugestão/avaliação para a tabela 'feedback' no Supabase.
 * Requer as colunas: id (uuid, default), user_id (uuid), suggestion (text),
 * rating (int, opcional), name (text), email (text), whatsapp (text), created_at (timestamptz default now()).
 */
export const submitSuggestion = async (
  payload: FeedbackPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!payload.suggestion.trim() && !payload.rating) {
      return { success: false, error: 'O feedback não pode estar vazio.' };
    }

    const { error } = await supabase.from('feedback').insert([
      {
        user_id: payload.userId,
        suggestion: payload.suggestion,
        rating: payload.rating ?? null,
        name: payload.name ?? null,
        email: payload.email ?? null,
        whatsapp: payload.whatsapp ?? null,
      },
    ]);

    if (error) {
      console.error('Erro ao enviar feedback para o Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado ao enviar feedback.' };
  }
};
