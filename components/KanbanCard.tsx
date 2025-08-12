





import React from 'react';
import { Prospect } from '../types';
import { ChatBubbleLeftRightIcon, GlobeAltIcon, InstagramIcon, LightBulbIcon } from './icons';

interface KanbanCardProps {
    prospect: Prospect;
    index: number;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, prospectId: string) => void;
    onDragEnd: () => void;
    onCardClick: (prospect: Prospect) => void;
    isUpdatingAI: boolean;
}

const AIScoreRadial: React.FC<{ score: number }> = ({ score }) => {
    const size = 36;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getScoreColor = () => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`transition-all duration-500 ${getScoreColor()}`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                    }}
                />
            </svg>
            <span className={`absolute text-xs font-bold ${getScoreColor()}`}>{score}</span>
        </div>
    );
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ prospect, index, onDragStart, onDragEnd, onCardClick, isUpdatingAI }) => {
    
    const hasAnalysis = prospect.analysis && prospect.analysis.trim().length > 0;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, prospect.id)}
            onDragEnd={onDragEnd}
            onClick={() => onCardClick(prospect)}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-pointer active:cursor-grabbing shadow-md hover:shadow-lg hover:border-blue-500/50 transition-all duration-200 flex flex-col gap-3"
            title={`Clique para ver detalhes de ${prospect.name}`}
            data-tour={index === 0 ? 'kanban-card' : undefined}
        >
            <div className="flex justify-between items-start gap-3">
                <h4 className="font-bold text-gray-100 text-base flex-grow">{prospect.name}</h4>
                <div className="flex-shrink-0">
                    <AIScoreRadial score={prospect.aiScore} />
                </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
                <div className="flex-shrink-0 pt-0.5 text-cyan-400">
                    {isUpdatingAI 
                        ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                        : <LightBulbIcon className="h-4 w-4" />
                    }
                </div>
                <p className={`italic ${isUpdatingAI ? 'text-gray-500' : 'text-cyan-200'}`}>
                    {isUpdatingAI ? "Gerando nova sugestão..." : prospect.nextRecommendedAction}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 mt-1 pt-3 border-t border-gray-700/60">
                <div className="flex items-center gap-1.5 text-gray-400" title="Possui análise da IA">
                    {hasAnalysis && <ChatBubbleLeftRightIcon className="h-4 w-4" />}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                    {prospect.website && prospect.foundOn?.includes('google') && (
                        <a href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-blue-400 transition-colors" title={prospect.website}>
                            <GlobeAltIcon className="h-5 w-5" />
                        </a>
                    )}
                    {prospect.instagramUrl && prospect.foundOn?.includes('instagram') && (
                         <a href={typeof prospect.instagramUrl === 'string' && prospect.instagramUrl.startsWith('http') ? prospect.instagramUrl : `https://instagram.com/${(prospect.instagramUrl || '').replace('@','')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-pink-400 transition-colors" title={prospect.instagramUrl}>
                            <InstagramIcon className="h-5 w-5" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};