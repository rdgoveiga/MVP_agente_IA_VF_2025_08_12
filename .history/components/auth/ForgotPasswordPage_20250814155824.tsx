import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { EnvelopeIcon, CheckCircleIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (page: 'login' | 'signup' | 'forgot-password') => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { requestPasswordReset, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('O campo de e-mail é obrigatório.');
      return;
    }
    setError(null);
    
    const { error } = await requestPasswordReset(email);

    if (error) {
        setError(error.message);
    } else {
        setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Verifique seu E-mail" subtitle="Link de recuperação enviado.">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400 mb-4" />
          <p className="text-gray-300 mb-6">
            Se uma conta com o e-mail informado existir em nossa base, um link para redefinir sua senha foi enviado.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Voltar para o Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recuperar Senha" subtitle="Insira seu e-mail para receber o link de recuperação.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail de cadastro"
            required
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
            disabled={loading}
          />
        </div>

        {(error || authError) && <p className="text-sm text-red-400 text-center">{error || authError?.message}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          Lembrou a senha?{' '}
          <button type="button" onClick={() => onNavigate('login')} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Faça login
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};