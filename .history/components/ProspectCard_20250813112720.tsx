import React, { useState } from 'react';
import { Prospect } from '../types';
import { generateCustomMessage } from '../services/geminiService';
import {
  BuildingOfficeIcon,
  GlobeAltIcon,
  WhatsAppIcon,
  CheckCircleIcon,
  XCircleIcon,
  InstagramIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  TrashIcon
} from './icons';
import { useApiKey } from '../contexts/ApiKeyContext';
import { ConfirmationModal } from './ConfirmationModal';

interface ProspectCardProps {
  prospect: Prospect;
  messageTemplate: string;
  onUpdateProspect: (prospectId: string, updates: Partial<Prospect>) => void;
  onDeleteProspect: (prospectId: string) => void;
  onShowToast: (message: string) => void;
  isFirstCard: boolean; // To attach tour attributes
}

interface GeneratedMessages {
  greeting: string;
  mainMessage: string;
  closingMessage: string;
}

/** Ação inline para evitar <button> dentro de <button>. */
const InlineAction: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & { onClick?: (e: React.MouseEvent) => void }
> = ({ onClick, className = '', children, ...rest }) => (
  <span
    role="button"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        onClick?.(e as any);
      }
    }}
    className={className}
    {...rest}
  >
    {children}
  </span>
);

