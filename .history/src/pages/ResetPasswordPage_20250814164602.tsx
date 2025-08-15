import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  // opcional: se vier, usamos para voltar ao login sem recarregar a página
  onNavigate?: (page: string) => void;
}

export default function ResetPasswordPage({ onNavigate }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (password.length < 8) return setErr('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirm) return setErr('As senhas não conferem.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg('Senha atualizada com sucesso. Redirecionando para o login...');
    // encerra a sessão temporária criada pelo link de recuperação
    await supabase.auth.signOut();

    // se o app usa navegação por estado, use onNavigate; senão, faça fallback para URL
    if (onNavigate) {
      onNavigate('login');
    } else {
      window.location.href = '/login?reset=success';
    }
  };

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
          {err && <p className="text-red-400 text-sm">{err}</p>}
          {msg && <p className="text-green-400 text-sm">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg p-3 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Atualizar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
