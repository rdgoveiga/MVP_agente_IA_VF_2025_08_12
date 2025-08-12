





import React, { useState } from 'react';
import { Prospect } from '../types';
import { generateCustomMessage } from '../services/geminiService';
import { 
    BuildingOfficeIcon, GlobeAltIcon, WhatsAppIcon, CheckCircleIcon, XCircleIcon, 
    InstagramIcon, InformationCircleIcon, ChevronDownIcon, SparklesIcon, 
    DocumentDuplicateIcon, ArrowRightIcon, ChatBubbleLeftRightIcon,
    TrashIcon,
    MapPinIcon
} from './icons';
import { Modal } from './Modal';
import { InteractionAnalysisModal } from './InteractionAnalysisModal';
import { useApiKey } from '../contexts/ApiKeyContext';
import { ConfirmationModal } from './ConfirmationModal';

interface ProspectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect;
  messageTemplate: string;
  onUpdateProspect: (prospectId: string, updates: Partial<Prospect>) => void;
  onDeleteProspect: (prospectId: string) => void;
  onShowToast: (message: string) => void;
}

interface GeneratedMessages {
  greeting: string;
  mainMessage: string;
  closingMessage: string;
}

const AIScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
    const getScoreConfig = () => {
        if (score >= 75) {
            return { label: 'Prioridade Alta', color: 'bg-green-500/20 text-green-300 border-green-500/30', textColor: 'text-green-300', explanation: 'Prioridade Alta: Muitas oportunidades de melhoria. Alvo com grande potencial de venda.' };
        }
        if (score >= 50) {
            return { label: 'Prioridade Média', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', textColor: 'text-yellow-300', explanation: 'Prioridade Média: Potencial de melhoria moderado. Vale a análise.' };
        }
        return { label: 'Prioridade Baixa', color: 'bg-red-500/20 text-red-300 border-red-500/30', textColor: 'text-red-300', explanation: 'Prioridade Baixa: Poucas oportunidades claras de melhoria. Prospect bem otimizado.' };
    };
    const config = getScoreConfig();
    return (
        <div title={config.explanation} className={`flex items-center gap-2 text-xs font-semibold py-1 px-3 rounded-full border ${config.color}`}>
            <span className={`font-bold text-sm ${config.textColor}`}>{score}</span>
            <span className="hidden sm:inline">{config.label}</span>
        </div>
    );
};

