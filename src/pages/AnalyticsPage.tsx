const weeklyData = [3, 5, 4, 7, 6, 8, 5, 9];
const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const maxVal = Math.max(...weeklyData);

const funnel = [
  { label: 'Total Intakes', value: 47, pct: 100 },
  { label: 'Assessed', value: 40, pct: 85 },
  { label: 'Improving', value: 28, pct: 60 },
  { label: 'Capital Ready', value: 14, pct: 30 },
  { label: 'Funded', value: 9, pct: 19 },
];

const gaps = [
  { label: 'Missing Tax Returns (2yr)', count: '7/10' },
  { label: 'Incomplete Bank Statements', count: '6/10' },
  { label: 'No Operating Agreement', count: '5/10' },
  { label: 'No Use of Funds Statement', count: '8/10' },
  { label: 'Credit Score Below 650', count: '4/10' },
];

const AnalyticsPage = () => {
  return (
    <div className="animate-fade-up grid grid-cols-2 gap-3.5 max-lg:grid-cols-1">
      {/* Bar chart */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">
          Businesses Added Per Week (Last 8 Weeks)
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {weeklyData.map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary/30 to-primary rounded-t-sm cursor-pointer relative group transition-all hover:to-gold-lt"
              style={{ height: `${(v / maxVal) * 100}%` }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {weekLabels.map(l => (
            <span key={l} className="flex-1 text-center text-[8px] text-muted-foreground font-mono">{l}</span>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">
          Fundability Pipeline Funnel
        </div>
        {funnel.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 mb-2">
            <span className="text-[11px] text-muted-foreground w-28 flex-shrink-0">{f.label}</span>
            <div className="flex-1 h-5 bg-foreground/[0.04] rounded-sm overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-gold-lt rounded-sm transition-all duration-1000" style={{ width: `${f.pct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-primary font-mono w-7 text-right">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Revenue metrics */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">
          Revenue Metrics
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '$292K', label: '12-Mo Projection' },
            { value: '$847K', label: 'Capital to Deploy' },
            { value: '19%', label: 'Close Rate' },
            { value: '64', label: 'Avg Score' },
          ].map((m, i) => (
            <div key={i}>
              <div className="font-display text-2xl font-bold text-primary leading-none">{m.value}</div>
              <div className="text-[9px] text-muted-foreground font-mono tracking-[1px] uppercase mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">
          Common Checklist Gaps Across Portfolio
        </div>
        {gaps.map((g, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-border/40 last:border-b-0">
            <span className="text-[11.5px] text-foreground/65">{g.label}</span>
            <span className="text-xs font-bold text-destructive font-mono">{g.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;
