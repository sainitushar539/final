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
    <div className="animate-fade-up flex gap-4 h-[calc(100vh-140px)]">
      <div className="w-72 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-background border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">Select Lead</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => selectLead(lead)}
              className={`w-full text-left px-4 py-3 border-b border-border/40 cursor-pointer transition-all bg-transparent border-none ${
                selectedLead?.id === lead.id ? 'bg-primary/[0.08]' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="text-xs font-bold text-foreground">{lead.contact_name}</div>
              <div className="text-[10px] text-muted-foreground">{lead.company_name}</div>
              <div className="text-[9px] text-primary/70 mt-0.5 capitalize">{lead.status || 'new'}</div>
            </button>
          ))}
          {leads.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-xs">No leads yet</div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-background border-b border-border flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">
            Nurture Bot {selectedLead ? `— ${selectedLead.contact_name}` : ''}
          </span>
        </div>

        {!selectedLead ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Select a Lead</h3>
              <p className="text-sm text-muted-foreground">Choose a lead from the list to start crafting personalized outreach</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-border/50 flex gap-2 flex-wrap">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(qa.prompt);
                    void sendMessage(qa.prompt);
                  }}
                  className="text-[10px] bg-primary/[0.06] text-primary border border-primary/20 px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary/10 transition-colors font-medium"
                >
                  <Zap className="w-3 h-3 inline mr-1" />{qa.label}
                </button>
              ))}
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {generating && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3 text-sm text-muted-foreground animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about this lead or request content..."
                className="flex-1 bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={generating || !input.trim()}
                className="bg-primary text-primary-foreground border-none px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-all hover:brightness-110"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NurtureBotPage;
