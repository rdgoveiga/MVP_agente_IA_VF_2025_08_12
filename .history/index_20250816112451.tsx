import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { supabase } from './lib/supabaseClient';

/**
 * Se vier um link do Supabase com dois '#', ex:
 *   https://app/#/reset-password#access_token=...&type=recovery
 * precisamos mover tudo que vem DEPOIS do segundo '#'
 * para imediatamente após o primeiro '#', pois o SDK do Supabase
 * só processa o fragmento que vem logo após o primeiro '#'.
 *
 * Passos:
 *  - guarda "queremos ir para /reset-password" em sessionStorage
 *  - reescreve a URL para: https://app/#access_token=...&type=recovery
 *  - o SDK captura o token e cria a recovery session
 *  - no onAuthStateChange('PASSWORD_RECOVERY') voltamos para #/reset-password
 */
function normalizeSupabaseRecoveryURL() {
  const href = window.location.href;
  // Caso 1: já está OK (token logo após o primeiro '#')
  if (href.includes('#access_token=')) return;

  // Caso 2: veio com rota + segundo '#'
  //          .../#/reset-password#access_token=...
  const twoHashes = href.split('#');
  if (twoHashes.length >= 3) {
    const afterSecond = twoHashes.slice(2).join('#'); // tudo depois do segundo '#'
    if (afterSecond.startsWith('access_token=')) {
      // avisamos que, depois que o SDK processar, queremos voltar ao /reset-password
      sessionStorage.setItem('pending_recovery_route', '/reset-password');
      const rewritten = `${twoHashes[0]}#${afterSecond}`; // token logo após o primeiro '#'
      window.location.replace(rewritten);
    }
  }
}

function parseRouteFromHash(): string {
  // Remove querystring da rota (se houver), mantendo só a parte antes do '?'
  const h = window.location.hash.slice(1);
  const route = h.split('?')[0].toLowerCase();
  return route || '';
}

function Router() {
  const [route, setRoute] = useState<string>(() => parseRouteFromHash());

  useEffect(() => {
    normalizeSupabaseRecoveryURL();

    const unsub = supabase.auth.onAuthStateChange((event) => {
      // Quando o SDK cria a recovery session corretamente,
      // o evento é PASSWORD_RECOVERY. Voltamos à tela de reset.
      if (event === 'PASSWORD_RECOVERY') {
        const wanted = sessionStorage.getItem('pending_recovery_route');
        if (wanted) {
          sessionStorage.removeItem('pending_recovery_route');
          window.location.replace(`/#${wanted}`);
        } else {
          window.location.replace('/#/reset-password');
        }
      }
    });

    const onHashChange = () => setRoute(parseRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      unsub.data.subscription?.unsubscribe();
    };
  }, []);

  // Se a rota for exatamente "reset-password", renderiza a página de redefinição
  if (route === 'reset-password') {
    return <ResetPasswordPage />;
  }

  // Rota padrão: sua aplicação atual (LP/App)
  return <App />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Could not find root element to mount to');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
