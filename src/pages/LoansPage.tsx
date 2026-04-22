import { businesses, getScoreColor } from '@/data/businesses';

const LoansPage = () => {
  const loanBiz = businesses.filter(b => b.loanProduct && b.status !== 'funded');

  return (
    <div className="animate-fade-up">
      <div className="text-sm text-muted-foreground mb-4">
        Review loan packages for businesses that have reached fundability threshold
      </div>

      <div className="bg-card border border-border">
        <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">
            🏦 Full Loan Approval Queue — All Active Applications
          </span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{loanBiz.length} Awaiting Action</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Business', 'Loan Product', 'Amount Requested', 'Score', 'Package Status', 'Blocking Items', 'Action'].map(h => (
                  <th key={h} className="bg-navy-3 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loanBiz.map(biz => {
                const allComplete = biz.checklist.every(c => c.complete);
                const missing = biz.checklist.filter(c => !c.complete);
                return (
                  <tr key={biz.id} className="hover:bg-foreground/[0.025]">
                    <td className="px-3 py-3 text-xs border-b border-border/40 font-bold text-foreground">{biz.name}</td>
                    <td className="px-3 py-3 text-[11.5px] border-b border-border/40 text-foreground/65">{biz.loanProduct}</td>
                    <td className="px-3 py-3 text-[11.5px] border-b border-border/40 text-primary font-bold">${biz.capitalNeed.toLocaleString()}</td>
                    <td className={`px-3 py-3 text-[11.5px] border-b border-border/40 font-bold ${getScoreColor(biz.score)}`}>{biz.score}/100</td>
                    <td className="px-3 py-3 border-b border-border/40">
                      <span className={`text-[9px] font-bold ${allComplete ? 'text-success' : 'text-destructive'}`}>
                        {allComplete ? 'Complete ✓' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] border-b border-border/40 text-foreground/65">
                      {allComplete ? 'None' : missing.map(m => m.label).join(' · ')}
                    </td>
                    <td className="px-3 py-3 border-b border-border/40">
                      <button className={`text-[10px] font-extrabold tracking-[1px] uppercase px-3 py-1.5 rounded-sm border-none cursor-pointer transition-all hover:brightness-110 ${
                        allComplete
                          ? 'bg-gradient-to-br from-primary to-gold-lt text-primary-foreground'
                          : 'bg-foreground/10 text-muted-foreground'
                      }`}>
                        {allComplete && biz.score >= 80 ? 'SEND TO COMMITTEE →' : allComplete ? 'APPROVE LOAN →' : 'TRACK DOCS →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;
