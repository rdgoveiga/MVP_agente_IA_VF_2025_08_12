// index.tsx (na raiz do projeto)
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ResetPasswordPage from './src/pages/ResetPasswordPage';
import { supabase } from './src/lib/supabaseClient';

/**
 * Normaliza links do Supabase com dois '#':
 *   https://app/#/reset-password#access_token=...
 * Move o fragmento de token para imediatamente após o primeiro '#'
 * para o SDK processar, e depois volta para "#/reset-password".
 */
function normalizeSupabaseRecoveryURL() {
  const href = window.location.href;

  // Caso 1: já está OK (token logo após o primeiro '#')
  if (href.includes('#access_token=')) return;

  // Caso 2: veio com rota + segundo '#'
  const parts = href.split('#'); // [origin, '/reset-password', 'access_token=...']
  if (parts.length >= 3) {
    const afterSecond = parts.slice(2).join('#');
    if (afterSecond.startsWith('access_token=')) {
      sessionStorage.setItem('pending_recovery_route', '/reset-password');
      const rewritten = `${parts[0]}#${afterSecond}`; // token após o primeiro '#'
      window.location.replace(rewritten);
    }
  }
}

function parseRouteFromHash(): string {
  // remove querystring e barras iniciais
  const h = window.location.hash.slice(1); // ex: "/reset-password" ou "access_token=..."
  const routeOnly = h.split('?')[0];
  return routeOnly.replace(/^\/+/, '').toLowerCase(); // ==> "reset-password"
}

function Router() {
  const [route, setRoute] = useState<string>(() => parseRouteFromHash());

  useEffect(() => {
    normalizeSupabaseRecoveryURL();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        const wanted = sessionStorage.getItem('pending_recovery_route');
        sessionStorage.removeItem('pending_recovery_route');
        window.location.replace(`/#${wanted || '/reset-password'}`);
      }
    });

    const onHashChange = () => setRoute(parseRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      sub.subscription?.unsubscribe();
    };
  }, []);

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
