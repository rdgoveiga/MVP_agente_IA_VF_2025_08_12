// src/pages/ResetPasswordPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Status = 'idle' | 'updating' | 'success' | 'error';

interface Props {
  onNavigate?: (page: string) => void;
}

export default function ResetPasswordPage({ onNavigate }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean>(false);

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
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('session') || msg.includes('invalid') || error.status === 401) {
        setErr('Sessão de recuperação não encontrada ou expirada. Abra o link do e‑mail novamente.');
      } else {
        setErr(error.message);
      }
      return;
    }

    // Sucesso
    setStatus('success');

    // Limpa qualquer sessão temporária e remove o hash da URL
    try { await supabase.auth.signOut(); } catch {}
    try { window.history.replaceState(null, '', window.location.origin); } catch {}
  };

  const goLogin = () => {
    // garantia extra: hash já foi limpo, e forçamos navegação para login
    try { window.history.replaceState(null, '', window.location.origin); } catch {}
    if (onNavigate) onNavigate('login');
    else window.location.href = '/login?reset=success';
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

          {status === 'idle' && !hasRecoverySession && (
            <p className="text-red-400 text-sm">
              Abra o link de redefinição a partir do e‑mail para ativar esta página.
            </p>
          )}

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={status === 'updating'}
            className="w-full rounded-lg p-3 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
          >
            {status === 'updating' ? 'Salvando...' : 'Atualizar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
