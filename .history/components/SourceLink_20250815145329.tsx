
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { findProspects } from '../services/geminiService';
import { Prospect, UserSettings, SearchSource } from '../types';
import { ProspectCard, ProspectCardSkeleton } from './ProspectCard';
import { SearchIcon, BrainCircuitIcon, ClipboardIcon, UserGroupIcon, MapPinIcon, ExclamationTriangleIcon, PencilSquareIcon, CheckIcon, ArrowRightOnRectangleIcon, BookOpenIcon, PaperAirplaneIcon, CheckCircleIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon, QuestionMarkCircleIcon, KeyIcon, InstagramIcon, GlobeAltIcon } from './icons';
import { DatabaseView } from './DatabaseView';
import { InteractiveTour, TourStep } from './InteractiveTour';
import { submitSuggestion } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthContext';
import * as dataService from '../services/dataService';
import { APP_VERSION } from '../App';
import { Modal } from './Modal';
import { InactivityFeedbackModal } from './InactivityFeedbackModal';
import { useApiKey } from '../contexts/ApiKeyContext';
import { ApiKeyModal } from './ApiKeyModal';
import { LocationAutocomplete } from './LocationAutocomplete';


const Toast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm text-white py-3 px-5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up z-50 border border-gray-700">
        <ClipboardIcon className="h-6 w-6 text-green-400" />
        <span className="font-medium">{message}</span>
    </div>
);

const WarningModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50" aria-modal="true" role="dialog">
            <div className="bg-gray-800 border border-yellow-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full m-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-100">Atenção!</h2>
                    <p className="mt-2 text-gray-300">
                        Iniciar uma nova busca irá limpar os resultados da prospecção atual.
                    </p>
                    <p className="mt-4 text-sm bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                      <span className="font-bold">Dica:</span> Se precisar, cancele e use a aba <span className="font-semibold text-blue-400">Base de Prospectados</span> para salvar os resultados atuais.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                    >
                        Continuar e Limpar
                    </button>
                </div>
            </div>
        </div>
    );
};


type View = 'prospecting' | 'database';
type TourType = 'initial' | 'prospectCard' | 'database' | null;

const initialTourSteps: TourStep[] = [
    {
        selector: null,
        title: 'Bem-vindo ao Agente IA!',
        content: 'Este tour rápido mostrará como usar a ferramenta para encontrar seus primeiros clientes. Vamos começar!',
    },
    {
        selector: '[data-tour="search-input"]',
        title: 'Descreva seu Cliente Ideal',
        content: 'Digite aqui o perfil do cliente que você procura. Seja específico! Ex: "clínicas de estética em São Paulo" ou "restaurantes veganos que fazem delivery".',
        position: 'bottom',
    },
    {
        selector: '[data-tour="sources-container"]',
        title: 'Fontes de Prospecção',
        content: 'Escolha onde a IA deve procurar. Você pode selecionar Google e Instagram para uma busca completa e atualizada.',
        position: 'bottom',
    },
    {
        selector: '[data-tour="location-input"]',
        title: 'Filtre por Localização (Opcional)',
        content: 'Se quiser, refine sua busca para uma cidade, estado ou país específico. Deixe em branco para uma busca global.',
        position: 'top',
    },
    {
        selector: '[data-tour="personalization-container"]',
        title: 'Personalize a IA',
        content: 'Aqui você pode adicionar informações sobre você ou sua empresa. A IA usará esse contexto para criar mensagens de contato mais eficazes e personalizadas.',
        position: 'top',
    },
    {
        selector: '[data-tour="prospect-button"]',
        title: 'Comece a Prospectar!',
        content: 'Quando estiver pronto, clique aqui. A IA começará a busca e trará os resultados para você em instantes.',
        position: 'bottom',
    },
];

