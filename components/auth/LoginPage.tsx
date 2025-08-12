import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthInputField } from './AuthInputField';

interface LoginPageProps {
  onNavigate: (page: 'login' | 'signup' | 'forgot-password') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // A navegação agora é tratada pelo App.tsx observando a mudança de sessão
  };
  
  return (
    <AuthLayout title="Acesse sua Conta" subtitle="Bem-vindo de volta!">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <AuthInputField id="email" label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" icon={<EnvelopeIcon className="h-5 w-5" />} disabled={loading} />
        
        <div className="relative">
             <label htmlFor="password"className="block text-sm font-medium text-gray-200 mb-1">Senha</label>
            <span className="absolute top-9 left-0 flex items-center pl-3 text-gray-400">
                <LockClosedIcon className="h-5 w-5" />
            </span>
            <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                disabled={loading}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
        </div>
        
        <div className="text-right !mt-2">
            <button 
              type="button"
              onClick={() => onNavigate('forgot-password')} 
              className="text-sm font-semibold text-gray-400 hover:text-blue-300 hover:underline cursor-pointer"
            >
                Esqueceu a senha?
            </button>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error.message}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            {loading ? 'Entrando...' : 'Entrar com E-mail'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 !mt-6">
          Não tem uma conta?{' '}
          <button type="button" onClick={() => onNavigate('signup')} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Cadastre-se
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};