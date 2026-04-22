import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const LandingFooter = () => (
  <footer className="border-t border-border bg-muted/30">
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center text-sm font-bold text-white rounded-lg">
            <Brain className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-foreground">Credibility Suite</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>Credibility Suite · Atlanta, GA</span>
          <span className="hidden md:inline text-border">·</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors no-underline text-muted-foreground">Privacy Policy</Link>
          <span className="text-border">·</span>
          <Link to="/about" className="hover:text-foreground transition-colors no-underline text-muted-foreground">About</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
