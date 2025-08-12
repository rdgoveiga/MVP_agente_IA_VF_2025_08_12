
import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { Modal } from './Modal';
import { KeyIcon, CheckIcon, ExclamationTriangleIcon } from './icons';

export const ApiKeyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { apiKey: currentApiKey, setApiKey, loading } = useApiKey();
    
    const [inputKey, setInputKey] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setInputKey(currentApiKey || '');
        }
    }, [isOpen, currentApiKey]);
    
    const handleSave = () => {
        if (inputKey.trim()) {
            setApiKey(inputKey.trim(), 'gemini');
            onClose();
        }
    };

    if (loading) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
            <div className="flex flex-col gap-6 -mt-4">
                <div className="text-center">
                    <KeyIcon className="mx-auto h-10 w-10 text-blue-400 mb-3" />
                    <h2 className="text-2xl font-bold text-gray-100">Configurar API Key</h2>
                    <p className="mt-1 text-gray-400">
                        Para usar as funcionalidades de IA, você precisa configurar sua chave da API do Google Gemini.
                    </p>
                </div>

                <div className="bg-blue-900/40 border border-blue-700/50 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Como obter sua API Key:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                        <li>Acesse o <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-semibold hover:underline">Google AI Studio</a></li>
                        <li>Faça login com sua conta Google</li>
                        <li>Clique em "Create API Key"</li>
                        <li>Copie a chave gerada</li>
                    </ol>
                </div>

                <div>
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-200 mb-2">
                        Chave da API do Gemini
                    </label>
                    <div className="relative">
                        <input
                            id="api-key-input"
                            type="password"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="Cole sua chave aqui..."
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                        />
                    </div>
                </div>

                <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-lg p-3 flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-yellow-300">Importante</h4>
                        <p className="text-sm text-yellow-200">Sua chave será armazenada localmente no seu navegador e não será compartilhada.</p>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <button
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!inputKey.trim()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        <CheckIcon className="h-5 w-5" />
                        Salvar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
