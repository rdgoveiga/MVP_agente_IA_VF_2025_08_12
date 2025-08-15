// src/services/feedbackService.ts
import { supabase } from '../lib/supabaseClient';

export interface FeedbackPayload {
  suggestion: string;
  rating?: number;
}

/**
 * Lê o usuário atual e extrai id, email, name e whatsapp do user_metadata.
 */
async function getCurrentUserInfo() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;

  const u = data.user as any;
  return {
    id: u.id as string,
    email: u.email as string | null,
    name: u.user_metadata?.name ?? null,
    whatsapp: u.user_metadata?.whatsapp ?? null,
  };
}

/**
 * Envia uma sugestão/avaliação para a tabela 'feedback' no Supabase,
 * incluindo os dados do usuário (id, email, name, whatsapp) automaticamente.
 */
export const submitSuggestion = async (
  payload: FeedbackPayload
): Promise<{ success: boolean; error?: string }> => {
  // validação simples
  if (!payload.suggestion?.trim() && !payload.rating) {
    return { success: false, error: 'O feedback não pode estar vazio.' };
  }

  const userInfo = await getCurrentUserInfo();
  if (!userInfo?.id) {
    return { success: false, error: 'É necessário estar logado para enviar feedback.' };
  }

  const insertRow = {
    user_id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    whatsapp: userInfo.whatsapp,
    suggestion: payload.suggestion?.trim() || null,
    rating: payload.rating ?? null,
  };

  const { error } = await supabase.from('feedback').insert([insertRow]);
  if (error) {
    console.error('Erro ao enviar feedback:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
