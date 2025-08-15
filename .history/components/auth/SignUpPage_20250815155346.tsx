import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpPageProps {
  onNavigate: (page: 'login' | 'signup' | 'forgot-password' | 'landing') => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, loading, error } = useAuth();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMsg(null);

    if (!name.trim()) {
      setLocalMsg('Informe seu nome.');
      return;
    }
    if (!email.trim()) {
      setLocalMsg('Informe um e-mail válido.');
      return;
    }
    if (password.length < 8) {
      setLocalMsg('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setLocalMsg('As senhas não conferem.');
      return;
    }

    const { error } = await signUp(email.trim(), password, {
      name: name.trim(),
      whatsapp: whatsapp.trim(), // será salvo em user_metadata.whatsapp
    });

    if (error) return; // mensagem global já aparece via contexto

    // sucesso: avisa e leva para login
    setLocalMsg('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    setTimeout(() => onNavigate('login'), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Criar conta</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="name"
            required
          />

          <input
            type="text"
            placeholder="WhatsApp (ex.: 559999999999)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="tel"
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Sua senha (mín. 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="new-password"
            required
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            autoComplete="new-password"
            required
          />

          {(localMsg || error) && (
            <p className={`text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>
              {error?.message || localMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg p-3 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <div className="text-sm text-gray-400 mt-4">
          Já tem conta?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-blue-400 hover:underline"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
