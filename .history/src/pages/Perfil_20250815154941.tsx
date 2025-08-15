import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Perfil: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState((user as any)?.user_metadata?.name || '');
  const [whatsapp, setWhatsapp] = useState((user as any)?.user_metadata?.whatsapp || '');
  const [statusMsg, setStatusMsg] = useState('');

  const salvar = async () => {
    setStatusMsg('');
    const { error } = await updateProfile({ name, whatsapp });
    if (!error) {
      setStatusMsg('Perfil atualizado com sucesso ✅');
    } else {
      setStatusMsg('Erro ao atualizar perfil ❌');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-4">Meu Perfil</h1>

      <label className="block text-gray-300 mb-2">Nome</label>
      <input
        type="text"
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="block text-gray-300 mb-2">WhatsApp</label>
      <input
        type="text"
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      <button
        onClick={salvar}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </button>

      {statusMsg && (
        <p className="mt-3 text-center text-sm text-gray-300">{statusMsg}</p>
      )}
    </div>
  );
};

export default Perfil;
