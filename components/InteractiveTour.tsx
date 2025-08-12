
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from './icons';

export interface TourStep {
    selector: string | null;
    title: string;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveTourProps {
    steps: TourStep[];
    stepIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const HIGHLIGHT_PADDING = 4;
const POPOVER_GAP = 15;

/**
 * Custom hook to get an element's position and dimensions.
 * It also handles scrolling the element into view.
 */
function useElementRect(selector: string | null) {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        if (!selector) {
            setRect(null);
            return;
        }
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) {
            setRect(null);
            return;
        }

        const updateRect = () => {
            element.scrollIntoView({
                behavior: 'instant',
                block: 'center',
                inline: 'center',
            });
            setRect(element.getBoundingClientRect());
        };

        // A small delay can help ensure the scroll has completed and layout is stable.
        const timeoutId = setTimeout(updateRect, 50);
        
        window.addEventListener('resize', updateRect);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateRect);
        };
    }, [selector]);

    return rect;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({ steps, stepIndex, onClose, onNext, onPrev }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    
    const currentStep = steps[stepIndex];
    const targetRect = useElementRect(currentStep?.selector);
    
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        // Hide popover while calculating to prevent flicker
        setIsVisible(false);

        const popoverNode = popoverRef.current;
        if (!popoverNode) return;

        // Use a short timeout to allow the DOM to update with the new step's content,
        // which might change the popover's size.
        const timer = setTimeout(() => {
            const popoverRect = popoverNode.getBoundingClientRect();

            if (!targetRect) {
                // Centered modal for steps without a selector
                setPopoverStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                });
                setArrowStyle({ display: 'none' });
                setIsVisible(true);
                return;
            }
            
            const position = currentStep.position || 'bottom';
            const newPopoverStyle: React.CSSProperties = {};
            const newArrowStyle: React.CSSProperties = { position: 'absolute' };
            
            const { width: popoverWidth, height: popoverHeight } = popoverRect;

            switch (position) {
                case 'top':
                    newPopoverStyle.top = targetRect.top - popoverHeight - POPOVER_GAP;
                    newPopoverStyle.left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
                    newArrowStyle.top = '100%';
                    newArrowStyle.left = '50%';
                    newArrowStyle.transform = 'translateX(-50%)';
                    newArrowStyle.borderTop = '8px solid rgb(17 24 39)'; // bg-gray-900
                    newArrowStyle.borderLeft = '8px solid transparent';
                    newArrowStyle.borderRight = '8px solid transparent';
                    break;
                case 'right':
                    newPopoverStyle.top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
                    newPopoverStyle.left = targetRect.right + POPOVER_GAP;
                    newArrowStyle.top = '50%';
                    newArrowStyle.left = '-8px';
                    newArrowStyle.transform = 'translateY(-50%)';
                    newArrowStyle.borderRight = '8px solid rgb(17 24 39)';
                    newArrowStyle.borderTop = '8px solid transparent';
                    newArrowStyle.borderBottom = '8px solid transparent';
                    break;
                case 'left':
                    newPopoverStyle.top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
                    newPopoverStyle.left = targetRect.left - popoverWidth - POPOVER_GAP;
                    newArrowStyle.top = '50%';
                    newArrowStyle.left = '100%';
                    newArrowStyle.transform = 'translateY(-50%)';
                    newArrowStyle.borderLeft = '8px solid rgb(17 24 39)';
                    newArrowStyle.borderTop = '8px solid transparent';
                    newArrowStyle.borderBottom = '8px solid transparent';
                    break;
                case 'bottom':
                default:
                    newPopoverStyle.top = targetRect.bottom + POPOVER_GAP;
                    newPopoverStyle.left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
                    newArrowStyle.top = '-8px';
                    newArrowStyle.left = '50%';
                    newArrowStyle.transform = 'translateX(-50%)';
                    newArrowStyle.borderBottom = '8px solid rgb(17 24 39)';
                    newArrowStyle.borderLeft = '8px solid transparent';
                    newArrowStyle.borderRight = '8px solid transparent';
                    break;
            }

            // Boundary checks
            if ((newPopoverStyle.left as number) < POPOVER_GAP) newPopoverStyle.left = POPOVER_GAP;
            if ((newPopoverStyle.left as number) + popoverWidth > window.innerWidth - POPOVER_GAP) {
                newPopoverStyle.left = window.innerWidth - popoverWidth - POPOVER_GAP;
            }
            if ((newPopoverStyle.top as number) < POPOVER_GAP) newPopoverStyle.top = POPOVER_GAP;
            if ((newPopoverStyle.top as number) + popoverHeight > window.innerHeight - POPOVER_GAP) {
                newPopoverStyle.top = window.innerHeight - popoverHeight - POPOVER_GAP;
            }

            setPopoverStyle(newPopoverStyle);
            setArrowStyle(newArrowStyle);
            setIsVisible(true);
        }, 50); // Small delay for rendering updates

        return () => clearTimeout(timer);

    }, [currentStep, targetRect]);

    if (!currentStep) return null;

    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === steps.length - 1;

    // This implementation separates the overlay from the popover, ensuring the highlighted
    // element remains sharp and visible.
    return (
        <div
            className="fixed inset-0 z-[9999]"
            aria-live="polite"
            onClick={(e) => {
                // Close if clicking outside the popover.
                // This checks if the click target is NOT the popover or a child of it.
                if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                    onClose();
                }
            }}
        >
            {/* Overlay and Highlight Logic */}
            {targetRect ? (
                <div
                    className="fixed rounded-lg pointer-events-none"
                    style={{
                        top: targetRect.top - HIGHLIGHT_PADDING,
                        left: targetRect.left - HIGHLIGHT_PADDING,
                        width: targetRect.width + HIGHLIGHT_PADDING * 2,
                        height: targetRect.height + HIGHLIGHT_PADDING * 2,
                        // This shadow punches a hole, creating the overlay effect
                        // around the perfectly sharp highlighted element.
                        boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.6)', // Corresponds to bg-gray-900/60
                        transition: 'all 0.3s ease-in-out',
                    }}
                />
            ) : (
                // Fallback for steps without a target (e.g., welcome screen)
                <div className="absolute inset-0 bg-gray-900/60 transition-opacity duration-300" />
            )}
            
            {/* Popover */}
            <div
                ref={popoverRef}
                style={{ ...popoverStyle, visibility: isVisible ? 'visible' : 'hidden' }}
                className="fixed bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-5 w-full max-w-sm text-white transition-all duration-300 animate-fade-in-up"
                role="dialog"
                aria-labelledby="tour-title"
                aria-modal="true"
                // Stop clicks inside the popover from closing the tour
                onClick={(e) => e.stopPropagation()}
            >
                <div style={arrowStyle} className="w-0 h-0" />
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors" aria-label="Fechar tour">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 id="tour-title" className="text-xl font-bold text-blue-300 mb-3">{currentStep.title}</h3>
                <div className="text-gray-300 leading-relaxed text-base">{currentStep.content}</div>
                
                {/* Controls */}
                <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-medium">
                        {stepIndex + 1} / {steps.length}
                    </span>
                    <div className="flex items-center gap-3">
                        {!isFirstStep && (
                            <button
                                onClick={onPrev}
                                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Anterior
                            </button>
                        )}
                        {!isLastStep ? (
                            <button
                                onClick={onNext}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                            >
                                Próximo
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                            >
                                Finalizar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
