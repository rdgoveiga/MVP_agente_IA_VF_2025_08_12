// src/components/InactivityFeedbackModal.tsx
import React, { useState } from 'react';
import { Modal } from './Modal';
import { submitSuggestion } from '../services/feedbackService';
import { StarIcon, CheckCircleIcon, PaperAirplaneIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface InactivityFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const InactivityFeedbackModal: React.FC<InactivityFeedbackModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extrai dados do usuário com fallbacks seguros
  const email =
    // Supabase v2: user.email costuma existir
    (user as any)?.email ??
    // às vezes alguém guarda email no metadata
    (user as any)?.user_metadata?.email ??
    null;

  const name =
    (user as any)?.user_metadata?.name ??
    (user as any)?.user_metadata?.full_name ??
    // fallback amigável: usa a parte antes do @
    (typeof email === 'string' && email.includes('@') ? email.split('@')[0] : null);

  const whatsapp =
    (user as any)?.user_metadata?.whatsapp ??
    (user as any)?.user_metadata?.phone ??
    null;

  const handleFeedbackSubmit = async () => {
    if (!user) {
      onShowToast('Usuário não autenticado.');
      return;
    }
    if (rating === 0 && !comment.trim()) {
      onShowToast('Por favor, deixe uma avaliação ou comentário.');
      return;
    }

    try {
      setIsSubmitting(true);

      const { success, error } = await submitSuggestion({
        rating,
        suggestion: comment,
        userId: (user as any)?.id,
        name: name || undefined,
        email: email || undefined,
        whatsapp: whatsapp || undefined,
      });

      if (!success) {
        const msg = (error || '').toLowerCase();
        if (msg.includes('limite') || msg.includes('rate')) {
          onShowToast('Você atingiu o limite de feedbacks por hora. Tente novamente mais tarde.');
        } else {
          onShowToast('Ocorreu um erro ao enviar seu feedback.');
        }
        return;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        handleCloseAndReset();
      }, 2200);
    } catch {
      onShowToast('Ocorreu um erro ao enviar seu feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    onClose();
    setTimeout(() => {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setIsSubmitted(false);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title="" size="md">
      <div className="text-center">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center p-4 animate-fade-in-up">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white">Obrigado!</h3>
            <p className="text-gray-300 mt-2">Seu feedback nos ajuda a melhorar.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-100">O que tem achado do app?</h3>
            <p className="text-gray-400 mt-2">Sua opinião é muito importante para nós!</p>

            <div className="flex justify-center my-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                  aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                >
                  <StarIcon
                    className={`h-9 w-9 transition-colors duration-200 ${
                      (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    solid={(hoverRating || rating) >= star}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-y"
              placeholder="Tem alguma sugestão de melhoria? Conte para nós!"
              disabled={isSubmitting}
            />

            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>Enviar Feedback</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCloseAndReset}
                className="w-full sm:w-auto text-center text-sm text-gray-400 hover:text-white transition-colors duration-200 py-2"
              >
                Agora não
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
