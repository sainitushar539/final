import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Mail, Phone, Building2, KeyRound, Copy, Check, Download, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  industry: string | null;
  credit_score_range: string | null;
  amount_seeking: number | null;
  needs: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
  responses: any;
}
interface QuestionnaireResult {
  id: string;
  user_id: string;
  business_id: string | null;
  email: string;
  selected_goals: string[] | null;
  credit_score_range: string | null;
  revenue_range: string | null;
  time_in_business: string | null;
  answers: any;
  score: number;
  diagnosis_summary: string | null;
  roadmap: any;
  questionnaire_completed: boolean;
  completed_at: string;
  updated_at: string;
}
interface RepNote {
  id: string;
  user_id: string;
  lead_id: string | null;
  note: string;
  visibility: 'internal_only' | 'client_visible';
  created_at: string;
}

const leadStatuses = ['new', 'contacted', 'qualified', 'approved', 'funded'];

const statusColors: Record<string, string> = {
  new: 'bg-info/10 text-info border-info/20',
  contacted: 'bg-primary/10 text-primary border-primary/20',
  qualified: 'bg-success/10 text-success border-success/20',
  approved: 'bg-warning/10 text-warning border-warning/20',
  funded: 'bg-success/10 text-success border-success/20',
  unassigned: 'bg-muted text-muted-foreground border-border',
};

const generateLocalApprovalCode = () => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const toInputDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const getQuickRange = (range: 'today' | '7' | '30') => {
  const end = new Date();
  const start = new Date();

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - (range === '7' ? 6 : 29));
    start.setHours(0, 0, 0, 0);
  }

  return {
    start: toInputDate(start),
    end: toInputDate(end),
  };
};

