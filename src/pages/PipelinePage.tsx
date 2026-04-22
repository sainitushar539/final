import { useState } from 'react';
import BusinessModal from '@/components/BusinessModal';
import { businesses, Business } from '@/data/businesses';

const stages: { key: Business['status']; label: string }[] = [
  { key: 'assessment', label: 'Assessment' },
  { key: 'improving', label: 'Improving' },
  { key: 'capital-ready', label: 'Capital Ready' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'funded', label: 'Funded' },
];

const PipelinePage = () => {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-5 gap-3 max-lg:grid-cols-2">
        {stages.map(stage => {
          const items = businesses.filter(b => b.status === stage.key);
          return (
            <div key={stage.key} className="bg-card border border-border">
              <div className="px-3 py-2.5 bg-background border-b border-border flex justify-between items-center">
                <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-muted-foreground font-mono">{stage.label}</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="p-2 min-h-[180px] flex flex-col gap-2">
                {items.map(biz => {
                  const missing = biz.checklist.filter(c => !c.complete);
                  return (
                    <div
                      key={biz.id}
                      className={`bg-navy-3 border border-border p-2.5 rounded-sm cursor-pointer transition-all hover:border-primary/30 border-l-[3px] ${
                        biz.score >= 75 ? 'border-l-success' : biz.score >= 50 ? 'border-l-warning' : 'border-l-destructive'
                      }`}
                      onClick={() => setSelectedBiz(biz)}
                    >
                      <div className="text-[11.5px] font-bold text-foreground mb-0.5">{biz.name}</div>
                      <div className="text-[10px] text-muted-foreground mb-1.5">{biz.industry} · Score: {biz.score}</div>
                      {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {missing.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[8px] font-bold px-1 py-0.5 bg-destructive/10 text-destructive rounded-full border border-destructive/30">
                              {m.label.length > 18 ? m.label.slice(0, 16) + '…' : m.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-success font-bold">Complete ✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <BusinessModal business={selectedBiz} onClose={() => setSelectedBiz(null)} />
    </div>
  );
};

export default PipelinePage;
