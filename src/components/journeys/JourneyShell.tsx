import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';

interface JourneyShellProps {
  children: ReactNode;
  onBack?: () => void;
}

const JourneyShell = ({ children, onBack }: JourneyShellProps) => (
  <div className="min-h-screen bg-[#0a1628] flex flex-col">
    <nav className="px-6 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">Credibility Suite</span>
      </Link>
      {onBack && (
        <button onClick={onBack} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 bg-transparent border-none cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Change goals
        </button>
      )}
    </nav>
    <div className="flex-1 flex items-start justify-center px-6 pt-2 pb-12">
      <div className="max-w-lg w-full animate-fade-up">
        {children}
      </div>
    </div>
  </div>
);

export default JourneyShell;
