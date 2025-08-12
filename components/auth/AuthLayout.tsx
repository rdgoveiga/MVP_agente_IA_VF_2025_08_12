
import React from 'react';
import { BrainCircuitIcon } from '../icons';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      // Recarrega a página para voltar à tela inicial (landing page)
      window.location.assign(window.location.origin);
  };
  
  return (
    <div className="min-h-screen text-white bg-grid-pattern flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto animate-fade-in-up" style={{animationDuration: '0.5s'}}>
        <header className="text-center mb-8">
          <a href="/" onClick={handleLogoClick} className="inline-block" aria-label="Voltar para a página inicial">
            <BrainCircuitIcon className="h-12 w-12 mx-auto text-blue-400 mb-4" />
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            {title}
          </h1>
          <p className="mt-3 text-lg text-gray-400">{subtitle}</p>
        </header>
        <main className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {children}
        </main>
      </div>
    </div>
  );
};
