import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Sparkles, Users, Clock3, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  industry: string | null;
  amount_seeking: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  responses: any;
}

const leadStatuses = ['new', 'contacted', 'qualified', 'approved', 'funded'];
const quickFinderChips = [
  { id: 'new-today', label: 'New Today' },
  { id: 'not-contacted', label: 'Not Contacted' },
  { id: 'follow-up-due', label: 'Follow-up Due' },
  { id: 'high-potential', label: 'High Potential' },
  { id: 'missing-docs', label: 'Missing Documents' },
] as const;

const priorityOf = (lead: Lead) => {
  const amount = lead.amount_seeking || 0;
  if (amount >= 50000 || ['qualified', 'approved', 'funded'].includes(lead.status)) return 'high';
  if (amount >= 25000 || lead.status === 'contacted') return 'medium';
  return 'low';
};

const LeadFinderPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [dateField, setDateField] = useState<'created_at' | 'updated_at'>('created_at');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [quickChip, setQuickChip] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLeads(data as Lead[]);
      setLoading(false);
    });
  }, []);

  const getAgent = (lead: Lead) => {
    const responses = lead.responses || {};
    const agent = responses.assignedAgent || responses.assigned_agent || responses.agent || responses.owner;
    return typeof agent === 'string' && agent.trim() ? agent : 'Unassigned';
  };

  const matched = leads.filter(lead => {
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      lead.contact_name.toLowerCase().includes(search) ||
      lead.company_name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      (lead.phone || '').toLowerCase().includes(search);
    const matchStatus = statusFilters.size === 0 || statusFilters.has(lead.status);
    const sourceDate = new Date(lead[dateField]);
    const matchStart = !startDate || sourceDate >= new Date(`${startDate}T00:00:00`);
    const matchEnd = !endDate || sourceDate <= new Date(`${endDate}T23:59:59`);
    const matchPriority = priority === 'all' || priorityOf(lead) === priority;
    const matchAgent = agentFilter === 'all' || getAgent(lead) === agentFilter;
    const matchChip = !quickChip ||
      (quickChip === 'new-today' && lead.status === 'new' && new Date(lead.created_at).toDateString() === new Date().toDateString()) ||
      (quickChip === 'not-contacted' && lead.status === 'new') ||
      (quickChip === 'follow-up-due' && (lead.status === 'contacted' || lead.status === 'qualified')) ||
      (quickChip === 'high-potential' && priorityOf(lead) === 'high') ||
      (quickChip === 'missing-docs' && String(lead.responses?.documents || '').toLowerCase().includes('missing'));
    return matchSearch && matchStatus && matchStart && matchEnd && matchPriority && matchAgent && matchChip;
  });

  const agents = Array.from(new Set(leads.map(getAgent).filter(a => a !== 'Unassigned'))).sort();

  const toggleStatus = (status: string) => {
    setStatusFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-3 max-md:flex-col">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Lead Finder
            </div>
            <h3 className="mt-1 text-base font-semibold text-foreground">Find and prioritize leads instantly</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
            <Users className="w-3.5 h-3.5" />
            {matched.length} matched
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, business, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border text-foreground text-sm pl-10 pr-4 py-3 rounded-xl outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full appearance-none bg-background border border-border text-foreground text-xs pl-10 pr-3 py-3 rounded-xl outline-none focus:border-primary">
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="w-full appearance-none bg-background border border-border text-foreground text-xs pl-10 pr-3 py-3 rounded-xl outline-none focus:border-primary">
                <option value="all">All Agents</option>
                {agents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
              </select>
            </div>
            <div className="relative">
              <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select value={dateField} onChange={e => setDateField(e.target.value as any)} className="w-full appearance-none bg-background border border-border text-foreground text-xs pl-10 pr-3 py-3 rounded-xl outline-none focus:border-primary">
                <option value="created_at">Created</option>
                <option value="updated_at">Updated</option>
              </select>
            </div>
            <button onClick={() => { setSearchTerm(''); setStatusFilters(new Set()); setPriority('all'); setAgentFilter('all'); setQuickChip(null); setStartDate(''); setEndDate(''); }} className="bg-secondary text-foreground text-xs font-semibold px-3 py-3 rounded-xl border border-border hover:border-primary/40 transition-colors">
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickFinderChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setQuickChip(prev => prev === chip.id ? null : chip.id)}
              className={`text-[10px] font-semibold px-3 py-2 rounded-full border transition-colors ${quickChip === chip.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {leadStatuses.map(status => (
          <button key={status} onClick={() => toggleStatus(status)} className={`bg-card border p-3 text-left cursor-pointer transition-all rounded-lg ${statusFilters.has(status) ? 'border-primary ring-1 ring-primary/70' : 'border-border hover:border-primary/30'}`}>
            <div className="text-xl font-bold text-primary font-display">{leads.filter(lead => lead.status === status).length}</div>
            <div className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-mono capitalize">{status}</div>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">All Leads ({matched.length})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = [
                  ['Name', 'Email', 'Phone', 'Business Name', 'Status', 'Created Date'],
                  ...matched.map(lead => [lead.contact_name, lead.email, lead.phone || '', lead.company_name, lead.status, new Date(lead.created_at).toLocaleString()]),
                ].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lead-finder-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Exported ${matched.length} leads`);
              }}
              className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-2 rounded-lg"
            >
              <Download className="w-3.5 h-3.5 inline-block mr-1" /> Export
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">Loading leads...</div>
        ) : matched.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Contact', 'Company', 'Priority', 'Agent', 'Status', 'Created'].map(h => (
                    <th key={h} className="bg-secondary/50 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matched.map(lead => (
                  <tr key={lead.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <div className="text-xs font-bold text-foreground">{lead.contact_name}</div>
                      <div className="text-[10px] text-muted-foreground">{lead.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground/70 border-b border-border/40">{lead.company_name}</td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${priorityOf(lead) === 'high' ? 'bg-[#FFFAEB] text-[#B45309] border-[#FCD34D]' : priorityOf(lead) === 'medium' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {priorityOf(lead)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-foreground/70 border-b border-border/40">{getAgent(lead)}</td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border bg-info/10 text-info border-info/20">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground font-mono border-b border-border/40">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          Use this page when you want to find or score leads fast. The full CRM stays in its own section.
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-primary font-semibold hover:underline">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LeadFinderPage;
