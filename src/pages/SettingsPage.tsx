import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Mail, MessageSquare, ShieldCheck, Server, Smartphone, Sparkles, LockKeyhole } from 'lucide-react';
import { emptyCommunicationSettings, loadLocalCommunicationSettings, saveLocalCommunicationSettings } from '@/lib/communicationSettings';

const SettingsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', title: '' });
  const [communication, setCommunication] = useState(emptyCommunicationSettings);
  const [saving, setSaving] = useState(false);
  const [communicationSaving, setCommunicationSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, email, phone, title')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          title: data.title || '',
        });
      });

    if (isAdmin) {
      setCommunication(loadLocalCommunicationSettings());
    }
  }, [user, isAdmin]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles')
      .update({ full_name: profile.full_name, phone: profile.phone, title: profile.title })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error('Failed to save profile'); return; }
    toast.success('Profile saved!');
  };

  const saveCommunication = async () => {
    if (!user) return;
    setCommunicationSaving(true);
    saveLocalCommunicationSettings(communication);
    setCommunicationSaving(false);
    toast.success('Communication settings saved locally.');
  };

  const fields = [
    { label: 'Full Name', key: 'full_name' as const },
    { label: 'Title', key: 'title' as const },
    { label: 'Email', key: 'email' as const, disabled: true },
    { label: 'Phone', key: 'phone' as const },
  ];

  const baseInput =
    'w-full h-11 rounded-md border border-[#202A3D] bg-[#0E1422] px-3.5 text-[13px] text-[#E5E7EB] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 disabled:opacity-50';
  const miniInput =
    'w-full h-11 rounded-md border border-[#202A3D] bg-[#0E1422] px-3.5 text-[13px] text-[#E5E7EB] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10';

  return (
    <div className="animate-fade-up grid grid-cols-2 gap-4 max-lg:grid-cols-1">
      {/* Profile */}
      <div className="bg-card border border-[#1A2233] rounded-[14px] overflow-hidden shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]">
        <div className="border-b border-[#1A2233] bg-[#0B0F19] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Your Profile</div>
              <div className="text-[11px] text-[#9CA3AF]">Identity and contact details for the active account</div>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
        {fields.map((f, i) => (
          <div key={i}>
            <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
              {f.label}
            </Label>
            <input
              value={profile[f.key]}
              disabled={f.disabled}
              onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
              className={baseInput}
            />
          </div>
        ))}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B0F19] transition-all hover:bg-[#C9A633] disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-card border border-[#1A2233] rounded-[14px] overflow-hidden shadow-[0_24px_60px_-34px_rgba(0,0,0,0.95)]">
          <div className="border-b border-[#1A2233] bg-[#0B0F19] px-5 py-4">
            <div className="flex items-start justify-between gap-3 max-sm:flex-col">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Email & SMS Delivery</div>
                  <div className="text-[11px] text-[#9CA3AF]">Securely wire outbound channels for nurture and outreach</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] text-[#9CA3AF]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#202A3D] bg-[#111827] px-2.5 py-1">
                  <LockKeyhole className="h-3 w-3 text-[#D4AF37]" /> Encrypted fields
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#202A3D] bg-[#111827] px-2.5 py-1">
                  <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" /> Admin only
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded-[12px] border border-[#202A3D] bg-[#0E1422] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">SMTP / Gmail</div>
                  <div className="text-[11px] text-[#9CA3AF]">Use your mail server to send polished outbound emails</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <input
                  placeholder="SMTP host"
                  value={communication.smtp_host}
                  onChange={e => setCommunication(p => ({ ...p, smtp_host: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="SMTP port"
                  value={communication.smtp_port}
                  onChange={e => setCommunication(p => ({ ...p, smtp_port: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="SMTP username"
                  value={communication.smtp_user}
                  onChange={e => setCommunication(p => ({ ...p, smtp_user: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="SMTP password"
                  type="password"
                  value={communication.smtp_password}
                  onChange={e => setCommunication(p => ({ ...p, smtp_password: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="From email"
                  value={communication.smtp_from_email}
                  onChange={e => setCommunication(p => ({ ...p, smtp_from_email: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="From name"
                  value={communication.smtp_from_name}
                  onChange={e => setCommunication(p => ({ ...p, smtp_from_name: e.target.value }))}
                  className={miniInput}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-[#202A3D] bg-[#111827] px-3.5 py-3">
                <div>
                  <div className="text-[11px] font-semibold text-[#E5E7EB]">Secure SMTP / TLS</div>
                  <div className="text-[10px] text-[#9CA3AF]">Recommended for Gmail and most mail providers</div>
                </div>
                <Switch
                  checked={communication.smtp_secure}
                  onCheckedChange={(checked) => setCommunication(p => ({ ...p, smtp_secure: checked }))}
                />
              </div>
            </div>

            <div className="rounded-[12px] border border-[#202A3D] bg-[#0E1422] p-4">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Twilio SMS</div>
                  <div className="text-[11px] text-[#9CA3AF]">Send text messages directly from the nurture workflow</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <input
                  placeholder="Account SID"
                  value={communication.twilio_account_sid}
                  onChange={e => setCommunication(p => ({ ...p, twilio_account_sid: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="Auth token"
                  type="password"
                  value={communication.twilio_auth_token}
                  onChange={e => setCommunication(p => ({ ...p, twilio_auth_token: e.target.value }))}
                  className={miniInput}
                />
                <input
                  placeholder="Twilio phone number"
                  value={communication.twilio_from_number}
                  onChange={e => setCommunication(p => ({ ...p, twilio_from_number: e.target.value }))}
                  className={`${miniInput} md:col-span-2`}
                />
              </div>
            </div>

            <button
              onClick={saveCommunication}
              disabled={communicationSaving}
              className="inline-flex items-center gap-2 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B0F19] transition-all hover:bg-[#C9A633] disabled:opacity-50"
            >
              <Server className="h-4 w-4" />
              {communicationSaving ? 'Saving...' : 'Save Communication Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Platform Info */}
      <div className="bg-card border border-[#1A2233] rounded-[14px] overflow-hidden">
        <div className="border-b border-[#1A2233] bg-[#0B0F19] px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Platform Info</div>
          </div>
        </div>
        <div className="p-5">
        <div className="space-y-2 text-xs text-foreground/65">
          <div>Platform: <span className="text-foreground font-semibold">Credibility Suite</span></div>
          <div>Built by: <span className="text-foreground font-semibold">She Wins With AI</span></div>
          <div>Support: <a href="mailto:charisma@shewinswithai.com" className="text-primary font-bold hover:text-gold-lt transition-colors">charisma@shewinswithai.com</a></div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
