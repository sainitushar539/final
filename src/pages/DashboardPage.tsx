import { useState } from 'react';
import KPIRow from '@/components/KPIRow';
import BusinessModal from '@/components/BusinessModal';
import { businesses, Business, getScoreColor, getStatusLabel } from '@/data/businesses';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  onNavigate: (page: string) => void;
}

const DashboardPage = ({ onNavigate }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

  const loanQueue = businesses.filter(b => ['capital-ready', 'improving'].includes(b.status) && b.loanProduct);

  const deploymentTrend = [
    { period: 'Jan', capital: 120000 },
    { period: 'Feb', capital: 148000 },
    { period: 'Mar', capital: 176000 },
    { period: 'Apr', capital: 210000 },
    { period: 'May', capital: 238000 },
    { period: 'Jun', capital: 282000 },
    { period: 'Jul', capital: 316000 },
    { period: 'Aug', capital: 354000 },
  ];

  const pipelineDistribution = [
    { stage: 'New Leads', value: 42, active: false },
    { stage: 'Contacted', value: 31, active: false },
    { stage: 'Qualified', value: 18, active: true },
    { stage: 'Funded', value: 9, active: false },
  ];

  const funnelData = [
    { stage: 'Leads', value: 100 },
    { stage: 'Reviewed', value: 62 },
    { stage: 'Approved', value: 34 },
    { stage: 'Funded', value: 18 },
  ];

  const riskTrend = [
    { period: 'W1', missingDocs: 24, risk: 68 },
    { period: 'W2', missingDocs: 22, risk: 64 },
    { period: 'W3', missingDocs: 18, risk: 59 },
    { period: 'W4', missingDocs: 16, risk: 55 },
    { period: 'W5', missingDocs: 13, risk: 49 },
    { period: 'W6', missingDocs: 11, risk: 44 },
  ];

  const chartText = { color: '#9CA3AF', fontSize: 11 };
  const gold = '#D4AF37';
  const blue = '#5F7FB8';

  const formatCurrency = (value: number) => `$${Math.round(value / 1000)}K`;

  const ChartCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <section className={`border border-[#1A2233] bg-[#111827] p-4 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5E7EB]">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-[#9CA3AF]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );

  const MinimalTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="border border-[#1A2233] bg-[#0B0F19] px-3 py-2 text-xs text-[#E5E7EB]">
        <div className="mb-1 font-semibold text-[#D4AF37]">{label}</div>
        {payload.map((item: any) => (
          <div key={item.dataKey} className="flex gap-2 text-[#9CA3AF]">
            <span>{item.name || item.dataKey}</span>
            <span className="font-mono text-[#E5E7EB]">
              {item.dataKey === 'capital' ? formatCurrency(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-up space-y-4">
      {/* Alert */}
      <div className="bg-primary/[0.06] border border-primary/15 rounded-xl px-4 py-3 text-xs text-foreground/70 leading-relaxed">
        <strong className="text-primary">⚡ 3 Actions Required:</strong>{' '}
        <span className="hidden sm:inline">Williams Catering reached score 78 — ready for capital approval. Park Tech Solutions loan package is complete. Johnson & Sons is missing 2 documents.</span>
        <span className="sm:hidden">Williams Catering ready for approval. 2 more items need attention.</span>
      </div>

      <KPIRow />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Fund Deployment Trend"
          subtitle="Capital deployed across active funding cycles"
          className="xl:col-span-2"
        >
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deploymentTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1A2233" strokeOpacity={0.8} vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={chartText} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={chartText} tickFormatter={formatCurrency} width={52} />
                <Tooltip content={<MinimalTooltip />} cursor={{ stroke: '#D4AF37', strokeOpacity: 0.18 }} />
                <Line
                  name="Capital"
                  type="monotone"
                  dataKey="capital"
                  stroke={gold}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: gold, stroke: '#0B0F19', strokeWidth: 2 }}
                  animationDuration={260}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Lead Pipeline Distribution" subtitle="Current stage density">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineDistribution} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 0 }}>
                <CartesianGrid stroke="#1A2233" strokeOpacity={0.65} horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={chartText} />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={chartText} width={82} />
                <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} animationDuration={220}>
                  {pipelineDistribution.map((entry) => (
                    <Cell key={entry.stage} fill={entry.active ? gold : blue} fillOpacity={entry.active ? 0.9 : 0.48} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Funding Conversion Funnel" subtitle="Leads to funded capital">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1A2233" strokeOpacity={0.65} vertical={false} />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={chartText} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={chartText} />
                <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={34} animationDuration={220}>
                  {funnelData.map((entry, index) => (
                    <Cell key={entry.stage} fill={index === funnelData.length - 1 ? gold : blue} fillOpacity={0.85 - index * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Risk / Doc Gap Analysis"
          subtitle="Missing documents and portfolio risk trend"
          className="xl:col-span-2"
        >
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1A2233" strokeOpacity={0.65} vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={chartText} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={chartText} width={36} />
                <Tooltip content={<MinimalTooltip />} cursor={{ stroke: '#D4AF37', strokeOpacity: 0.16 }} />
                <Area
                  name="Missing Docs"
                  type="monotone"
                  dataKey="missingDocs"
                  stroke="#B98D3A"
                  fill="#B98D3A"
                  fillOpacity={0.12}
                  strokeWidth={1.7}
                  animationDuration={240}
                />
                <Area
                  name="Risk Score"
                  type="monotone"
                  dataKey="risk"
                  stroke="#8A4A4A"
                  fill="#8A4A4A"
                  fillOpacity={0.08}
                  strokeWidth={1.7}
                  animationDuration={240}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {!loaded && (
        <div className="flex justify-center py-6">
          <button onClick={() => setLoaded(true)} className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white border-none text-xs font-bold px-6 py-3 cursor-pointer rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5">
            ▶ Load Portfolio Data
          </button>
        </div>
      )}

      {loaded && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Portfolio Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-primary">📋 Business Portfolio</span>
                <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => onNavigate('businesses')}>
                  View All →
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      {['Business', 'Industry', 'Score', 'Status', 'Gap', 'Capital', ''].map(h => (
                        <th key={h} className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-border bg-muted/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.filter(b => b.status !== 'funded').map(biz => {
                      const st = getStatusLabel(biz.status);
                      return (
                        <tr key={biz.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedBiz(biz)}>
                          <td className="px-3 py-2.5 text-xs border-b border-border/40 font-semibold text-foreground">{biz.name}</td>
                          <td className="px-3 py-2.5 text-xs border-b border-border/40 text-muted-foreground">{biz.industry}</td>
                          <td className={`px-3 py-2.5 text-xs border-b border-border/40 font-bold ${getScoreColor(biz.score)}`}>{biz.score}</td>
                          <td className="px-3 py-2.5 border-b border-border/40">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          </td>
                          <td className="px-3 py-2.5 text-xs border-b border-border/40 text-muted-foreground truncate max-w-[120px]">{biz.topGap}</td>
                          <td className="px-3 py-2.5 text-xs border-b border-border/40 text-muted-foreground">${biz.capitalNeed.toLocaleString()}</td>
                          <td className="px-3 py-2.5 border-b border-border/40">
                            <span className="text-primary text-xs font-semibold cursor-pointer hover:underline">View</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-bold text-primary">✅ Checklist Tracker</span>
              </div>
              {businesses.filter(b => b.status !== 'funded').slice(0, 5).map(biz => {
                const done = biz.checklist.filter(c => c.complete).length;
                const pct = Math.round((done / biz.checklist.length) * 100);
                const missing = biz.checklist.filter(c => !c.complete);
                return (
                  <div key={biz.id} className="px-4 py-3 border-b border-border/40 last:border-b-0 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setSelectedBiz(biz)}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{biz.name}</span>
                      <span className={`text-[10px] font-bold ${getScoreColor(biz.score)}`}>{biz.score}/100</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-[hsl(var(--success))]' : pct >= 60 ? 'bg-[hsl(var(--warning))]' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${pct >= 90 ? 'text-[hsl(var(--success))]' : pct >= 60 ? 'text-[hsl(var(--warning))]' : 'text-destructive'}`}>{pct}%</span>
                    </div>
                    {missing.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {missing.slice(0, 3).map((m, i) => (
                          <span key={i} className="text-[9px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">✗ {m.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Loan Queue */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-primary">🏦 Loan Queue</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 Pending</span>
              </div>
              {loanQueue.map(biz => (
                <div key={biz.id} className="px-4 py-3 border-b border-border/40 last:border-b-0">
                  <div className="text-xs font-semibold text-foreground mb-0.5">{biz.name}</div>
                  <div className="text-[10px] text-muted-foreground mb-1">{biz.loanProduct} · Score: {biz.score}</div>
                  <div className="text-lg font-bold text-primary leading-none mb-1.5">${biz.capitalNeed.toLocaleString()}</div>
                  <div className="h-1.5 bg-muted rounded-full mb-1.5">
                    <div className={`h-full rounded-full ${biz.score >= 75 ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--warning))]'}`} style={{ width: `${biz.score}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{biz.score >= 75 ? 'Package: Complete ✓' : 'Missing docs'}</span>
                    <span className={`font-bold ${biz.score >= 75 ? 'text-[hsl(var(--success))]' : 'text-primary'}`}>
                      {biz.score >= 75 ? 'APPROVE →' : 'TRACK →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-bold text-primary">💰 Revenue — This Month</span>
              </div>
              {[
                { label: 'Origination Fees', value: '$12,400' },
                { label: 'SaaS Commissions', value: '$3,200' },
                { label: 'Assistance Fees', value: '$6,800' },
                { label: 'Referral Fees', value: '$2,050' },
              ].map((r, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-border/30 flex justify-between items-center last:border-b-0">
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <span className="text-xs font-bold text-primary font-mono">{r.value}</span>
                </div>
              ))}
              <div className="px-4 py-2.5 border-t-2 border-primary/20 flex justify-between items-center bg-primary/[0.03]">
                <span className="text-xs font-bold text-foreground">Total Revenue</span>
                <span className="text-sm font-bold text-primary font-mono">$24,450</span>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-primary">⚡ Activity</span>
                <span className="text-[9px] text-[hsl(var(--success))] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--success))] rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              {[
                { text: 'Williams Catering scored 78 — capital ready', time: '4m', color: 'bg-[hsl(var(--success))]' },
                { text: 'Missing operating agreement for Johnson & Sons', time: '9m', color: 'bg-destructive' },
                { text: 'Sunrise Daycare score improved 64→71', time: '22m', color: 'bg-primary' },
                { text: '3 intake forms submitted overnight', time: '6h', color: 'bg-muted-foreground' },
              ].map((a, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-border/30 flex gap-2.5 last:border-b-0">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.color}`} />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground/65 leading-relaxed">{a.text}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{a.time} ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BusinessModal business={selectedBiz} onClose={() => setSelectedBiz(null)} />
    </div>
  );
};

export default DashboardPage;
