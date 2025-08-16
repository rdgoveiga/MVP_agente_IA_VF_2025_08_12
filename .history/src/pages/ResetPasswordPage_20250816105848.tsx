// src/pages/ResetPasswordPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Status = 'idle' | 'updating' | 'success' | 'error';

interface Props {
  onNavigate?: (page: string) => void;
}

/**
 * Lê parâmetros vindos tanto no hash (#/reset-password?... ou #/reset-password#error=...)
 * quanto na query (fallback).
 */
function useAuthParams() {
  return useMemo(() => {
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    // pega só a parte depois de "#/reset-password"
    const afterRoute = rawHash.includes('reset-password')
      ? rawHash.split('reset-password').pop() || ''
      : rawHash;

    // remove um possível "prefixo" tipo "/#/" ou "/" etc.
    const cleaned =
      afterRoute.startsWith('/') || afterRoute.startsWith('#')
        ? afterRoute.slice(1)
        : afterRoute;

    const search = cleaned.startsWith('?') || cleaned.startsWith('&')
      ? cleaned
      : `?${cleaned}`;

    const paramsFromHash = new URLSearchParams(search);
    const paramsFromQuery = new URLSearchParams(window.location.search);

    const pick = (k: string) => paramsFromHash.get(k) || paramsFromQuery.get(k) || '';

    return {
      access_token: pick('access_token'),
      refresh_token: pick('refresh_token'),
      token_hash: pick('token_hash'),
      type: pick('type') || pick('event'),
      error: pick('error'),
      error_code: pick('error_code'),
      error_description: pick('error_description'),
    };
  }, []);
}

export default function ResetPasswordPage({ onNavigate }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean>(false);

  const authParams = useAuthParams();

  // mostra mensagem amigável quando o link veio com erro (expirado/inválido)
  useEffect(() => {
    if (authParams.error_description) {
      setErr(decodeURIComponent(authParams.error_description));
    } else if (authParams.error_code) {
      const code = authParams.error_code.toLowerCase();
      if (code.includes('otp_expired')) {
        setErr('O link de redefinição expirou. Solicite um novo em "Esqueci minha senha".');
      } else if (authParams.error || authParams.error_description) {
        setErr('Link de redefinição inválido ou expirado. Solicite um novo.');
      }
    }
  }, [authParams]);

  // detecta se o supabase criou a sessão temporária (link válido)
  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasRecoverySession(Boolean(data.session));
    };
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasRecoverySession(Boolean(session));
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      setErr('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setErr('As senhas não conferem.');
      return;
    }

    setStatus('updating');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus('error');
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('session') || msg.includes('invalid') || error.status === 401) {
        setErr('Sessão de recuperação não encontrada ou expirada. Abra o link do e-mail novamente.');
      } else {
        setErr(error.message);
      }
      return;
    }

    // sucesso: limpa sessão temporária e hash, e mostra tela de sucesso
    setStatus('success');
    try { await supabase.auth.signOut(); } catch {}
    try { window.history.replaceState(null, '', window.location.origin); } catch {}
  };

  const goLogin = () => {
    // força ir para o login (hash-router)
    if (onNavigate) onNavigate('login');
    else window.location.hash = '#/login';
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">Senha alterada com sucesso 🎉</h1>
          <p className="text-gray-300 mb-6">Faça login novamente com sua nova senha.</p>
          <button
            className="w-full rounded-lg p-3 bg-blue-600 hover:bg-blue-500 text-white"
            onClick={goLogin}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  const showNoSessionHint = status === 'idle' && !hasRecoverySession && !authParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Defina sua nova senha</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="new-password"
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="new-password"
            required
          />

          {showNoSessionHint && (
            <p className="text-yellow-300 text-sm">
              Abra a página a partir do link de redefinição enviado ao seu e-mail
              (o link cria uma sessão temporária para permitir a troca de senha).
            </p>
          )}

          {err && (
            <p className="text-red-400 text-sm">
              {err}{' '}
              {(authParams.error || authParams.error_code) && (
                <>
                  — <a href="#/forgot-password" className="underline text-blue-400 hover:text-blue-300">
                    enviar novo link
                  </a>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'updating'}
            className="w-full rounded-lg p-3 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
          >
            {status === 'updating' ? 'Salvando...' : 'Atualizar senha'}
          </button>

          <div className="text-center">
            <a href="#/login" className="text-sm text-gray-400 hover:text-gray-200 underline">
              Voltar ao login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
