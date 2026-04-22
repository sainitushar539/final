import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, Clock, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  company_name: string;
  status: string;
}

const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome / Initial Outreach',
    subject: 'Welcome to Credibility Suite — Let\'s Build Your Fundability',
    body: `Hi {{name}},\n\nThank you for your interest in Credibility Suite! I'm Maurice Stewart, and I help businesses like {{company}} become capital-ready.\n\nBased on your profile, I'd love to schedule a quick 15-minute call to discuss your funding goals and how our AI-powered platform can help you get there faster.\n\nWould you be available this week?\n\nBest regards,\nMaurice Stewart\nCredibility Suite`,
  },
  {
    id: 'followup',
    name: 'Follow-Up',
    subject: 'Following Up — Your Path to Business Funding',
    body: `Hi {{name}},\n\nI wanted to follow up on our previous conversation about {{company}}'s funding needs.\n\nOur AI agents have been analyzing similar businesses in your industry, and I'd love to share some insights that could help accelerate your fundability score.\n\nAre you available for a quick chat this week?\n\nBest,\nMaurice Stewart`,
  },
  {
    id: 'nurture',
    name: 'Nurture / Value Add',
    subject: '3 Steps to Improve Your Business Fundability Score',
    body: `Hi {{name}},\n\nI wanted to share 3 quick wins that businesses like {{company}} can implement right away:\n\n1. Ensure your business bank statements show consistent revenue for the past 6 months\n2. Update your business credit profile with all three bureaus\n3. Organize your tax returns and P&L statements in one place\n\nOur platform automates the tracking of all these items. Want me to walk you through it?\n\nBest,\nMaurice Stewart`,
  },
  {
    id: 'closing',
    name: 'Closing / Next Steps',
    subject: 'Ready to Move Forward? Your Funding Roadmap is Ready',
    body: `Hi {{name}},\n\nGreat news — based on our assessment, {{company}} is showing strong potential for capital access.\n\nHere's what I recommend as next steps:\n\n1. Complete your fundability checklist (we're at 70%+)\n2. Schedule a review call to finalize your funding strategy\n3. Get matched with the right capital products\n\nLet's make this happen. Reply to this email or book a call at your convenience.\n\nMaurice Stewart`,
  },
];

const CRMEmailPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [customSubject, setCustomSubject] = useState(emailTemplates[0].subject);
  const [customBody, setCustomBody] = useState(emailTemplates[0].body);
  const [sentLog, setSentLog] = useState<{ email: string; time: string; template: string; status: string }[]>([]);

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLeads(data as Lead[]);
    });
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const t = emailTemplates.find(t => t.id === templateId)!;
    setSelectedTemplate(t);
    setCustomSubject(t.subject);
    setCustomBody(t.body);
  };

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  const personalizeBody = (body: string, lead: Lead) => {
    return body.replace(/\{\{name\}\}/g, lead.contact_name).replace(/\{\{company\}\}/g, lead.company_name);
  };

  const personalizeSubject = (subject: string, lead: Lead) => {
    return subject.replace(/\{\{name\}\}/g, lead.contact_name).replace(/\{\{company\}\}/g, lead.company_name);
  };

  const copyDraft = async () => {
    if (selectedLeads.size === 0) return;
    const firstLead = leads.find(l => selectedLeads.has(l.id));
    if (!firstLead) return;

    const subject = personalizeSubject(customSubject, firstLead);
    const body = personalizeBody(customBody, firstLead);
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);

    setSentLog(prev => [
      {
        email: firstLead.email,
        time: new Date().toLocaleTimeString(),
        template: selectedTemplate.name,
        status: 'ready',
      },
      ...prev,
    ]);

    toast.success('Draft copied');
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div className="grid grid-cols-[1fr_1fr] gap-4 max-lg:grid-cols-1">
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col max-h-[500px]">
          <div className="px-4 py-3 bg-background border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">Recipients</span>
            </div>
            <button
              onClick={selectAll}
              className="text-[10px] text-primary font-semibold bg-transparent border-none cursor-pointer hover:underline"
            >
              {selectedLeads.size === leads.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {leads.map(lead => (
              <label key={lead.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 cursor-pointer hover:bg-secondary/30 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedLeads.has(lead.id)}
                  onChange={() => toggleLead(lead.id)}
                  className="accent-[hsl(var(--primary))] w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{lead.contact_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{lead.email}</div>
                </div>
                <span className="text-[9px] capitalize px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{lead.status || 'new'}</span>
              </label>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border bg-background">
            <span className="text-[10px] text-muted-foreground">{selectedLeads.size} selected</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-background border-b border-border flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">Compose Email</span>
          </div>
          <div className="p-4 space-y-3 flex-1">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Template</label>
              <select
                value={selectedTemplate.id}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                {emailTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Subject</label>
              <input
                type="text"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Body</label>
              <textarea
                value={customBody}
                onChange={e => setCustomBody(e.target.value)}
                rows={10}
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary transition-colors resize-none"
              />
              <p className="text-[9px] text-muted-foreground mt-1">Use {'{{name}}'} and {'{{company}}'} for personalization</p>
            </div>
            <button
              onClick={copyDraft}
              disabled={selectedLeads.size === 0}
              className="w-full bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white text-sm font-semibold py-3 rounded-xl border-none cursor-pointer disabled:opacity-50 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {`Copy draft for ${selectedLeads.size} Lead${selectedLeads.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-background border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">Recent Draft Activity</span>
        </div>
        {sentLog.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">No drafts copied this session</div>
        ) : (
          <div className="divide-y divide-border/40">
            {sentLog.map((log, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-foreground font-medium">{log.email}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">— {log.template}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMEmailPage;
