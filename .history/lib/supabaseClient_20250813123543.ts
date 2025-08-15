// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltam as variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY no .env'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,   // mantém a sessão no localStorage
    autoRefreshToken: true, // renova o JWT automaticamente
    detectSessionInUrl: true,
  },
});

// Garante que a sessão atual seja carregada (e renovada se preciso)
void supabase.auth.getSession();

// (Opcional) Útil para diagnóstico no console
supabase.auth.onAuthStateChange((event) => {
  if (event === 'TOKEN_REFRESHED') console.debug('[supabase] token atualizado');
  if (event === 'SIGNED_OUT') console.debug('[supabase] usuário saiu');
});
