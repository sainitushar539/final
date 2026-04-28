import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, Users, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  company_name: string;
  industry: string | null;
  credit_score_range: string | null;
  amount_seeking: number | null;
  needs: string[] | null;
  status: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tech-chat`;

const NurtureBotPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('leads').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLeads(data as Lead[]);
    });
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const selectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setMessages([{
      role: 'assistant',
      content: `I'm ready to help you nurture **${lead.contact_name}** from **${lead.company_name}**. Here's what I know:\n\n- **Industry:** ${lead.industry || 'Not specified'}\n- **Credit Range:** ${lead.credit_score_range || 'Not specified'}\n- **Seeking:** ${lead.amount_seeking ? `$${lead.amount_seeking.toLocaleString()}` : 'Not specified'}\n- **Needs:** ${lead.needs?.join(', ') || 'None specified'}\n- **Status:** ${lead.status || 'New'}\n\nWhat would you like me to help with? I can:\n- Draft a personalized follow-up email\n- Create a nurture sequence plan\n- Suggest next steps based on their profile\n- Generate talking points for a call`,
    }]);
  };

  const sendMessage = async (forcedPrompt?: string) => {
    const userMsg = (forcedPrompt || input).trim();
    if (!userMsg || generating) return;
    setInput('');

    const requestMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(requestMessages);
    setGenerating(true);

    try {
      const leadContext = selectedLead
        ? `Lead: ${selectedLead.contact_name} | Company: ${selectedLead.company_name} | Status: ${selectedLead.status || 'new'}`
        : 'No specific lead selected';

      const prompt = `Help with this lead in a short, clear reply.\n${leadContext}\nRequest: ${userMsg.slice(0, 300)}`;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt.slice(0, 1800) }],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        setMessages(prev => [...prev, { role: 'assistant', content: errData.error || 'Something went wrong. Please try again.' }]);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantSoFar = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: 'assistant', content: current }];
              });
            }
          } catch {
            continue;
          }
        }
      }

      if (!assistantSoFar.trim()) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I could not generate a response just now. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setGenerating(false);
    }
  };

  const quickActions = [
    { label: 'Create nurture plan', prompt: 'Create a 4-week nurture sequence plan for this lead with specific touchpoints, messaging themes, and call-to-actions.' },
    { label: 'Suggest next steps', prompt: 'Based on this lead\'s profile and current status, what are the top 3 recommended next steps to move them forward?' },
    { label: 'Call talking points', prompt: 'Generate 5-7 talking points for a phone call with this lead, focusing on their specific needs and pain points.' },
  ];

  return (
    <div className="animate-fade-up flex h-auto min-h-[calc(100vh-140px)] flex-col gap-4 lg:h-[calc(100vh-140px)] lg:flex-row">
      <div className="flex max-h-[42vh] min-h-[260px] w-full flex-col overflow-hidden rounded-xl border border-border bg-card lg:max-h-none lg:min-h-0 lg:w-72 lg:flex-shrink-0">
        <div className="border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[2px] text-primary">Select Lead</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => selectLead(lead)}
              className={`w-full border-none border-b border-border/40 bg-transparent px-4 py-3 text-left transition-all ${
                selectedLead?.id === lead.id ? 'bg-primary/[0.08]' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="text-xs font-bold text-foreground">{lead.contact_name}</div>
              <div className="text-[10px] text-muted-foreground">{lead.company_name}</div>
              <div className="mt-0.5 text-[9px] capitalize text-primary/70">{lead.status || 'new'}</div>
            </button>
          ))}
          {leads.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">No leads yet</div>
          )}
        </div>
      </div>

      <div className="flex min-h-[460px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3">
          <Bot className="h-4 w-4 text-primary" />
          <span className="min-w-0 truncate font-mono text-[9px] font-bold uppercase tracking-[2px] text-primary sm:text-[10px]">
            Nurture Bot {selectedLead ? `- ${selectedLead.contact_name}` : ''}
          </span>
        </div>

        {!selectedLead ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-[240px] text-center">
              <Bot className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-1 text-foreground font-semibold">Select a Lead</h3>
              <p className="text-sm text-muted-foreground">Choose a lead from the list to start crafting personalized outreach</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto border-b border-border/50 px-4 py-2 sm:flex-wrap">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(qa.prompt);
                    void sendMessage(qa.prompt);
                  }}
                  className="shrink-0 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Zap className="mr-1 inline h-3 w-3" />
                  {qa.label}
                </button>
              ))}
            </div>

            <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm sm:max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground [&_p]:text-foreground [&_strong]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {generating && (
                <div className="flex justify-start">
                  <div className="animate-pulse rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:p-4">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about this lead or request content..."
                className="min-w-0 flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
              <button
                onClick={sendMessage}
                disabled={generating || !input.trim()}
                className="flex items-center justify-center rounded-xl border-none bg-primary px-4 py-2.5 text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 sm:w-auto"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NurtureBotPage;
