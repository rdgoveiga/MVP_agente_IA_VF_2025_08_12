
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Prospect, ProspectStatus, UserSettings } from '../types';
import { KanbanCard } from './KanbanCard';
import { ProspectDetailModal } from './ProspectDetailModal';
import { ArrowDownTrayIcon, ChevronDownIcon, PencilSquareIcon, CheckIcon, QuestionMarkCircleIcon, UserGroupIcon, SearchIcon, ExclamationTriangleIcon } from './icons';
import { getFunnelSuggestion } from '../services/geminiService';
import * as XLSX from 'xlsx';
import { Modal } from './Modal';
import { useApiKey } from '../contexts/ApiKeyContext';

interface DatabaseViewProps {
  prospects: Prospect[];
  settings: UserSettings;
  onUpdateProspect: (prospectId: string, updates: Partial<Prospect>) => void;
  onDeleteProspect: (prospectId: string) => void;
  onShowToast: (message: string) => void;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onStartTour: () => void;
  onClearProspects: () => Promise<void>;
}

const defaultColumns: { title: string; status: ProspectStatus; color: string }[] = [
    { title: 'Novos', status: 'new', color: 'border-b-blue-500' },
    { title: 'Contatados', status: 'contacted', color: 'border-b-yellow-500' },
    { title: 'Em Negociação', status: 'negotiating', color: 'border-b-purple-500' },
    { title: 'Contrato fechado', status: 'won', color: 'border-b-green-500' },
];

