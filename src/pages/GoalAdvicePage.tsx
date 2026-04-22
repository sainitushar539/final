import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import PremiumAIReport from '@/components/journeys/PremiumAIReport';

const goalLabels: Record<string, string> = {
  loan: 'Getting a Business Loan',
  credit: 'Improving Your Credit',
  grow: 'Growing Your Business',
  exploring: 'Your Business Options',
  fundability: 'Your Fundability',
};

const ADVICE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/goal-advice`;

const GoalAdvicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const goal = searchParams.get('goal') || 'exploring';
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdvice = async () => {
    setLoading(true);
    setAdvice('');
    setError('');

    try {
      const resp = await fetch(ADVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ goal, businessName: '' }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get advice');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setAdvice(full);
            }
          } catch {
            buffer = `${line}\n${buffer}`;
            break;
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [goal]);

  const reportActions = !loading && advice ? (
    <div className="space-y-3">
      <button
        onClick={() => window.open('https://calendly.com/mauricestewart/1-hour-consultation', '_blank')}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200/20 bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-amber-400/90 px-4 py-4 text-sm font-black text-[#17100a] shadow-[0_22px_70px_-34px_rgba(251,191,36,.95)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_80px_-34px_rgba(251,191,36,1)]"
      >
        <Calendar className="h-4 w-4" />
        Book a Free Strategy Call
      </button>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <button
          onClick={() => navigate('/get-started')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-all hover:border-sky-200/30 hover:bg-white/[0.1]"
        >
          Check My Fundability Score
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/65 transition-all hover:border-white/25 hover:text-white"
        >
          Home
        </button>
      </div>
    </div>
  ) : undefined;

  return (
    <div className="min-h-screen bg-[#050914]">
      <PremiumAIReport
        advice={advice}
        loading={loading}
        error={error}
        onRetry={fetchAdvice}
        title={goalLabels[goal] || 'Your Personalized Advice'}
        subtitle="A cinematic AI consultant workspace designed to turn your goal into executive priorities, hidden opportunities, and a focused action path."
        loadingText="Building your premium strategy report..."
        actions={reportActions}
      />
    </div>
  );
};

export default GoalAdvicePage;
