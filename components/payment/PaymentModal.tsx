import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BrainCircuitIcon, CheckCircleIcon, FireIcon, ShieldCheckIcon } from '../icons';

export const PaymentModal: React.FC = () => {
    const { updateUserPlan, loading } = useAuth();
    const slotsTotal = 50;
    const slotsTaken = 33; // Simulando
    const slotsLeft = slotsTotal - slotsTaken;
    const progressPercentage = (slotsTaken / slotsTotal) * 100;

    const handlePurchase = async () => {
        await updateUserPlan('lifetime');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[10000]" aria-modal="true" role="dialog">
            <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-4xl mx-4 animate-fade-in-up" style={{ animationDuration: '0.5s' }}>
                <header className="text-center mb-6">
                    <BrainCircuitIcon className="h-10 w-10 mx-auto text-blue-400 mb-3" />
                    <h1 className="text-3xl font-bold text-gray-100">Desbloqueie seu Acesso Total</h1>
                    <p className="mt-2 text-lg text-gray-400">Escolha o plano que vai transformar sua prospecção.</p>
                </header>

                <div className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 rounded-lg p-3 text-center mb-6 flex items-center justify-center gap-3">
                    <FireIcon className="h-5 w-5" />
                    <p className="font-semibold text-sm sm:text-base">APROVEITE: O plano vitalício está disponível por tempo limitado para os primeiros 50 usuários.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Plano Vitalício - Destaque */}
                    <div className="relative bg-gray-900/50 p-6 rounded-xl border-2 border-transparent bg-clip-padding" style={{ backgroundImage: 'linear-gradient(rgb(17, 24, 39), rgb(17, 24, 39)), linear-gradient(90deg, #3b82f6, #06b6d4)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
                        <div className="absolute top-0 right-4 -mt-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">Oferta de Lançamento</div>
                        <h2 className="text-2xl font-bold text-blue-300">Plano Vitalício</h2>
                        <p className="text-gray-400 mt-1">Acesso para sempre. Pague uma vez.</p>

                        <div className="my-6">
                            <span className="text-5xl font-extrabold text-white">R$79</span>
                            <span className="ml-2 text-xl font-medium text-gray-400 line-through">R$158</span>
                            <span className="block text-sm text-gray-400">Pagamento único</span>
                        </div>
                        
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-400" /><span>Prospecções **ilimitadas**</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-400" /><span>Análises com IA</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-400" /><span>Gerador de mensagens</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-400" /><span>Base de dados Kanban</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-400" /><span>Todas as futuras atualizações</span></li>
                        </ul>
                        
                         <div className="mt-6">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-center text-sm text-yellow-300 mt-2 font-medium">Restam apenas {slotsLeft} vagas nesta oferta!</p>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="w-full mt-6 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:bg-gray-700 disabled:cursor-wait"
                        >
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <ShieldCheckIcon className="h-6 w-6" />}
                            <span>{loading ? 'Processando...' : 'Garantir Acesso Vitalício'}</span>
                        </button>
                    </div>

                    {/* Plano Mensal - Desativado */}
                     <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 opacity-60">
                        <h2 className="text-2xl font-bold text-gray-400">Plano Mensal</h2>
                        <p className="text-gray-500 mt-1">Flexibilidade total.</p>

                        <div className="my-6">
                            <span className="text-5xl font-extrabold text-gray-500">R$89</span>
                            <span className="block text-sm text-gray-500">Por mês</span>
                        </div>
                        
                        <ul className="space-y-2 text-gray-500 text-sm">
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" /><span>Prospecções **ilimitadas**</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" /><span>Análises com IA</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" /><span>Gerador de mensagens</span></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5" /><span>Base de dados Kanban</span></li>
                        </ul>
                        
                        <button
                            disabled
                            className="w-full mt-6 bg-gray-700 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                        >
                            Em Breve
                        </button>
                    </div>
                </div>
                 <footer className="text-center mt-6">
                    <p className="text-xs text-gray-500">O pagamento é processado de forma segura através do Stripe (ambiente de teste). Nenhum dado de cartão real é necessário.</p>
                </footer>
            </div>
        </div>
    );
};