export const DatabaseView: React.FC<DatabaseViewProps> = ({ prospects, settings, onUpdateProspect, onDeleteProspect, onShowToast, onUpdateSettings, onStartTour, onClearProspects }) => {
  const { apiKey, provider } = useApiKey();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [updatingAIGuide, setUpdatingAIGuide] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingColumn, setEditingColumn] = useState<ProspectStatus | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const columnTitles = settings.kanbanColumnTitles;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      if (editingColumn && titleInputRef.current) {
          titleInputRef.current.focus();
      }
  }, [editingColumn]);

  const handleUpdateAISuggestion = async (prospect: Prospect) => {
    if (!apiKey || !provider) {
      onShowToast('Chave de IA não configurada. Não é possível obter sugestão.');
      return;
    }
    setUpdatingAIGuide(prospect.id);
    try {
        const suggestion = await getFunnelSuggestion(prospect, { apiKey, provider });
        onUpdateProspect(prospect.id, { nextRecommendedAction: suggestion });
    } catch (error) {
        console.error("Failed to get AI suggestion:", error);
        onShowToast("Falha ao buscar sugestão da IA.");
    } finally {
        setUpdatingAIGuide(null);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, prospectId: string) => {
    e.dataTransfer.setData("prospectId", prospectId);
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProspectStatus) => {
    e.preventDefault();
    const prospectId = e.dataTransfer.getData("prospectId");
    const prospect = prospects.find(p => p.id === prospectId);
    if (prospect && prospect.status !== newStatus) {
        const updatedProspect = { ...prospect, status: newStatus };
        onUpdateProspect(prospectId, { status: newStatus });
        handleUpdateAISuggestion(updatedProspect);
    }
    setDragging(false);
  };
  
    const handleSaveTitle = (status: ProspectStatus) => {
        onUpdateSettings({ kanbanColumnTitles: { ...columnTitles, [status]: tempTitle } });
        setEditingColumn(null);
    };

    const handleExport = () => {
        const dataToExport = prospects.map(p => ({
            'Nome': p.name,
            'Descrição': p.description,
            'Telefone': p.phone,
            'Website': p.website,
            'Instagram': p.instagramUrl,
            'Status': columnTitles[p.status] || p.status,
            'Score IA': p.aiScore,
            'Próxima Ação': p.nextRecommendedAction,
            'Análise Resumida': p.analysis,
            'Sugestões': p.improvementSuggestions,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Prospects");
        XLSX.writeFile(workbook, "prospects_export.xlsx");
        setIsExportMenuOpen(false);
        onShowToast("Dados exportados para 'prospects_export.xlsx'");
    };

    const handleConfirmClear = async () => {
        await onClearProspects();
        setIsClearModalOpen(false);
    };
    
    const filteredProspects = prospects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const prospectsByStatus = filteredProspects.reduce((acc, p) => {
        (acc[p.status] = acc[p.status] || []).push(p);
        return acc;
    }, {} as Record<ProspectStatus, Prospect[]>);

    return (
        <div data-tour="kanban-board" className="w-full animate-fade-in-up" style={{animationDuration: '0.5s'}}>
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2.5 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onStartTour} className="flex items-center gap-2 text-sm text-blue-400 font-semibold hover:text-blue-300"><QuestionMarkCircleIcon className="h-5 w-5" /><span>Ver Tutorial</span></button>
                    <div ref={exportMenuRef} className="relative">
                        <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 bg-gray-700/80 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"><ChevronDownIcon className="h-5 w-5" /><span>Ações</span></button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-700">
                                <div className="py-1">
                                    <button onClick={handleExport} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-3"><ArrowDownTrayIcon className="h-5 w-5" />Exportar para Excel</button>
                                    <div className="border-t border-gray-700 my-1"></div>
                                    <button onClick={() => { setIsClearModalOpen(true); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 flex items-center gap-3">Limpar Base de Dados</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                {defaultColumns.map(column => (
                    <div key={column.status} onDrop={e => handleDrop(e, column.status)} onDragOver={e => e.preventDefault()} data-tour={column.status === 'new' ? 'kanban-column-new' : undefined} className={`bg-gray-900/30 rounded-xl transition-all duration-300 ${dragging ? 'outline-dashed outline-2 outline-blue-500' : ''}`}>
                        <div className={`px-3 py-3 rounded-t-xl border-b-4 ${column.color}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-100">{columnTitles[column.status] || column.title}</h3>
                                    <span className="text-xs font-semibold text-gray-400 bg-gray-700/80 rounded-full px-2 py-0.5">{(prospectsByStatus[column.status] || []).length}</span>
                                </div>
                                <button onClick={() => { setEditingColumn(column.status); setTempTitle(columnTitles[column.status] || column.title); }} className="text-gray-500 hover:text-white"><PencilSquareIcon className="h-4 w-4" /></button>
                            </div>
                            {editingColumn === column.status && (
                                <div className="mt-2 flex gap-2">
                                    <input ref={titleInputRef} value={tempTitle} onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(column.status)} onBlur={() => setEditingColumn(null)} onChange={e => setTempTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-1 text-sm text-white focus:ring-blue-500 focus:outline-none" />
                                    <button onClick={() => handleSaveTitle(column.status)} className="bg-blue-600 p-1.5 rounded-md"><CheckIcon className="h-4 w-4" /></button>
                                </div>
                            )}
                        </div>
                        <div className="p-2 space-y-3 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                            {(prospectsByStatus[column.status] || []).map((prospect, index) => (<KanbanCard key={prospect.id} prospect={prospect} index={index} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onCardClick={setSelectedProspect} isUpdatingAI={updatingAIGuide === prospect.id} />))}
                            {(!prospectsByStatus[column.status] || prospectsByStatus[column.status].length === 0) && (<div className="text-center p-8 text-sm text-gray-500"><UserGroupIcon className="h-8 w-8 mx-auto mb-2" />Vazio</div>)}
                        </div>
                    </div>
                ))}
            </div>
            {selectedProspect && <ProspectDetailModal isOpen={!!selectedProspect} onClose={() => setSelectedProspect(null)} prospect={selectedProspect} messageTemplate={settings.messageTemplate} onUpdateProspect={onUpdateProspect} onDeleteProspect={onDeleteProspect} onShowToast={onShowToast} />}
            <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title="Confirmar Limpeza">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-200">Tem certeza que deseja remover todos os prospects da sua base?</p>
                    <p className="text-gray-400 mt-2">Esta ação não pode ser desfeita.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button onClick={() => setIsClearModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Cancelar</button>
                        <button onClick={handleConfirmClear} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Sim, Limpar Tudo</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};