const prospectCardTourSteps: TourStep[] = [
     {
        selector: '[data-tour="prospect-card"]',
        title: 'Resultados da Prospecção!',
        content: 'Excelente! A IA encontrou prospects para você. Este é um card de prospect. Vamos ver os detalhes.',
        position: 'bottom',
    },
    {
        selector: '[data-tour="prospect-card-aiscore"]',
        title: 'Score de Prioridade',
        content: 'A IA atribui um score de 0 a 100, indicando a relevância e a oportunidade de negócio. Scores mais altos são prioridade!',
        position: 'top',
    },
     {
        selector: '[data-tour="prospect-card-analysis"]',
        title: 'Análise Rápida da IA',
        content: 'Aqui está um resumo da análise de presença digital do prospect, destacando a principal oportunidade encontrada.',
        position: 'top',
    },
    {
        selector: '[data-tour="prospect-card-analysis-breakdown"]',
        title: 'Análise Detalhada',
        content: 'Clique aqui para expandir e ver uma auditoria ponto a ponto, com as evidências que a IA usou para sua análise.',
        position: 'top',
    },
    {
        selector: '[data-tour="prospect-card-suggestions"]',
        title: 'Sugestões de Melhoria',
        content: 'A IA gera 3 sugestões práticas que você pode usar para iniciar a conversa, agregando valor desde o primeiro contato. Você pode copiar o texto com um clique.',
        position: 'top',
    },
     {
        selector: '[data-tour="prospect-card-generate-message"]',
        title: 'Gerador de Mensagens',
        content: 'Com base em todos os dados e na sua personalização, este botão cria uma sequência de 3 mensagens de WhatsApp prontas para iniciar a conversa.',
        position: 'bottom',
    },
    {
        selector: '[data-tour="prospect-card-whatsapp"]',
        title: 'Contato Direto',
        content: 'Após gerar as mensagens, clique aqui para abrir o WhatsApp com o número e a mensagem inicial já preenchidos. Ao fazer isso, o prospect será movido para "Contatados" na sua base.',
        position: 'top',
    },
    {
        selector: '[data-tour="nav-tabs"]',
        title: 'Próximo Passo: Sua Base',
        content: 'Todos os prospects encontrados são salvos automaticamente na sua "Base de Prospectados". Lá você poderá gerenciar seu funil de vendas.',
        position: 'bottom',
    },
];

const databaseTourSteps: TourStep[] = [
    {
        selector: '[data-tour="kanban-board"]',
        title: 'Sua Base de Prospectados',
        content: 'Bem-vindo ao seu funil de vendas (Kanban)! Aqui você pode visualizar e gerenciar todos os seus prospects em diferentes estágios.',
        position: 'bottom',
    },
    {
        selector: '[data-tour="kanban-column-new"]',
        title: 'Colunas do Funil',
        content: 'Cada coluna representa um estágio do seu processo de vendas, desde "Novos" até "Contrato Fechado". Os títulos são personalizáveis!',
        position: 'bottom',
    },
    {
        selector: '[data-tour="kanban-card"]',
        title: 'Cards de Prospect',
        content: 'Cada card é um prospect. Você pode arrastá-los e soltá-los entre as colunas para atualizar seu status no funil de forma rápida e visual.',
        position: 'right',
    },
    {
        selector: null,
        title: 'Explore os Detalhes',
        content: 'Clique em qualquer card para abrir uma visão detalhada, analisar interações, gerar novas mensagens e ver todas as informações do prospect. Bom trabalho!',
    },
];

const tourConfig: Record<NonNullable<TourType>, TourStep[]> = {
    initial: initialTourSteps,
    prospectCard: prospectCardTourSteps,
    database: databaseTourSteps,
};

