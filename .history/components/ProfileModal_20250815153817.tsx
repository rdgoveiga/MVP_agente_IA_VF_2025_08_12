import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (user) {
      const meta: any = (user as any).user_metadata || {};
      setName(meta?.name || meta?.full_name || '');
      setWhatsapp(meta?.whatsapp || meta?.phone || '');
    }
  }, [user, isOpen]);

  const onSave = async () => {
    const { error } = await updateProfile({ name, whatsapp });
    if (error) {
      onShowToast?.('Erro ao salvar seu perfil.');
      return;
    }
    onShowToast?.('Perfil atualizado!');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">WhatsApp</label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white"
            placeholder="559999999999"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
