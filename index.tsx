// index.tsx (na raiz do projeto)
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ResetPasswordPage from './src/pages/ResetPasswordPage';
import { supabase } from './lib/supabaseClient';

/**
 * Normaliza links do Supabase com dois '#':
 *   https://app/#/reset-password#access_token=...
 * Move o fragmento de token para imediatamente após o primeiro '#'
 * para o SDK processar, e depois volta para "#/reset-password".
 */
function normalizeSupabaseRecoveryURL() {
  const href = window.location.href;

  // Caso 1: já está OK (token logo após o primeiro '#')
  // Ex.: https://app/#access_token=...&type=recovery
  if (href.includes('#access_token=')) return;

  // Caso 2: veio com rota + segundo '#'
  // Ex.: https://app/#/reset-password#access_token=...
  const parts = href.split('#'); // [origin, '/reset-password', 'access_token=...']
  if (parts.length >= 3) {
    const afterSecond = parts.slice(2).join('#');
    if (afterSecond.startsWith('access_token=')) {
      // lembramos que a intenção era estar em /reset-password
      sessionStorage.setItem('pending_recovery_route', '/reset-password');
      const rewritten = `${parts[0]}#${afterSecond}`; // token após o primeiro '#'
      window.location.replace(rewritten);
    }
  }
}

function parseRouteFromHash(): string {
  // remove querystring e barras iniciais
  const h = window.location.hash.slice(1); // ex: "/reset-password" OU "access_token=..."
  const routeOnly = h.split('?')[0];
  return routeOnly.replace(/^\/+/, '').toLowerCase(); // ==> "reset-password"
}

function hashHasRecoveryToken(): boolean {
  const h = window.location.hash.toLowerCase();
  // qualquer um dos marcadores identifica o fluxo de recovery
  return h.includes('type=recovery') || h.includes('access_token=');
}

function Router() {
  // Se o hash carrega tokens de recovery, já começamos em reset-password
  const [route, setRoute] = useState<string>(() =>
    hashHasRecoveryToken() ? 'reset-password' : parseRouteFromHash()
  );

  useEffect(() => {
    // 1) Corrige o caso com dois '#'
    normalizeSupabaseRecoveryURL();

    // 2) Se o hash já contém token (um '#'), assegura rota reset-password
    if (hashHasRecoveryToken() && route !== 'reset-password') {
      setRoute('reset-password');
    }

    // 3) Ouve o evento do SDK: quando a sessão de recovery é criada,
    //    garantimos voltar (ou manter) a tela de reset
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        const wanted = sessionStorage.getItem('pending_recovery_route');
        sessionStorage.removeItem('pending_recovery_route');
        // Não mexemos no fragmento do token (continua após o primeiro '#')
        // Só garantimos que o UI está na tela correta:
        if (window.location.hash.includes('access_token=')) {
          // Apenas força o componente a renderizar ResetPasswordPage
          setRoute('reset-password');
        } else {
          // fallback (pouco provável aqui), mantém a rota com hash
          window.location.replace(`/#${wanted || '/reset-password'}`);
        }
      }
    });

    const onHashChange = () => {
      // Se o hash traz token, mantemos reset-password;
      // caso contrário, seguimos a rota normal.
      if (hashHasRecoveryToken()) {
        setRoute('reset-password');
      } else {
        setRoute(parseRouteFromHash());
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      sub.subscription?.unsubscribe();
    };
  }, [route]);

  // Página de redefinição
  if (route === 'reset-password') return <ResetPasswordPage />;

  // Rota padrão: sua aplicação (LP/App)
  return <App />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