const FeedbackForm: React.FC<{onShowToast: (message: string) => void; userId: string;}> = ({onShowToast, userId}) => {
    const [suggestionText, setSuggestionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSuggestionSubmit = async () => {
        if (!suggestionText.trim()) {
          setSubmitError('Por favor, escreva uma sugestão.');
          return;
        }
        setSubmitError(null);
        setIsSubmitting(true);
        const { success, error } = await submitSuggestion({ suggestion: suggestionText, userId });
        setIsSubmitting(false);
        if (success) {
            setIsSubmitted(true);
            onShowToast('Sugestão enviada, obrigado!');
        } else {
            setSubmitError(error || 'Ocorreu um erro ao enviar. Tente novamente.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center bg-green-900/50 border border-green-700 rounded-lg p-6 flex flex-col items-center animate-fade-in-up">
                <CheckCircleIcon className="h-12 w-12 text-green-400 mb-3" />
                <h4 className="text-xl font-bold text-white">Obrigado!</h4>
                <p className="text-green-200">Sua sugestão foi enviada com sucesso.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-gray-300">Sua opinião é fundamental para a evolução da ferramenta. Encontrou um bug ou tem uma ideia? Compartilhe conosco!</p>
            <textarea
                value={suggestionText}
                onChange={(e) => {
                    setSuggestionText(e.target.value);
                    if (submitError) setSubmitError(null);
                }}
                rows={4}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-y"
                placeholder="Ex: Gostaria de poder organizar os prospects em pastas..."
                disabled={isSubmitting}
            />
            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            <button
                onClick={handleSuggestionSubmit}
                disabled={isSubmitting || !suggestionText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                    </>
                ) : (
                    <>
                        <PaperAirplaneIcon className="h-5 w-5" />
                        <span>Enviar Sugestão</span>
                    </>
                )}
            </button>
        </div>
    )
}

export const ProspectingTool: React.FC = () => {
  const { user, signOut } = useAuth();
  const { apiKey, provider, loading: apiKeyLoading } = useApiKey();
  const [query, setQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [view, setView] = useState<View>('prospecting');
  const [lastProspectsFound, setLastProspectsFound] = useState<Prospect[]>([]);
  const [searchSources, setSearchSources] = useState<Set<SearchSource>>(() => new Set(['google']));
  const [searchBraziliansAbroad, setSearchBraziliansAbroad] = useState(false);
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [activeTour, setActiveTour] = useState<TourType>(null);
  const [tourStep, setTourStep] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isManualFeedbackModalOpen, setIsManualFeedbackModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasCompletedProspectTour, setHasCompletedProspectTour] = useState(false);
  const [hasShownFeedbackModalThisSession, setHasShownFeedbackModalThisSession] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const showMultiSourceWarning = searchSources.size > 1;

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleLocationChange = useCallback((newValue: string) => {
    setSearchLocation(newValue);
    if (error) setError(null);
  }, [error]);

  useEffect(() => {
    const loadUserData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [prospectsData, settingsData] = await Promise.all([
                dataService.getProspects(user.id),
                dataService.getSettings(user.id)
            ]);
            setProspects(prospectsData);
            setSettings(settingsData);

            const hasCompletedInitialTour = localStorage.getItem('tour_initial_' + user.id);
            if (!hasCompletedInitialTour) {
                setActiveTour('initial');
            }
            const hasCompletedCardTour = localStorage.getItem('tour_prospectCard_' + user.id);
            if (hasCompletedCardTour) {
                setHasCompletedProspectTour(true);
            }

        } catch (e) {
            console.error("Failed to load user data:", e);
            setError("Não foi possível carregar seus dados. Tente recarregar a página.");
        } finally {
            setIsLoading(false);
        }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
      if (lastProspectsFound.length > 0 && !isSearching && !hasCompletedProspectTour) {
          const timeout = setTimeout(() => {
            setActiveTour('prospectCard');
            setTourStep(0);
            setHasCompletedProspectTour(true);
          }, 500);
          return () => clearTimeout(timeout);
      }
  }, [lastProspectsFound, isSearching, hasCompletedProspectTour]);
  
  useEffect(() => {
    if (!user || hasShownFeedbackModalThisSession) {
      return;
    }
    const lastShownTimestamp = localStorage.getItem('feedbackModalLastShown');
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const shouldConsiderShowing = !lastShownTimestamp || (Date.now() - parseInt(lastShownTimestamp, 10) > oneWeekInMs);
    if (!shouldConsiderShowing) return;

    const showModalOnce = () => {
        if (document.hidden || hasShownFeedbackModalThisSession) return;
        const lastShown = localStorage.getItem('feedbackModalLastShown');
        if (!lastShown || (Date.now() - parseInt(lastShown, 10) > oneWeekInMs)) {
            setIsFeedbackModalOpen(true);
            setHasShownFeedbackModalThisSession(true);
            localStorage.setItem('feedbackModalLastShown', Date.now().toString());
        }
    };
    
    const inactivityTimeout = setTimeout(showModalOnce, 600000);
    const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) showModalOnce();
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(inactivityTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [user, hasShownFeedbackModalThisSession]);

  const handleCloseTour = () => {
      if (user && activeTour) {
          localStorage.setItem('tour_' + activeTour + '_' + user.id, 'true');
      }
      setActiveTour(null);
      setTourStep(0);
  };

  const handleStartGlobalTour = () => {
      setView('prospecting');
      setActiveTour('initial');
      setTourStep(0);
  }

  const handleStartDatabaseTour = () => {
      setActiveTour('database');
      setTourStep(0);
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  const handleSourceChange = (source: SearchSource) => {
    setSourceError(null);
    setSearchSources(prev => {
        const newSet = new Set(prev);
        if (newSet.has(source)) newSet.delete(source);
        else newSet.add(source);
        return newSet;
    });
  };
  
  const executeProspecting = useCallback(async () => {
    if (!user || !apiKey || !provider) {
      setError("A chave de API do Gemini não está configurada corretamente.");
      setIsApiKeyModalOpen(true);
      return;
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsSearching(true);
    setError(null);
    setSourceError(null);
    setLastProspectsFound([]);

    const finalQuery = searchBraziliansAbroad ? `${query} (foco em negócios e empreendedores brasileiros na localização especificada)` : query;

    try {
      const { prospects: foundProspects } = await findProspects(finalQuery, Array.from(searchSources), searchLocation, { apiKey, provider });
      
      if (signal.aborted) return;
      
      // Filter out prospects that already exist in the user's database based on name and website
      const existingIdentifiers = new Set(
        prospects.map(p => `${p.name.trim().toLowerCase()}|${(p.website || '').trim().toLowerCase()}`)
      );

      const newProspects = foundProspects.filter(p => {
        const identifier = `${p.name.trim().toLowerCase()}|${(p.website || '').trim().toLowerCase()}`;
        return !existingIdentifiers.has(identifier);
      });
      
      if (newProspects.length === 0) {
          const message = foundProspects.length > 0
            ? 'Todos os prospects encontrados já estão na sua base.'
            : 'Nenhum prospect novo encontrado. Tente refinar sua busca.';
          setError(message);
          showToast(message);
          setLastProspectsFound([]);
      } else {
          const prospectsWithUserAndSource = newProspects.map(p => ({ ...p, user_id: user.id, foundOn: Array.from(searchSources) }));
          const prospectsWithDbIds = await dataService.addProspects(user.id, prospectsWithUserAndSource);
          
          setLastProspectsFound(prospectsWithDbIds);
          setProspects(prev => [...prev, ...prospectsWithDbIds]);
          showToast(`${prospectsWithDbIds.length} novo(s) prospect(s) adicionado(s) à sua base.`);
      }
    } catch (e: unknown) {
      if (signal.aborted) return;
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError('Falha ao buscar prospects: ' + errorMessage);
    } finally {
      if (!signal.aborted) setIsSearching(false);
    }
  }, [query, searchSources, searchLocation, searchBraziliansAbroad, showToast, user, apiKey, provider, prospects]);

  const handleProspect = useCallback(() => {
    setError(null);
    setSourceError(null);
    
    if (searchSources.size === 0) {
        setSourceError('Selecione ao menos uma fonte para continuar.');
        return;
    }
    
    if (!query.trim()) {
      setError('Por favor, insira um critério de busca para continuar.');
      return;
    }

    if (!searchLocation.trim()) {
        setError('O campo Localização é obrigatório.');
        return;
    }
    
     if (!apiKey || !provider) {
        setError('Por favor, configure sua chave de API do Gemini para continuar.');
        setIsApiKeyModalOpen(true);
        return;
    }

    if (lastProspectsFound.length > 0) setIsWarningModalOpen(true);
    else executeProspecting();
  }, [query, searchSources, searchLocation, lastProspectsFound, executeProspecting, apiKey, provider]);
  
  const handleConfirmProspecting = useCallback(() => {
    setIsWarningModalOpen(false);
    executeProspecting();
  }, [executeProspecting]);
  
  const handleCancelSearch = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsSearching(false);
        setError("Busca cancelada pelo usuário.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isSearching) handleProspect();
  };

  const handleUpdateProspect = useCallback(async (prospectId: string, updates: Partial<Prospect>) => {
    if (!user) return;
    setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, ...updates } : p));
    await dataService.updateProspect(user.id, prospectId, updates);
  }, [user]);
  
  const handleDeleteProspect = useCallback(async (prospectId: string) => {
    if (!user) return;
    try {
        await dataService.deleteProspect(user.id, prospectId);
        setProspects(prev => prev.filter(p => p.id !== prospectId));
        setLastProspectsFound(prev => prev.filter(p => p.id !== prospectId));
        showToast("Prospect descartado com sucesso.");
    } catch (e) {
        console.error("Falha ao descartar o prospect:", e);
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        setError(`Falha ao descartar o prospect: ${errorMessage}`);
    }
  }, [user, showToast]);

  const handleUpdateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings as UserSettings);
    await dataService.updateSettings(user.id, newSettings as UserSettings);
  }, [user, settings]);

  const handleClearAllProspects = useCallback(async () => {
    if (!user) return;
    try {
        await dataService.clearProspects(user.id);
        setProspects([]);
        showToast("Base de prospectados limpa com sucesso!");
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        setError('Falha ao limpar a base: ' + errorMessage);
        console.error("Failed to clear prospects:", e);
    }
  }, [user, showToast]);
  
  const SearchSourceCheckbox: React.FC<{source: SearchSource, label: string, icon: React.ReactNode}> = ({ source, label, icon }) => (
    <label htmlFor={'source-' + source} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
        <input id={'source-' + source} type="checkbox" checked={searchSources.has(source)} onChange={() => handleSourceChange(source)} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-gray-900" />
        <div className="flex items-center gap-1.5">{icon}<span className="font-medium text-gray-200">{label}</span></div>
    </label>
  );

  const renderProspectingView = () => (
    <>
      <div className="sticky top-4 z-10 bg-gray-900/60 backdrop-blur-xl p-4 rounded-xl border border-gray-700/80 shadow-2xl shadow-blue-900/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <input data-tour="search-input" type="text" value={query} onChange={(e) => { setQuery(e.target.value); setError(null); setSourceError(null); }} onKeyDown={handleKeyDown} placeholder="Ex: dentistas, petshops com banho e tosa..." className="flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200" disabled={isSearching} />
          {isSearching ? (
            <div className="flex items-center justify-center gap-3 bg-gray-700 text-gray-400 font-bold py-3 px-4 rounded-lg"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Buscando...</span><button onClick={handleCancelSearch} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm -my-1 -mr-1">Cancelar</button></div>
          ) : (
            <button data-tour="prospect-button" onClick={handleProspect} disabled={!query.trim() || !searchLocation.trim()} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"><SearchIcon className="h-5 w-5" /><span>Prospectar</span></button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-tour="sources-container">
              <label className="block text-sm font-medium text-gray-300 mb-2">Fontes de Prospecção</label>
              {sourceError && <p className="text-sm text-yellow-400 -mt-1 mb-2 animate-fade-in-up" style={{animationDuration: '0.3s'}}>{sourceError}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-2 p-2 bg-gray-800/50 border border-gray-700 rounded-lg">
                <SearchSourceCheckbox source="google" label="Google" icon={<SearchIcon className="h-4 w-4 text-gray-400"/>}/>
                <SearchSourceCheckbox source="instagram" label="Instagram" icon={<InstagramIcon className="h-4 w-4 text-gray-400"/>}/>
              </div>
               {showMultiSourceWarning && (
                <div className="mt-2 text-sm text-yellow-400 bg-yellow-900/40 border border-yellow-700/50 rounded-lg p-2 animate-fade-in-up">
                    Selecionar múltiplas fontes pode limitar os resultados. Para uma busca mais assertiva, sugerimos usar uma fonte de cada vez.
                </div>
              )}
            </div>
            <div>
              <div data-tour="location-input">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300">Localização (Obrigatório)</label>
                  </div>
                  <LocationAutocomplete
                      value={searchLocation}
                      onChange={handleLocationChange}
                      disabled={isSearching}
                  />
              </div>
                <div className="mt-3">
                    <label htmlFor="brazilians-abroad" className="flex items-center gap-2.5 cursor-pointer group">
                        <input 
                            id="brazilians-abroad"
                            type="checkbox"
                            checked={searchBraziliansAbroad}
                            onChange={(e) => setSearchBraziliansAbroad(e.target.checked)}
                            className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Focar em empreendedores brasileiros no exterior
                        </span>
                    </label>
                </div>
            </div>
        </div>
        <div data-tour="personalization-container" className="mt-4"><label htmlFor="message-template" className="block text-sm font-medium text-gray-300 mb-2">Personalização da IA (Opcional)</label>
            {isTemplateExpanded ? (<div className="relative"><textarea id="message-template" rows={5} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y" value={settings?.messageTemplate || ''} onChange={(e) => handleUpdateSettings({ messageTemplate: e.target.value })} disabled={isSearching} placeholder="Descreva sobre você..." />
            <button onClick={() => setIsTemplateExpanded(false)} className="absolute top-2 right-2 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-lg text-sm"><CheckIcon className="h-4 w-4" />Fechar</button></div>) : (<div className="flex justify-between items-center bg-gray-800 border border-dashed border-gray-600 rounded-lg p-3 group"><p className="text-gray-400 text-sm truncate pr-4">{settings?.messageTemplate ? settings.messageTemplate.split('\n')[0] : "Nenhuma personalização definida"}</p><button onClick={() => setIsTemplateExpanded(true)} className="flex-shrink-0 flex items-center gap-2 text-blue-400 font-semibold text-sm hover:text-blue-300"><PencilSquareIcon className="h-4 w-4" /><span>{settings?.messageTemplate ? 'Editar' : 'Adicionar'}</span></button></div>)}
            <p className="text-xs text-gray-500 mt-1">A IA usará este texto para dar personalidade e contexto às sugestões de mensagem.</p>
        </div>
      </div>
      <div id="tour-results-area" className="w-full mt-8">
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                <p className="font-medium">Ocorreu um erro</p>
                <p className="text-sm text-red-200">{error}</p>
            </div>
        )}
        
        {isSearching && (
            <>
                <div className="mb-6">
                    <p className="text-lg text-center text-gray-300 animate-pulse">A busca está em andamento para garantir que todas as informações sejam reais e verificadas. Isso pode levar alguns minutos.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <ProspectCardSkeleton key={index} />
                    ))}
                </div>
            </>
        )}

        {!isSearching && !error && (
            <>
                {lastProspectsFound.length > 0 ? (
                     <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-200">Resultados da Prospecção</h2>
                            <p className="text-gray-400">Estes foram os prospects encontrados em sua última busca.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {lastProspectsFound.map((prospect, index) => (
                                <ProspectCard key={prospect.id || index} prospect={prospect} messageTemplate={settings?.messageTemplate || ''} onUpdateProspect={handleUpdateProspect} onDeleteProspect={handleDeleteProspect} onShowToast={showToast} isFirstCard={index === 0} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 px-4 bg-gray-800/30 border border-dashed border-gray-700 rounded-xl">
                        <BrainCircuitIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-200 mb-2">Pronto para encontrar novos clientes?</h2>
                        <p className="text-gray-400 max-w-md mx-auto">Descreva o perfil de cliente que você busca, selecione as fontes e clique em "Prospectar" para começar.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </>
  );

  const NavButton: React.FC<{currentView: View, targetView: View, setView: (view: View) => void, children: React.ReactNode}> = ({ currentView, targetView, setView, children }) => {
      const isActive = currentView === targetView;
      return (<button onClick={() => setView(targetView)} className={'flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg transition-all duration-200 ' + (isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white')}>{children}</button>)
  };

  if (isLoading || !settings || apiKeyLoading) {
    return (
        <div className="min-h-screen text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center flex-grow">
                <div className="space-y-4 p-4 rounded-xl border border-gray-700/80 bg-gray-900/60 w-full">
                    <div className="h-10 w-3/4 mx-auto rounded-md skeleton-loading"></div>
                    <div className="h-24 w-full rounded-md skeleton-loading"></div>
                    <div className="h-40 w-full rounded-md skeleton-loading"></div>
                </div>
            </div>
        </div>
    );
  }

  const currentTourSteps = activeTour ? tourConfig[activeTour] : [];

  return (
    <>
      <div className="min-h-screen text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow">
          <div className='flex-grow'>
              <header className="relative text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-2"><BrainCircuitIcon className="h-10 w-10 text-blue-400" /><h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">Agente de Prospecção IA</h1></div>
                  <p className="text-gray-400 text-lg">Encontre, contate e gerencie prospects com o poder da IA.</p>
                  <div className="absolute top-0 right-0 flex items-center gap-2">
                    <button onClick={() => setIsApiKeyModalOpen(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-blue-800/50 text-gray-300 hover:text-blue-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-blue-700/50" title="Configurar sua API Key do Gemini">
                      <KeyIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Configurar IA</span>
                    </button>
                    <button onClick={signOut} className="flex items-center gap-2 bg-gray-800 hover:bg-red-800/50 text-gray-300 hover:text-red-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-red-700/50" title="Sair da sua conta">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Sair</span>
                    </button>
                  </div>
              </header>
              <div data-tour="nav-tabs" className="flex justify-center mb-8 p-1.5 bg-gray-800/80 rounded-xl border border-gray-700/80 max-w-md mx-auto">
                  <NavButton currentView={view} targetView="prospecting" setView={setView}><SearchIcon className="h-5 w-5"/>Prospectar</NavButton>
                  <NavButton currentView={view} targetView="database" setView={setView}><UserGroupIcon className="h-5 w-5"/>Base de Prospectados ({prospects.length})</NavButton>
              </div>
              <main className="w-full">
                  {view === 'prospecting' ? renderProspectingView() : (
                  <DatabaseView 
                      prospects={prospects}
                      settings={settings}
                      onUpdateProspect={handleUpdateProspect}
                      onDeleteProspect={handleDeleteProspect}
                      onShowToast={showToast}
                      onUpdateSettings={handleUpdateSettings}
                      onStartTour={handleStartDatabaseTour}
                      onClearProspects={handleClearAllProspects}
                  />)}
              </main>
          </div>
          <footer className="text-center mt-12 py-4 text-gray-500 text-sm border-t border-gray-800"><p>Agente de Prospecção IA - Versão {APP_VERSION}</p></footer>
        </div>
        <WarningModal isOpen={isWarningModalOpen} onConfirm={handleConfirmProspecting} onCancel={() => setIsWarningModalOpen(false)} />
        {toast && <Toast message={toast} />}

        {isFabMenuOpen && (
            <div
                className="fixed inset-0 z-30"
                onClick={() => setIsFabMenuOpen(false)}
            />
        )}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
             <div className={'flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ' + (isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none')}>
                 <button 
                     onClick={() => { setIsManualFeedbackModalOpen(true); setIsFabMenuOpen(false); }} 
                     className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg"
                     title="Enviar feedback ou sugestão"
                 >
                     <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
                     <span className="text-sm">Feedback</span>
                 </button>
                 <button 
                     onClick={() => { handleStartGlobalTour(); setIsFabMenuOpen(false); }}
                     className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg"
                     title="Reiniciar o tour inicial"
                 >
                     <BookOpenIcon className="h-6 w-6" />
                     <span className="text-sm">Ver Tutorial</span>
                 </button>
            </div>
             <button
                onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
                className={'bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-transform duration-300 transform ' + (isFabMenuOpen ? 'rotate-45' : 'hover:scale-110')}
                aria-label={isFabMenuOpen ? 'Fechar menu de ajuda' : 'Abrir menu de ajuda'}
                aria-expanded={isFabMenuOpen}
            >
                <XMarkIcon className={'h-7 w-7 transition-opacity duration-300 ' + (isFabMenuOpen ? 'opacity-100' : 'opacity-0 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2')} />
                <QuestionMarkCircleIcon className={'h-7 w-7 transition-opacity duration-300 ' + (isFabMenuOpen ? 'opacity-0' : 'opacity-100')} />
            </button>
        </div>
        
        {activeTour && <InteractiveTour steps={currentTourSteps} stepIndex={tourStep} onClose={handleCloseTour} onNext={() => setTourStep(s => s + 1)} onPrev={() => setTourStep(s => s - 1)} />}
        <InactivityFeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onShowToast={showToast} />
        <Modal isOpen={isManualFeedbackModalOpen} onClose={() => setIsManualFeedbackModalOpen(false)} title="Feedback e Sugestões">
            <FeedbackForm onShowToast={showToast} userId={user!.id} />
        </Modal>
        <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      </div>
    </>
  );
};