export const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({ isOpen, onClose, prospect, messageTemplate, onUpdateProspect, onDeleteProspect, onShowToast }) => {
  const { apiKey, provider } = useApiKey();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessages | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleCopy = async (textToCopy: string, successMessage: string) => {
    try {
        await navigator.clipboard.writeText(textToCopy);
        onShowToast(successMessage);
    } catch (err) {
        console.error('Falha ao copiar texto:', err);
        onShowToast('Falha ao copiar.');
    }
  };

  const handleWhatsAppClick = async (phone: string, name: string) => {
    const messageToSend = generatedMessages?.greeting || `Olá, ${name}! Tudo bem?`;
    const sanitizedPhone = (phone || '').replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(messageToSend);

    if (sanitizedPhone) {
      window.open(`https://wa.me/${sanitizedPhone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
      if (prospect.status === 'new') {
        onUpdateProspect(prospect.id, { status: 'contacted' });
      }
    }
  };

  const handleGenerateMessage = async () => {
    if (!apiKey || !provider) {
        onShowToast("A chave de API do Gemini não foi configurada.");
        return;
    }
    setIsGeneratingMessage(true);
    try {
        const generatedMsgs = await generateCustomMessage(prospect, messageTemplate, { apiKey, provider });
        setGeneratedMessages(generatedMsgs);
        setIsMessageExpanded(true);
        onShowToast("Sequência de mensagens criada!");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        onShowToast(`Erro ao criar mensagem: ${errorMessage}`);
    } finally {
        setIsGeneratingMessage(false);
    }
  };
  
  const handleConfirmDiscard = () => {
    onDeleteProspect(prospect.id);
    onClose(); // Close the detail modal
  };

  const getSocialUsername = (url: string) => {
      try {
        const path = new URL(url).pathname;
        const parts = path.split('/').filter(Boolean);
        return parts[0] ? `@${parts[0]}` : null;
      } catch { return null; }
  }
  
  const statusIndicator = () => {
    switch (prospect.status) {
        case 'contacted': return <div className="flex items-center gap-2 text-green-400"><CheckCircleIcon className="h-5 w-5" /><span>Contatado</span></div>;
        case 'negotiating': return <div className="flex items-center gap-2 text-yellow-400"><SparklesIcon className="h-5 w-5" /><span>Em Negociação</span></div>;
        case 'won': return <div className="flex items-center gap-2 text-cyan-400"><CheckCircleIcon className="h-5 w-5" /><span>Contrato fechado</span></div>;
        default: return <div className="flex items-center gap-2 text-blue-400"><span>Novo</span></div>;
    }
  }

  const hasVisibleLinks = (prospect.website && prospect.foundOn?.includes('google')) ||
                          (prospect.instagramUrl && prospect.foundOn?.includes('instagram'));

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} title="" size="3xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                {/* Coluna Principal de Conteúdo (Scrollable) */}
                <div className="lg:col-span-2 max-h-[80vh] lg:max-h-none overflow-y-auto pr-4 -mr-4 lg:pr-0 lg:mr-0">
                    <div className="flex items-start gap-4 mb-3">
                        <div className="flex-shrink-0 bg-gray-900/50 p-3 rounded-full border border-gray-700">
                            {!prospect.website && prospect.instagramUrl ? <InstagramIcon className="h-6 w-6 text-pink-400" /> : <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-100">{prospect.name}</h3>
                            <div className="mt-1 text-sm font-medium">{statusIndicator()}</div>
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{prospect.description}</p>
                    
                    {prospect.address && (
                        <div className="flex items-start gap-2 text-gray-400 mb-4">
                            <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-500" />
                            <span className="text-sm">{prospect.address}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="bg-gray-900/40 border border-gray-700/60 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-base font-bold text-gray-300">Análise da IA</h4>
                                <AIScoreIndicator score={prospect.aiScore}/>
                            </div>
                            <p className="text-sm text-gray-400 italic">"{prospect.analysis}"</p>
                            
                            {prospect.nextRecommendedAction && (
                                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-cyan-300">
                                    <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm font-semibold">Próxima Ação: <span className="font-normal text-cyan-200">{prospect.nextRecommendedAction}</span></p>
                                </div>
                            )}

                            {prospect.analysisBreakdown && prospect.analysisBreakdown.length > 0 && (
                                <div className="mt-3">
                                    <button onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)} className="flex items-center justify-between w-full text-left text-sm font-semibold text-blue-400 hover:text-blue-300">
                                        <span>Ver análise detalhada</span>
                                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isAnalysisExpanded && (
                                        <div className="mt-3 border-t border-gray-700/50 pt-3 flex flex-col gap-3">
                                            {prospect.analysisBreakdown.map((detail, index) => (
                                                <div key={index} className="text-sm"><p className="font-semibold text-gray-200 flex items-start gap-1.5"><InformationCircleIcon className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /><span>{detail.finding}</span></p><p className="text-gray-400 pl-[22px]">{detail.evidence}</p></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {prospect.improvementSuggestions && (
                                <div className="mt-4 border-t border-gray-700/50 pt-3">
                                    <button onClick={() => setIsSuggestionsExpanded(!isSuggestionsExpanded)} className="flex justify-between items-center w-full text-left">
                                        <h5 className="text-sm font-bold text-gray-300">3 Sugestões de Melhorias</h5>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleCopy(prospect.improvementSuggestions!, 'Sugestões copiadas!'); }} className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-lg text-xs"><DocumentDuplicateIcon className="h-4 w-4" /></button>
                                            <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isSuggestionsExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    {isSuggestionsExpanded && <div className="mt-2 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-md whitespace-pre-wrap font-mono">{prospect.improvementSuggestions}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral de Ações (Fixa em telas grandes) */}
                <div className="lg:col-span-1 mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-700/50 lg:pl-8 flex flex-col gap-4">
                    <div className="space-y-3">
                         <h4 className="text-base font-bold text-gray-300">Ações</h4>
                         <button onClick={handleGenerateMessage} disabled={isGeneratingMessage || !apiKey} title={!apiKey ? "Configure sua API Key para usar esta função" : ""} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
                            {isGeneratingMessage ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Gerando...</span></> : <><SparklesIcon className="h-5 w-5"/><span>Sugerir Mensagem</span></>}
                        </button>
                        <button onClick={() => setIsInteractionModalOpen(true)} disabled={!apiKey} title={!apiKey ? "Configure sua API Key para usar esta função" : ""} className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"><ChatBubbleLeftRightIcon className="h-5 w-5" /><span>Analisar Interação</span></button>
                        {prospect.phone && (
                            <button onClick={() => handleWhatsAppClick(prospect.phone!, prospect.name)} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"><WhatsAppIcon className="h-5 w-5" /><span>{prospect.status === 'new' ? 'Contatar' : 'Recontatar'}</span></button>
                        )}
                    </div>

                    {generatedMessages && (
                        <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg">
                            <button onClick={() => setIsMessageExpanded(!isMessageExpanded)} className="w-full flex justify-between items-center p-3 text-left"><p className="text-xs font-bold text-blue-300">Sequência de Mensagens</p><ChevronDownIcon className={`h-5 w-5 text-blue-300 transition-transform ${isMessageExpanded ? 'rotate-180' : ''}`} /></button>
                            {isMessageExpanded && (
                            <div className="px-3 pb-3 space-y-3"><div className="space-y-1"><div className="flex justify-between items-center"><label className="text-xs font-semibold text-gray-300">1. Saudação</label><button onClick={() => handleCopy(generatedMessages.greeting, "Saudação copiada!")}><DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white"/></button></div><p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">{generatedMessages.greeting}</p></div><div className="space-y-1"><div className="flex justify-between items-center"><label className="text-xs font-semibold text-gray-300">2. Mensagem Principal</label><button onClick={() => handleCopy(generatedMessages.mainMessage, "Mensagem principal copiada!")}><DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white"/></button></div><p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">{generatedMessages.mainMessage}</p></div><div className="space-y-1"><div className="flex justify-between items-center"><label className="text-xs font-semibold text-gray-300">3. Fechamento</label><button onClick={() => handleCopy(generatedMessages.closingMessage, "Fechamento copiada!")}><DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white"/></button></div><p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">{generatedMessages.closingMessage}</p></div></div>
                            )}
                        </div>
                    )}
                    
                    {hasVisibleLinks && (
                        <div className="space-y-3 pt-4 border-t border-gray-700/50">
                            <h4 className="text-base font-bold text-gray-300">Links</h4>
                            {prospect.website && prospect.foundOn?.includes('google') && <a href={typeof prospect.website === 'string' && prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 group"><GlobeAltIcon className="h-5 w-5" /><span className="group-hover:underline truncate text-sm" title={prospect.website}>{prospect.website ? prospect.website.replace(/^(https?:\/\/)?(www\.)?/, '') : ''}</span></a>}
                            {prospect.instagramUrl && prospect.foundOn?.includes('instagram') && <a href={typeof prospect.instagramUrl === 'string' && prospect.instagramUrl.startsWith('http') ? prospect.instagramUrl : `https://instagram.com/${(prospect.instagramUrl || '').replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-400 hover:text-pink-300 group"><InstagramIcon className="h-5 w-5" /><span className="group-hover:underline truncate text-sm">{getSocialUsername(prospect.instagramUrl) || prospect.instagramUrl}</span></a>}
                        </div>
                    )}


                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                         <button 
                             onClick={() => setIsConfirmModalOpen(true)} 
                             className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 font-semibold transition-colors duration-200 py-2 rounded-lg"
                             aria-label={`Descartar ${prospect.name}`}
                         >
                            <TrashIcon className="h-5 w-5" />
                            <span>Descartar</span>
                         </button>
                    </div>
                </div>
            </div>
        </Modal>

        <InteractionAnalysisModal
            isOpen={isInteractionModalOpen}
            onClose={() => setIsInteractionModalOpen(false)}
            prospect={prospect}
            onUpdateProspect={onUpdateProspect}
            onShowToast={onShowToast}
        />
        
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDiscard}
            title="Confirmar Exclusão"
            message="Deseja mesmo descartar este prospect?"
            confirmText="Sim, Descartar"
        />
    </>
  );
};