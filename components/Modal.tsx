import React from 'react';
import { XMarkIcon } from './icons';

export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50" 
            aria-modal="true" 
            role="dialog" 
            onClick={onClose}
        >
            <div
                className={`relative bg-gray-800 border border-gray-700/80 rounded-2xl shadow-2xl w-full m-4 animate-fade-in-up ${sizeClasses[size]}`}
                style={{ animationDuration: '0.3s' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10" 
                    aria-label="Fechar modal"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 sm:p-8">
                    {title && (
                      <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
                      </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};