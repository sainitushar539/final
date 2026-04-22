import JourneyShell from './JourneyShell';
import BookingCTA from './BookingCTA';
import type { JourneyProps } from './types';
import { Bot, CheckCircle2 } from 'lucide-react';

const features = [
  'Manages your calendar, emails, and follow-ups',
  'Automates repetitive admin tasks',
  'Organizes documents and files',
  'Sends reminders and tracks deadlines',
  'Works 24/7 — never misses a beat',
];

const VEAJourney = ({ lead, onBack }: JourneyProps) => (
  <JourneyShell onBack={onBack}>
    <div className="text-center mb-6">
      <span className="inline-block text-xs font-semibold text-[#2563eb] bg-[#2563eb]/[0.08] px-3 py-1.5 rounded-full mb-3">🤖 Virtual Executive Assistant</span>
      <h2 className="text-2xl font-extrabold text-white mb-2">Meet Your AI-Powered Executive Assistant</h2>
      <p className="text-sm text-white/50">Hi {lead.name.split(' ')[0] || 'there'} — let us handle the busy work so you can focus on growth.</p>
    </div>

    <div className="bg-white/[0.04] rounded-2xl border border-white/[0.1] p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[hsl(260,70%,60%)] flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">What your VEA does for you</div>
          <div className="text-xs text-white/40">AI-powered assistance, always on</div>
        </div>
      </div>
      <div className="space-y-3">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-white/60">{f}</span>
          </div>
        ))}
      </div>
    </div>

    <BookingCTA title="Book a Demo Call" subtitle="See your Virtual Executive Assistant in action" />
  </JourneyShell>
);

export default VEAJourney;