const csvValue = (value: string | number | null | undefined) => {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const getLeadNotes = (lead: Lead) => {
  const responses = lead.responses || {};
  if (typeof responses.notes === 'string') return responses.notes;
  if (typeof responses.message === 'string') return responses.message;
  if (typeof responses.goals === 'string') return responses.goals;
  if (Array.isArray(responses.goals)) return responses.goals.join(', ');
  return '';
};

const LeadsCRMPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateField, setDateField] = useState<'created_at' | 'updated_at'>('created_at');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newLead, setNewLead] = useState({ contact_name: '', email: '', phone: '', company_name: '', industry: '', amount_seeking: '' });
  const [creating, setCreating] = useState(false);
  const [questionnaireResults, setQuestionnaireResults] = useState<QuestionnaireResult[]>([]);
  const [repNotes, setRepNotes] = useState<RepNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'internal_only' | 'client_visible'>('internal_only');
  const [savingNote, setSavingNote] = useState(false);

  const createLead = async () => {
    if (!newLead.contact_name || !newLead.email || !newLead.company_name) {
      toast.error('Name, email, and company are required');
      return;
    }

    setCreating(true);
    const { error } = await supabase.from('leads').insert({
      contact_name: newLead.contact_name,
      email: newLead.email.toLowerCase().trim(),
      phone: newLead.phone || null,
      company_name: newLead.company_name,
      industry: newLead.industry || null,
      amount_seeking: newLead.amount_seeking ? Number(newLead.amount_seeking) : null,
      status: 'new',
    });
    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Lead created');
    setShowNew(false);
    setNewLead({ contact_name: '', email: '', phone: '', company_name: '', industry: '', amount_seeking: '' });
  };

  const generateCode = async (lead: Lead) => {
    setGeneratingCode(true);
    setGeneratedCode(null);
    setCopied(false);
    try {
      const cleanEmail = lead.email.toLowerCase().trim();
      const notes = `${lead.contact_name} - ${lead.company_name}`;
      const { data, error } = await supabase.rpc('generate_approval_code', {
        _email: cleanEmail,
        _notes: notes,
      });

      if (error) {
        if (!user) throw new Error('You must be signed in as an admin to generate access codes.');

        let insertedCode = '';
        let insertError: any = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          const code = generateLocalApprovalCode();
          const { error: fallbackError } = await supabase.from('approval_codes').insert({
            code,
            email: cleanEmail,
            notes,
            created_by: user.id,
          });

          if (!fallbackError) {
            insertedCode = code;
            insertError = null;
            break;
          }

          insertError = fallbackError;
          if (fallbackError.code !== '23505') break;
        }

        if (insertError || !insertedCode) {
          throw new Error(insertError?.message || error.message || 'Failed to generate code');
        }

        setGeneratedCode(insertedCode);
      } else {
        setGeneratedCode(data as string);
      }

      toast.success('Approval code generated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const [{ data }, { data: questionnaires }, { data: notes }] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('questionnaire_results').select('*').order('updated_at', { ascending: false }),
      supabase.from('rep_notes').select('*').order('created_at', { ascending: false }),
    ]);
    if (data) setLeads(data as Lead[]);
    if (questionnaires) setQuestionnaireResults(questionnaires as QuestionnaireResult[]);
    if (notes) setRepNotes(notes as RepNote[]);
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const filtered = leads.filter(lead => {
    const search = searchTerm.trim().toLowerCase();
    const matchSearch = !search ||
      lead.contact_name.toLowerCase().includes(search) ||
      lead.company_name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      (lead.phone || '').toLowerCase().includes(search);
    const matchStatus = selectedStatuses.size === 0 || selectedStatuses.has(lead.status);
    const sourceDate = new Date(lead[dateField]);
    const matchStart = !startDate || sourceDate >= new Date(`${startDate}T00:00:00`);
    const matchEnd = !endDate || sourceDate <= new Date(`${endDate}T23:59:59`);
    return matchSearch && matchStatus && matchStart && matchEnd;
  });

  const statusCounts = leadStatuses.reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const exportLeads = () => {
    if (filtered.length === 0) {
      toast.error('No leads match the current filters');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Business Name', 'Status', 'Created Date', 'Assigned Agent', 'Notes'];
    const rows = filtered.map(lead => [
      lead.contact_name,
      lead.email,
      lead.phone || '',
      lead.company_name,
      lead.status,
      new Date(lead.created_at).toLocaleString(),
      'Unassigned',
      getLeadNotes(lead),
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvValue).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${toInputDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} leads`);
  };

  const getQuestionnaireForLead = (lead: Lead | null) => {
    if (!lead) return null;
    const email = lead.email.toLowerCase().trim();
    return questionnaireResults.find(result => result.email?.toLowerCase().trim() === email) || null;
  };

  const saveRepNote = async () => {
    const questionnaire = getQuestionnaireForLead(selectedLead);
    if (!selectedLead || !questionnaire || !noteText.trim() || !user) {
      toast.error(questionnaire ? 'Write a note first' : 'Client must complete onboarding before notes can attach to their dashboard');
      return;
    }

    setSavingNote(true);
    const { data, error } = await supabase.from('rep_notes').insert({
      user_id: questionnaire.user_id,
      business_id: questionnaire.business_id,
      lead_id: selectedLead.id,
      author_id: user.id,
      note: noteText.trim(),
      visibility: noteVisibility,
    }).select('*').single();
    setSavingNote(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) setRepNotes(prev => [data as RepNote, ...prev]);
    setNoteText('');
    toast.success('Note saved');
  };

  const selectedQuestionnaire = getQuestionnaireForLead(selectedLead);
  const selectedNotes = selectedLead
    ? repNotes.filter(note =>
        note.lead_id === selectedLead.id ||
        (selectedQuestionnaire && note.user_id === selectedQuestionnaire.user_id)
      )
    : [];

  return (
    <div className="animate-fade-up space-y-4">
      <div className="grid grid-cols-5 gap-2 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {leadStatuses.map(status => (
          <button
            key={status}
            onClick={() => toggleStatusFilter(status)}
            className={`bg-card border p-3 text-left cursor-pointer transition-all rounded-lg ${
              selectedStatuses.has(status) ? 'border-primary ring-1 ring-primary/70' : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="text-xl font-bold text-primary font-display">{statusCounts[status] || 0}</div>
            <div className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-mono capitalize">{status}</div>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex gap-3 items-center max-lg:flex-col max-lg:items-stretch">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads by name, company, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border text-foreground text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={exportLeads}
            className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="bg-secondary text-foreground text-xs font-bold px-4 py-2.5 rounded-xl border border-border cursor-pointer flex items-center justify-center gap-1.5 hover:border-primary/40 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>

        <div className="grid grid-cols-[minmax(140px,180px)_1fr] gap-3 max-lg:grid-cols-1">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Date Field</label>
            <select
              value={dateField}
              onChange={e => setDateField(e.target.value as 'created_at' | 'updated_at')}
              className="w-full bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl outline-none focus:border-primary"
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Last Updated Date</option>
            </select>
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 max-md:grid-cols-1">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">End</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-background border border-border text-foreground text-xs px-3 py-2 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end gap-1.5">
              <button onClick={() => applyQuickDate('today')} className="text-[10px] px-2.5 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">Today</button>
              <button onClick={() => applyQuickDate('7')} className="text-[10px] px-2.5 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">7D</button>
              <button onClick={() => applyQuickDate('30')} className="text-[10px] px-2.5 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">30D</button>
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[10px] px-2.5 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">Clear</button>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> Status Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {leadStatuses.map(status => (
              <label key={status} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedStatuses.has(status)}
                  onChange={() => toggleStatusFilter(status)}
                  className="accent-primary"
                />
                <span className="text-[10px] uppercase tracking-[1px] text-foreground font-mono">{status}</span>
              </label>
            ))}
            {selectedStatuses.size > 0 && (
              <button onClick={() => setSelectedStatuses(new Set())} className="text-[10px] px-3 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                Clear Status
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">
            All Leads ({filtered.length})
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[2px] uppercase text-success font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Contact', 'Company', 'Industry', 'Amount', 'Funnel', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="bg-secondary/50 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <div className="text-xs font-bold text-foreground">{lead.contact_name}</div>
                      <div className="text-[10px] text-muted-foreground">{lead.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground/70 border-b border-border/40">{lead.company_name}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground border-b border-border/40">{lead.industry || '-'}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-primary font-mono border-b border-border/40">
                      {lead.amount_seeking ? `$${lead.amount_seeking.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground border-b border-border/40">
                      {lead.credit_score_range || 'Unassigned'}
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusColors[lead.status] || statusColors.unassigned}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground font-mono border-b border-border/40">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-primary text-[10px] font-bold bg-transparent border-none cursor-pointer hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => { setSelectedLead(null); setGeneratedCode(null); setCopied(false); }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedLead.contact_name}</h2>
                <p className="text-sm text-muted-foreground">{selectedLead.company_name}</p>
              </div>
              <button onClick={() => { setSelectedLead(null); setGeneratedCode(null); setCopied(false); }} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer text-lg">x</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${selectedLead.email}`} className="text-primary no-underline">{selectedLead.email}</a>
              </div>
              {selectedLead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedLead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{selectedLead.industry || 'No industry specified'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Credit Score</div>
                  <div className="text-sm font-semibold text-foreground">{selectedLead.credit_score_range || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Amount Seeking</div>
                  <div className="text-sm font-semibold text-primary">{selectedLead.amount_seeking ? `$${selectedLead.amount_seeking.toLocaleString()}` : 'N/A'}</div>
                </div>
              </div>

              {selectedLead.needs && selectedLead.needs.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Needs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.needs.map((need, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{need}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Questionnaire Result</div>
                {selectedQuestionnaire ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-background border border-border rounded-xl p-3">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</div>
                        <div className="text-lg font-bold text-primary">{selectedQuestionnaire.score}</div>
                      </div>
                      <div className="bg-background border border-border rounded-xl p-3">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Revenue</div>
                        <div className="text-xs font-semibold text-foreground">{selectedQuestionnaire.revenue_range || 'N/A'}</div>
                      </div>
                      <div className="bg-background border border-border rounded-xl p-3">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Time</div>
                        <div className="text-xs font-semibold text-foreground">{selectedQuestionnaire.time_in_business || 'N/A'}</div>
                      </div>
                    </div>
                    {selectedQuestionnaire.selected_goals && selectedQuestionnaire.selected_goals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedQuestionnaire.selected_goals.map(goal => (
                          <span key={goal} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{goal}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedQuestionnaire.diagnosis_summary || 'No diagnosis summary saved.'}</p>
                    {selectedQuestionnaire.answers && typeof selectedQuestionnaire.answers === 'object' && (
                      <div className="bg-background border border-border rounded-xl p-3">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Saved Answers</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedQuestionnaire.answers).slice(0, 12).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="text-[11px] text-foreground break-words">{Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      Completed {new Date(selectedQuestionnaire.completed_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No completed questionnaire is tied to this client yet.</p>
                )}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Representative Notes</div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add onboarding or side notes..."
                  className="w-full min-h-20 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-y"
                />
                <div className="flex gap-2 mt-2">
                  <select
                    value={noteVisibility}
                    onChange={e => setNoteVisibility(e.target.value as 'internal_only' | 'client_visible')}
                    className="flex-1 text-xs bg-secondary border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer outline-none"
                  >
                    <option value="internal_only">Internal only</option>
                    <option value="client_visible">Client visible</option>
                  </select>
                  <button
                    onClick={saveRepNote}
                    disabled={savingNote || !selectedQuestionnaire}
                    className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
                {selectedNotes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedNotes.map(note => (
                      <div key={note.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex justify-between gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{note.visibility.replace('_', ' ')}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> Client Portal Access
                </div>
                {generatedCode ? (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-base font-mono font-bold text-foreground tracking-widest">{generatedCode}</code>
                      <button
                        onClick={copyCode}
                        className="text-[10px] font-bold bg-background border border-border rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-primary text-foreground flex items-center gap-1"
                      >
                        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Share this code with <strong>{selectedLead.email}</strong>. They'll use it on the Client Login page to activate their account. Single-use.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => generateCode(selectedLead)}
                    disabled={generatingCode}
                    className="w-full bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-xl border-none cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {generatingCode ? 'Generating...' : 'Approve & Generate Access Code'}
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-border">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Lead Status</label>
                <select
                  value={selectedLead.status}
                  onChange={e => {
                    updateLeadStatus(selectedLead.id, e.target.value);
                    setSelectedLead({ ...selectedLead, status: e.target.value });
                  }}
                  className="w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer outline-none"
                >
                  {leadStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-foreground">Create New Lead</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer text-lg">x</button>
            </div>
            <div className="space-y-3">
              {[
                { k: 'contact_name', label: 'Contact Name *', type: 'text' },
                { k: 'email', label: 'Email *', type: 'email' },
                { k: 'phone', label: 'Phone', type: 'tel' },
                { k: 'company_name', label: 'Company *', type: 'text' },
                { k: 'industry', label: 'Industry', type: 'text' },
                { k: 'amount_seeking', label: 'Amount Seeking ($)', type: 'number' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newLead as any)[f.k]}
                    onChange={e => setNewLead({ ...newLead, [f.k]: e.target.value })}
                    className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={createLead}
                disabled={creating}
                className="w-full bg-primary text-primary-foreground text-sm font-bold py-2.5 rounded-xl border-none cursor-pointer disabled:opacity-50 mt-2 hover:bg-primary/90 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsCRMPage;
