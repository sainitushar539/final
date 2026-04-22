import { useState, useEffect } from 'react';
import BusinessModal from '@/components/BusinessModal';
import { businesses, Business, getScoreColor, getStatusLabel } from '@/data/businesses';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface DBBusiness {
  id: string;
  name: string;
  industry: string | null;
  score: number;
  status: string;
  capital_need: number | null;
  top_gap: string | null;
  created_at: string;
}

const BusinessesPage = () => {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const { user } = useAuth();
  const [dbBusinesses, setDbBusinesses] = useState<DBBusiness[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', capital_need: '', status: 'assessment', top_gap: '' });

  useEffect(() => {
    supabase.from('businesses').select('id,name,industry,score,status,capital_need,top_gap,created_at').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDbBusinesses(data as DBBusiness[]);
    });
  }, []);

  const createBusiness = async () => {
    if (!form.name) { toast.error('Business name is required'); return; }
    if (!user) { toast.error('You must be signed in'); return; }
    setCreating(true);
    const { error } = await supabase.from('businesses').insert({
      user_id: user.id,
      name: form.name,
      industry: form.industry || null,
      capital_need: form.capital_need ? Number(form.capital_need) : 0,
      status: form.status,
      top_gap: form.top_gap || null,
      score: 0,
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Business created');
    setShowNew(false);
    setForm({ name: '', industry: '', capital_need: '', status: 'assessment', top_gap: '' });
  };

  const stages: { key: Business['status']; label: string }[] = [
    { key: 'assessment', label: 'Assessment' },
    { key: 'improving', label: 'Improving' },
    { key: 'capital-ready', label: 'Capital Ready ✓' },
    { key: 'under-review', label: 'Under Review' },
    { key: 'funded', label: 'Funded ✓' },
  ];

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {dbBusinesses.length + businesses.length} businesses tracked · Click any business to view checklist
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-bold px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> New Business
        </button>
      </div>

      {/* Live businesses from DB */}
      {dbBusinesses.length > 0 && (
        <div className="bg-card border border-border mb-4 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Your Businesses ({dbBusinesses.length})
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[2px] uppercase text-success font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Business', 'Industry', 'Score', 'Status', 'Capital Need', 'Created'].map(h => (
                    <th key={h} className="bg-secondary/50 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbBusinesses.map(b => (
                  <tr key={b.id} className="hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-xs font-bold text-foreground border-b border-border/40">{b.name}</td>
                    <td className="px-3 py-2.5 text-[11.5px] text-foreground/65 border-b border-border/40">{b.industry || '—'}</td>
                    <td className={`px-3 py-2.5 text-[11.5px] font-bold border-b border-border/40 ${getScoreColor(b.score)}`}>{b.score}</td>
                    <td className="px-3 py-2.5 text-[10px] uppercase text-muted-foreground border-b border-border/40">{b.status}</td>
                    <td className="px-3 py-2.5 text-[11.5px] text-foreground/65 border-b border-border/40">${(b.capital_need || 0).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground font-mono border-b border-border/40">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Full Table */}
      <div className="bg-card border border-border mb-4">
        <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">
            📋 Full Portfolio — Fundability & Checklist Status
          </span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{businesses.length} Businesses</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Business', 'Industry', 'Score', 'Status', 'Checklist', 'Top Blocking Gap', 'Capital Need', 'Action'].map(h => (
                  <th key={h} className="bg-navy-3 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.map(biz => {
                const st = getStatusLabel(biz.status);
                const done = biz.checklist.filter(c => c.complete).length;
                const pct = Math.round((done / biz.checklist.length) * 100);
                return (
                  <tr key={biz.id} className="hover:bg-foreground/[0.025] cursor-pointer" onClick={() => setSelectedBiz(biz)}>
                    <td className="px-3 py-2.5 text-xs border-b border-border/40 font-bold text-foreground">{biz.name}</td>
                    <td className="px-3 py-2.5 text-[11.5px] border-b border-border/40 text-foreground/65">{biz.industry}</td>
                    <td className={`px-3 py-2.5 text-[11.5px] border-b border-border/40 font-bold ${getScoreColor(biz.score)}`}>{biz.score}</td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-[0.5px] ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-foreground/5 rounded-sm overflow-hidden">
                          <div className={`h-full rounded-sm ${pct >= 90 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[11.5px] border-b border-border/40 text-foreground/65">{biz.topGap}</td>
                    <td className="px-3 py-2.5 text-[11.5px] border-b border-border/40 text-foreground/65">${biz.capitalNeed.toLocaleString()}</td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className="text-primary text-[10px] font-bold cursor-pointer hover:text-gold-lt transition-colors">View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline cards by stage */}
      <div className="text-xs text-muted-foreground mb-3">
        Businesses sorted by fundability stage — click any card to view their checklist and gaps
      </div>
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
                      <div className="text-[10px] text-muted-foreground mb-1.5">
                        {biz.industry} · Score: {biz.score}
                      </div>
                      {missing.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {missing.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[8px] font-bold px-1 py-0.5 bg-destructive/10 text-destructive rounded-full border border-destructive/30">
                              {m.label.length > 16 ? m.label.slice(0, 14) + '…' : m.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-success font-bold">All docs complete ✓</span>
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

      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-foreground">Create New Business</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Business Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Industry</label>
                <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Capital Need ($)</label>
                <input type="number" value={form.capital_need} onChange={e => setForm({ ...form, capital_need: e.target.value })} className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none">
                  {['assessment', 'improving', 'capital-ready', 'under-review', 'funded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Top Blocking Gap</label>
                <input value={form.top_gap} onChange={e => setForm({ ...form, top_gap: e.target.value })} className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary" />
              </div>
              <button onClick={createBusiness} disabled={creating} className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-sm font-bold py-2.5 rounded-xl border-none cursor-pointer disabled:opacity-50 mt-2">
                {creating ? 'Creating...' : 'Create Business'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessesPage;
