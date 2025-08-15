// services/feedbackService.ts
import { supabase } from '../lib/supabaseClient';

interface FeedbackPayload {
  suggestion: string;
  rating?: number;
  userId: string;
}

/**
 * Envia uma sugestão ou avaliação do usuário para o banco de dados Supabase.
 * Os dados são inseridos na tabela 'feedback'.
 */
export const submitSuggestion = async (payload: FeedbackPayload): Promise<{ success: boolean; error?: string }> => {
  console.log('Enviando feedback para o Supabase:', payload);

  if (!payload.suggestion.trim() && !payload.rating) {
    return { success: false, error: 'O feedback não pode estar vazio.' };
  }

  const { error } = await (supabase as any).from('feedback').insert([
    {
      user_id: payload.userId,
      suggestion: payload.suggestion,
      rating: payload.rating,
    },
  ]);

  if (error) {
    console.error('Erro ao enviar feedback para o Supabase:', error);
    return { success: false, error: error.message };
  }
  
  console.log('Feedback enviado com sucesso!');
  return { success: true };
};