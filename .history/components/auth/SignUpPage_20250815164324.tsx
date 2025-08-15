import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { UserIcon, EnvelopeIcon, WhatsAppIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthInputField } from './AuthInputField';
import { supabase } from '../../lib/supabaseClient';

interface SignUpPageProps {
  onNavigate: (page: 'login' | 'signup' | 'forgot-password') => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, loading, error: authError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !whatsapp || !password) {
        setError('Todos os campos são obrigatórios.');
        return;
    }
    setError(null);

    const nameTrimmed = fullName.trim();
    const whatsappDigits = whatsapp.replace(/\D/g, ''); // só números

    // Criação com metadados completos
    const { error } = await signUp(email, password, { 
      name: nameTrimmed,
      full_name: nameTrimmed, // usado no display name do Supabase
      whatsapp: whatsappDigits
    });

    if (error) {
        setError(error.message);
        return;
    }

    // Fallback para garantir atualização do usuário logado
    try {
      await supabase.auth.updateUser({
        data: {
          name: nameTrimmed,
          full_name: nameTrimmed,
          whatsapp: whatsappDigits
        },
      });
    } catch {}

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Sucesso!" subtitle="Sua conta foi criada.">
        <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400 mb-4" />
            <p className="text-gray-300 mb-6">
                Seu cadastro foi realizado com sucesso. Para sua segurança, enviamos um e-mail de confirmação (simulado). Agora você já pode fazer login.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Ir para o Login
            </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie sua Conta" subtitle="Comece a prospectar em minutos.">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <AuthInputField 
          id="fullName" 
          label="Nome Completo" 
          type="text" 
          value={fullName} 
          onChange={e => setFullName(e.target.value)} 
          placeholder="Seu nome completo" 
          icon={<UserIcon className="h-5 w-5" />} 
          disabled={loading} 
        />
        <AuthInputField 
          id="email" 
          label="E-mail" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="seu@email.com" 
          icon={<EnvelopeIcon className="h-5 w-5" />} 
          disabled={loading} 
        />
        <AuthInputField 
          id="whatsapp" 
          label="WhatsApp" 
          type="tel" 
          value={whatsapp} 
          onChange={e => setWhatsapp(e.target.value)} 
          placeholder="(XX) XXXXX-XXXX" 
          icon={<WhatsAppIcon className="h-5 w-5" />} 
          disabled={loading} 
        />
        
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
                placeholder="Crie uma senha forte"
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

        {(error || authError) && <p className="text-sm text-red-400 text-center pt-2">{error || authError?.message}</p>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            {loading ? 'Criando Conta...' : 'Criar Conta com E-mail'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 !mt-6">
          Já tem uma conta?{' '}
          <button type="button" onClick={() => onNavigate('login')} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
            Faça login
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};