const AIScoreIndicator: React.FC<{ score: number; 'data-tour'?: string }> = ({
  score,
  'data-tour': dataTour
}) => {
  const getScoreConfig = () => {
    if (score >= 75) {
      return {
        label: 'Prioridade Alta',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        textColor: 'text-green-300',
        explanation:
          'Prioridade Alta: Muitas oportunidades de melhoria. Alvo com grande potencial de venda.'
      };
    }
    if (score >= 50) {
      return {
        label: 'Prioridade Média',
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        textColor: 'text-yellow-300',
        explanation: 'Prioridade Média: Potencial de melhoria moderado. Vale a análise.'
      };
    }
    return {
      label: 'Prioridade Baixa',
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      textColor: 'text-red-300',
      explanation: 'Prioridade Baixa: Poucas oportunidades claras de melhoria. Prospect bem otimizado.'
    };
  };

  const config = getScoreConfig();

  return (
    <div
      title={config.explanation}
      data-tour={dataTour}
      className={`flex items-center gap-2 text-xs font-semibold py-1 px-3 rounded-full border ${config.color}`}
    >
      <span className={`font-bold text-sm ${config.textColor}`}>{score}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
};

export const ProspectCard: React.FC<ProspectCardProps> = ({
  prospect,
  messageTemplate,
  onUpdateProspect,
  onDeleteProspect,
  onShowToast,
  isFirstCard
}) => {
  const { apiKey, provider } = useApiKey();
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessages | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
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
      onShowToast('A chave de API do Gemini não foi configurada.');
      return;
    }
    setIsGeneratingMessage(true);
    try {
      const generatedMsgs = await generateCustomMessage(prospect, messageTemplate, { apiKey, provider });
      setGeneratedMessages(generatedMsgs);
      setIsMessageExpanded(true); // Auto-expand when generated
      onShowToast('Sequência de mensagens criada!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      onShowToast(`Erro ao criar mensagem: ${errorMessage}`);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleConfirmDiscard = () => {
    onDeleteProspect(prospect.id);
  };

  const isInstagramPrimary = !prospect.website && prospect.instagramUrl;

  const statusIndicator = () => {
    switch (prospect.status) {
      case 'contacted':
        return (
          <div
            className="flex items-center gap-2 text-green-400 cursor-default"
            title="Este prospect já foi contatado."
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Contatado</span>
          </div>
        );
      case 'negotiating':
        return (
          <div
            className="flex items-center gap-2 text-yellow-400 cursor-default"
            title="Este prospect está em negociação."
          >
            <SparklesIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Em Negociação</span>
          </div>
        );
      case 'won':
        return (
          <div
            className="flex items-center gap-2 text-cyan-400 cursor-default"
            title="Este prospect foi ganho."
          >
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Contrato fechado</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getSocialUsername = (url: string) => {
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/').filter(Boolean);
      return parts[0] ? `@${parts[0]}` : null;
    } catch {
      return null;
    }
  };

  const hasVisibleLinks =
    (prospect.website && prospect.foundOn?.includes('google')) ||
    (prospect.instagramUrl && prospect.foundOn?.includes('instagram'));

  return (
    <>
      <div
        data-tour={isFirstCard ? 'prospect-card' : undefined}
        className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/80 rounded-2xl p-5 flex flex-col h-full transform transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
      >
        <div className="flex-grow">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-shrink-0 bg-gray-900/50 p-3 rounded-full border border-gray-700">
              {isInstagramPrimary ? (
                <InstagramIcon className="h-6 w-6 text-pink-400" />
              ) : (
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100">{prospect.name}</h3>
              {prospect.status !== 'new' && <div className="mt-1">{statusIndicator()}</div>}
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-4">{prospect.description}</p>

          <div className="mt-4 bg-gray-900/40 border border-gray-700/60 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-gray-300">Análise da IA</h4>
              <AIScoreIndicator
                score={prospect.aiScore}
                data-tour={isFirstCard ? 'prospect-card-aiscore' : undefined}
              />
            </div>

            <p
              className="text-sm text-gray-400 italic"
              data-tour={isFirstCard ? 'prospect-card-analysis' : undefined}
            >
              "{prospect.analysis}"
            </p>

            {prospect.nextRecommendedAction && (
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-cyan-300">
                <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-semibold">
                  Próxima Ação:{' '}
                  <span className="font-normal text-cyan-200">{prospect.nextRecommendedAction}</span>
                </p>
              </div>
            )}

            {prospect.analysisBreakdown && prospect.analysisBreakdown.length > 0 && (
              <div className="mt-3" data-tour={isFirstCard ? 'prospect-card-analysis-breakdown' : undefined}>
                <button
                  type="button"
                  onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Ver análise detalhada</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isAnalysisExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAnalysisExpanded && (
                  <div
                    className="mt-3 border-t border-gray-700/50 pt-3 flex flex-col gap-3 animate-fade-in-up"
                    style={{ animationDuration: '0.3s' }}
                  >
                    {prospect.analysisBreakdown.map((detail, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-semibold text-gray-200 flex items-start gap-1.5">
                          <InformationCircleIcon className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{detail.finding}</span>
                        </p>
                        <p className="text-gray-400 pl-[22px]">{detail.evidence}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {prospect.improvementSuggestions && (
              <div
                className="mt-4 border-t border-gray-700/50 pt-3"
                data-tour={isFirstCard ? 'prospect-card-suggestions' : undefined}
              >
                {/* Cabeçalho do acordeão de sugestões */}
                <button
                  type="button"
                  onClick={() => setIsSuggestionsExpanded(!isSuggestionsExpanded)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <h5 className="text-sm font-bold text-gray-300">3 Sugestões de Melhorias</h5>

                  {/* AÇÕES INTERNAS: usar InlineAction para evitar button dentro de button */}
                  <div className="flex items-center gap-2">
                    <InlineAction
                      onClick={() =>
                        handleCopy(prospect.improvementSuggestions!, 'Sugestões copiadas!')
                      }
                      className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-lg transition-colors text-xs"
                      aria-label="Copiar sugestões"
                      title="Copiar sugestões"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </InlineAction>

                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                        isSuggestionsExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isSuggestionsExpanded && (
                  <div
                    className="mt-2 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-md whitespace-pre-wrap font-mono animate-fade-in-up"
                    style={{ animationDuration: '0.3s' }}
                  >
                    {prospect.improvementSuggestions}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          {hasVisibleLinks && (
            <div className="flex flex-col gap-2">
              {prospect.website && prospect.foundOn?.includes('google') && (
                <a
                  href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 group min-w-0"
                >
                  <GlobeAltIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="group-hover:underline truncate text-sm" title={prospect.website}>
                    {prospect.website ? prospect.website.replace(/^(https?:\/\/)?(www\.)?/, '') : ''}
                  </span>
                </a>
              )}

              {prospect.instagramUrl && prospect.foundOn?.includes('instagram') && (
                <a
                  href={
                    typeof prospect.instagramUrl === 'string' && prospect.instagramUrl.startsWith('http')
                      ? prospect.instagramUrl
                      : `https://instagram.com/${(prospect.instagramUrl || '').replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors duration-200 group min-w-0"
                >
                  <InstagramIcon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className="group-hover:underline truncate text-sm"
                    title={getSocialUsername(prospect.instagramUrl) || prospect.instagramUrl}
                  >
                    {getSocialUsername(prospect.instagramUrl) || prospect.instagramUrl}
                  </span>
                </a>
              )}
            </div>
          )}

          {prospect.phone && (
            <div className={`flex flex-col gap-3 ${hasVisibleLinks ? 'pt-3 mt-3 border-t border-gray-700/50' : ''}`}>
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={isGeneratingMessage || !apiKey}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-tour={isFirstCard ? 'prospect-card-generate-message' : undefined}
                title={!apiKey ? 'Configure sua chave de API para usar esta função' : ''}
              >
                {isGeneratingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    <span>Sugerir Mensagem com IA</span>
                  </>
                )}
              </button>

              {generatedMessages && (
                <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsMessageExpanded(!isMessageExpanded)}
                    className="w-full flex justify-between items-center p-3 text-left"
                  >
                    <p className="text-xs font-bold text-blue-300">Sequência de Mensagens Sugerida</p>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-blue-300 transition-transform ${
                        isMessageExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMessageExpanded && (
                    <div className="px-3 pb-3 space-y-3 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-gray-300">1. Saudação</label>
                          <button
                            type="button"
                            onClick={() => handleCopy(generatedMessages.greeting, 'Saudação copiada!')}
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">
                          {generatedMessages.greeting}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-gray-300">2. Mensagem Principal</label>
                          <button
                            type="button"
                            onClick={() => handleCopy(generatedMessages.mainMessage, 'Mensagem principal copiada!')}
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">
                          {generatedMessages.mainMessage}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-gray-300">3. Fechamento</label>
                          <button
                            type="button"
                            onClick={() => handleCopy(generatedMessages.closingMessage, 'Fechamento copiada!')}
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-200 bg-gray-900/30 p-2 rounded-md">
                          {generatedMessages.closingMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleWhatsAppClick(prospect.phone!, prospect.name)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 group"
                aria-label={`Enviar WhatsApp para ${prospect.name}`}
                data-tour={isFirstCard ? 'prospect-card-whatsapp' : undefined}
              >
                <WhatsAppIcon className="h-5 w-5 flex-shrink-0" />
                <span>{prospect.status === 'new' ? 'Contatar via WhatsApp' : 'Recontatar via WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 font-semibold transition-colors duration-200 py-1.5 rounded-lg"
                aria-label={`Descartar ${prospect.name}`}
              >
                <TrashIcon className="h-4 w-4" />
                <span>Descartar</span>
              </button>
            </div>
          )}
        </div>
      </div>

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

export const ProspectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/80 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 bg-gray-700/80 p-3 rounded-full h-12 w-12 skeleton-loading" />
          <div className="w-full">
            <div className="h-6 w-3/4 rounded-md bg-gray-700 skeleton-loading" />
            <div className="h-4 w-1/2 rounded-md bg-gray-700 skeleton-loading mt-2" />
          </div>
        </div>

        <div className="h-4 w-full rounded-md bg-gray-700 skeleton-loading" />
        <div className="h-4 w-5/6 rounded-md bg-gray-700 skeleton-loading mt-2" />

        <div className="mt-5 bg-gray-900/40 border border-gray-700/60 rounded-lg p-3 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/4 rounded-md bg-gray-700 skeleton-loading" />
            <div className="h-6 w-24 rounded-full bg-gray-700 skeleton-loading" />
          </div>
          <div className="h-4 w-11/12 rounded-md bg-gray-700 skeleton-loading" />
          <div className="h-4 w-2/3 rounded-md bg-gray-700 skeleton-loading" />
        </div>
      </div>

      <div className="mt-auto pt-4 space-y-3">
        <div className="h-5 w-1/2 rounded-md bg-gray-700 skeleton-loading" />
        <div className="h-5 w-1/3 rounded-md bg-gray-700 skeleton-loading" />
        <div className="flex flex-col gap-3 pt-3 mt-3 border-t border-gray-700/50">
          <div className="h-10 w-full rounded-lg bg-gray-700 skeleton-loading" />
          <div className="h-10 w-full rounded-lg bg-gray-700 skeleton-loading" />
        </div>
      </div>
    </div>
  );
};
