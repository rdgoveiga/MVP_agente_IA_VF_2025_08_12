
import React, { useState } from 'react';
import { Prospect, InteractionAnalysis } from '../types';
import { analyzeInteractionAndSuggestResponse } from '../services/geminiService';
import { Modal } from './Modal';
import { DocumentDuplicateIcon, SparklesIcon } from './icons';
import { useApiKey } from '../contexts/ApiKeyContext';

interface InteractionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect;
  onUpdateProspect: (prospectId: string, updates: Partial<Prospect>) => void;
  onShowToast: (message: string) => void;
}

export const InteractionAnalysisModal: React.FC<InteractionAnalysisModalProps> = ({ isOpen, onClose, prospect, onUpdateProspect, onShowToast }) => {
  const { apiKey, provider } = useApiKey();
  const [conversationText, setConversationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InteractionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!conversationText.trim()) {
      setError('Por favor, insira o texto da conversa para análise.');
      return;
    }
     if (!apiKey || !provider) {
        const errorMessage = 'A chave de API do Gemini não foi configurada.';
        setError(errorMessage);
        onShowToast(`Erro: ${errorMessage}`);
        return;
    }
    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeInteractionAndSuggestResponse(prospect, conversationText, { apiKey, provider });
      setAnalysisResult(result);
      // Update the prospect's next action in the main state
      onUpdateProspect(prospect.id, { nextRecommendedAction: result.newNextAction });
      onShowToast('Análise concluída com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      onShowToast(`Erro na análise: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleCopy = async (textToCopy: string, successMessage: string) => {
    try {
        await navigator.clipboard.writeText(textToCopy);
        onShowToast(successMessage);
    } catch (err) {
        console.error('Falha ao copiar texto:', err);
        onShowToast('Falha ao copiar.');
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setConversationText('');
    setAnalysisResult(null);
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Analisar Conversa com ${prospect.name}`} size="2xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="conversation-text" className="block text-sm font-medium text-gray-300 mb-2">
            Cole a conversa com o cliente aqui:
          </label>
          <textarea
            id="conversation-text"
            rows={8}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-y"
            value={conversationText}
            onChange={(e) => {
                setConversationText(e.target.value);
                if (error) setError(null);
            }}
            placeholder="Ex: Cliente: 'Achei interessante, mas o preço está um pouco alto agora.'"
            disabled={isAnalyzing}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        
        {analysisResult && (
             <div className="space-y-4 bg-gray-900/50 border border-gray-700 rounded-lg p-4 animate-fade-in-up">
                <div>
                    <div className="flex justify-between items-center">
                        <h4 className="text-base font-bold text-blue-300">Sugestão de Resposta</h4>
                         <button onClick={() => handleCopy(analysisResult.suggestedResponse, "Resposta copiada!")} className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-lg text-xs"><DocumentDuplicateIcon className="h-4 w-4" /></button>
                    </div>
                    <p className="mt-2 text-sm text-gray-200 bg-gray-700/50 p-3 rounded-md whitespace-pre-wrap">{analysisResult.suggestedResponse}</p>
                </div>
                <div>
                    <h4 className="text-base font-bold text-cyan-300">Nova Próxima Ação</h4>
                    <p className="mt-1 text-sm text-gray-300 italic">"{analysisResult.newNextAction}"</p>
                </div>
             </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700/50">
            <button
                onClick={handleClose}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
                Fechar
            </button>
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !conversationText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
                {isAnalyzing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Analisando...</span>
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>Analisar e Gerar Resposta</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </Modal>
  );
};
