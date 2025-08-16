import React, { StrictMode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ResetPasswordPage from './src/pages/ResetPasswordPage';

function parseRouteFromHash(): string {
  const raw = window.location.hash || '';
  const h = raw.startsWith('#') ? raw.slice(1) : raw;
  const noSlash = h.startsWith('/') ? h.slice(1) : h;
  const beforeSecondHash = noSlash.split('#')[0];
  const route = beforeSecondHash.split('?')[0].toLowerCase();
  return route || '';
}

function Router() {
  const [route, setRoute] = useState<string>(() => parseRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'reset-password') {
    return <ResetPasswordPage />;
  }

  return <App />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
