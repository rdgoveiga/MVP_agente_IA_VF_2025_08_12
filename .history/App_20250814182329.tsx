// App.tsx (raiz)
import React, { useState } from 'react';
import { ProspectingTool } from './components/SourceLink';
import {
  BrainCircuitIcon,
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
} from './components/icons';
import { SignUpPage } from './components/auth/SignUpPage';
import { LoginPage } from './components/auth/LoginPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';

// IMPORTS corretos (contexts na raiz, página de reset dentro de src)
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import ResetPasswordPage from './src/pages/ResetPasswordPage';

type Page = 'landing' | 'signup' | 'login' | 'forgot-password' | 'reset-password';

export const APP_VERSION = '2.3.0';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/80 transform hover:-translate-y-1 transition-transform duration-300 backdrop-blur-sm flex flex-col">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
    </div>
    <p className="text-gray-400 leading-relaxed flex-grow">{description}</p>
  </div>
);

const LandingPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <div className="min-h-screen text-white bg-grid-pattern">
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in-up"
      style={{ animationDuration: '0.8s' }}
    >
      <header className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text mt-12">
          Agente de Prospecção IA
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-300">
          Pare de procurar clientes manualmente. Encontre leads qualificados, analise sua presença digital e crie
          mensagens de contato que convertem, tudo com o poder da IA.
        </p>
        <div className="mt-10">
          <button
            onClick={() => onNavigate('signup')}
            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 text-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <span>Começar Agora</span>
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-100">Uma ferramenta, múltiplos superpoderes</h2>
          <p className="mt-2 text-gray-400">Transforme sua prospecção com funcionalidades inteligentes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<SearchIcon className="h-6 w-6 text-blue-300" />}
            title="Prospecção Global Inteligente"
            description="Encontre leads qualificados no Brasil e no mundo, prospectando por múltiplos canais como Google e Instagram, para fechar contratos em Real, Dólar e/ ou Euro."
          />
          <FeatureCard
            icon={<BrainCircuitIcon className="h-6 w-6 text-blue-300" />}
            title="Análise Completa com Direcionamento"
            description="Receba uma auditoria profunda sobre cada lead, com insights estratégicos e recomendações práticas de próximos passos para avançar no funil."
          />
          <FeatureCard
            icon={<SparklesIcon className="h-6 w-6 text-blue-300" />}
            title="Mensagens que Convertem"
            description="Obtenha sequências prontas de mensagens personalizadas: saudação, conexão com a dor e fechamento, criadas pela IA com base no lead e no seu perfil profissional."
          />
          <FeatureCard
            icon={<UserGroupIcon className="h-6 w-6 text-blue-300" />}
            title="Gestão de Leads Simplificada"
            description="Organize contatos em uma base nativa estilo Kanban, acompanhe o ciclo de cada prospect e tenha clareza total sobre onde atuar."
          />
          <FeatureCard
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-300" />}
            title="Quebra de Objeções em Tempo Real"
            description="Cole a conversa com o prospect e receba respostas práticas da IA para contornar objeções e transformar oportunidades em contratos."
          />
          <FeatureCard
            icon={<TagIcon className="h-6 w-6 text-blue-300" />}
            title="Insights Estratégicos para Abordagem"
            description="Descubra os pontos fortes e fracos da presença digital do lead e use essas informações para criar uma abordagem muito mais persuasiva."
          />
        </div>
      </main>

      <footer className="text-center mt-24 py-6 border-t border-gray-800">
        <p className="text-gray-500">Agente de Prospecção IA - Versão {APP_VERSION}</p>
      </footer>
    </div>
  </div>
);

// “Router” por estado
function AuthFlow({ page, navigate }: { page: Page; navigate: (p: Page) => void }) {
  switch (page) {
    case 'signup':
      return <SignUpPage onNavigate={navigate} />;
    case 'login':
      return <LoginPage onNavigate={navigate} />;
    case 'forgot-password':
      return <ForgotPasswordPage onNavigate={navigate} />;
    case 'reset-password':
      return <ResetPasswordPage onNavigate={navigate} />;
    default:
      return <LandingPage onNavigate={navigate} />;
  }
}

// Prioriza reset-password mesmo com sessão temporária de recovery
function AppContent({ page, navigate }: { page: Page; navigate: (p: Page) => void }) {
  const { session, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center text-white text-xl gap-4">
        <BrainCircuitIcon className="h-12 w-12 text-blue-400 animate-pulse" />
        <span>Carregando sua sessão...</span>
      </div>
    );
  }

  if (page === 'reset-password') {
    return <AuthFlow page={page} navigate={navigate} />;
  }

  return session ? <ProspectingTool /> : <AuthFlow page={page} navigate={navigate} />;
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('landing');
  const navigate = (p: Page) => setPage(p);

  return (
    <ApiKeyProvider>
      {/* passa navigate p/ AuthProvider (necessário para PASSWORD_RECOVERY) */}
      <AuthProvider navigate={navigate}>
        <AppContent page={page} navigate={navigate} />
      </AuthProvider>
    </ApiKeyProvider>
  );
};

export default App;
