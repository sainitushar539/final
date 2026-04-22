import { useState } from 'react';
import { Business, getScoreColor } from '@/data/businesses';

interface Props {
  business: Business | null;
  onClose: () => void;
}

const BusinessModal = ({ business, onClose }: Props) => {
  const [notes, setNotes] = useState('');

  if (!business) return null;

  const complete = business.checklist.filter(c => c.complete).length;
  const total = business.checklist.length;
  const pct = Math.round((complete / total) * 100);

  return (
    <div className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center" onClick={onClose}>
      <div className="animate-fade-up bg-card border border-border border-t-[3px] border-t-primary w-[700px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-foreground">{business.name}</h2>
          <button onClick={onClose} className="text-[22px] text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer">×</button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <div className={`font-display text-[60px] font-extrabold ${getScoreColor(business.score)} leading-none`}>
                {business.score}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-[1.5px] font-mono mt-1">Fundability Score</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">{business.industry} · ${business.capitalNeed.toLocaleString()} needed</div>
              <div className="h-2 bg-foreground/5 rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm ${business.score >= 75 ? 'bg-success' : business.score >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">{complete}/{total} checklist items complete ({pct}%)</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-2.5">
              📋 Fundability Checklist
            </div>
            {business.checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border/50 text-xs last:border-b-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                  item.complete
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {item.complete ? '✓' : '✗'}
                </div>
                <span className={item.complete ? 'text-muted-foreground' : 'text-foreground font-semibold'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes for this business..."
            className="w-full bg-foreground/[0.04] border border-border text-foreground font-body text-[13px] p-3 outline-none rounded-sm resize-y min-h-[80px] mt-3 focus:border-primary transition-colors"
          />
          <button className="bg-gradient-to-br from-primary to-gold-lt text-primary-foreground border-none font-body text-[11px] font-extrabold px-5 py-2.5 cursor-pointer tracking-[1.5px] uppercase rounded-sm mt-2 transition-all hover:brightness-110">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;
