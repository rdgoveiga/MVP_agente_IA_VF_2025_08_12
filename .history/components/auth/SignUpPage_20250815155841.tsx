// src/pages/Register.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          whatsapp: whatsapp.trim()
        }
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Criar conta</h2>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="WhatsApp (ex: 559999999999)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Sua senha (min. 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};
