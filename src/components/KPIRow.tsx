import { Building2, CircleDollarSign, FileWarning, Gauge, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { businesses } from '@/data/businesses';

const KPIRow = () => {
  const total = businesses.length;
  const fundable = businesses.filter(b => b.score >= 75).length;
  const gaps = businesses.reduce((acc, b) => acc + b.checklist.filter(c => !c.complete).length, 0);
  const deployed = businesses.filter(b => b.status === 'funded').reduce((a, b) => a + b.capitalNeed, 0);
  const avgScore = Math.round(businesses.reduce((a, b) => a + b.score, 0) / total);

  const kpis = [
    { value: total, label: 'Total Businesses', context: '+6 this month', Icon: Building2, tone: 'text-[#9CA3AF]', stroke: '#9CA3AF', data: [8, 9, 10, 10, 11, 12, total] },
    { value: fundable, label: 'Fundable 75+', context: '3 new this week', Icon: TrendingUp, tone: 'text-[#D4AF37]', stroke: '#D4AF37', data: [1, 1, 2, 2, 3, 4, fundable] },
    { value: gaps, label: 'Critical Doc Gaps', context: 'Blocking capital', Icon: FileWarning, tone: 'text-[#B98D3A]', stroke: '#B98D3A', data: [21, 18, 17, 15, 13, 12, gaps] },
    { value: `$${(deployed / 1000).toFixed(0)}K`, label: 'Capital Deployed', context: 'Revolving fund', Icon: CircleDollarSign, tone: 'text-[#D4AF37]', stroke: '#D4AF37', data: [80, 110, 145, 170, 205, 245, deployed / 1000] },
    { value: avgScore, label: 'Avg Fundability', context: '+9 pts this month', Icon: Gauge, tone: 'text-[#6C8EC7]', stroke: '#6C8EC7', data: [56, 58, 61, 63, 66, 68, avgScore] },
  ];

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map(({ value, label, context, Icon, tone, stroke, data }) => (
        <div
          key={label}
          className="group border border-[#1A2233] border-t-[#D4AF37]/60 bg-[#111827] p-4 transition duration-200 hover:border-[#2A3447]"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">{label}</span>
            <Icon className={`h-4 w-4 opacity-75 ${tone}`} />
          </div>
          <div className="text-3xl font-semibold leading-none tracking-tight text-[#E5E7EB]">{value}</div>
          <div className="mt-3 grid grid-cols-[1fr_72px] items-end gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <span className={`h-1 w-4 ${context.includes('Blocking') ? 'bg-[#D4AF37]' : 'bg-[#3B82F6]'}`} />
              {context}
            </div>
            <div className="h-9">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.map((v, index) => ({ index, value: v }))}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={stroke}
                    strokeWidth={1.6}
                    dot={false}
                    isAnimationActive
                    animationDuration={220}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIRow;
