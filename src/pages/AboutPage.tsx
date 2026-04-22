import { Link } from 'react-router-dom';
import { Brain, Users, Target, Briefcase, Globe, Heart, Sparkles } from 'lucide-react';
import teamPhoto from '@/assets/team.jpg';
import PublicNav from '@/components/PublicNav';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="pt-20 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/[0.06] border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Meet the Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">
              The People Behind Credibility Suite
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A diverse team of strategists, technologists, and coaches building the future of business credibility and capital readiness.
            </p>
            <a
              href="https://credibilitysuits.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80 transition-colors font-semibold text-sm no-underline"
            >
              <Globe className="w-4 h-4" /> credibilitysuits.com
            </a>
          </div>

          {/* Team photo */}
          <div className="relative rounded-3xl overflow-hidden mb-14 shadow-xl border border-border">
            <img
              src={teamPhoto}
              alt="Credibility Suite team — diverse group of professionals in branded polos"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Atlanta, GA</span>
              </div>
              <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
                One mission. Many stories.
              </h2>
            </div>
          </div>

          {/* Company bio */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">About Credibility Suite</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Credibility Suite</strong> is an enterprise-grade platform engineered to help small businesses, entrepreneurs, and founders achieve and maintain capital readiness. We integrate intelligent automation, advisory expertise, and a structured fundability framework that enables business owners to execute with clarity and precision.
              </p>
              <p>
                We believe equitable access to capital is foundational to economic growth. Whether you are pursuing an SBA loan, establishing business credit, or preparing for institutional funding, our platform evaluates your fundability profile, identifies the criteria lenders prioritize, and provides a clear remediation path — communicated in straightforward, actionable terms.
              </p>
              <p>
                Our team brings together credit specialists, financial advisors, software engineers, and seasoned operators with firsthand experience guiding businesses through the funding lifecycle. Credibility Suite is headquartered in Atlanta, GA.
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bridge the gap between underserved businesses and the capital they need to thrive — through AI, expertise, and radical transparency.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Our Values</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Inclusion. Honesty. Speed. We meet business owners where they are — and move them forward without jargon, gatekeeping, or empty promises.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Who We Serve</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Small business owners, solo founders, and growing companies preparing for funding — from SBA loans to lines of credit and equipment financing.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">How We Work</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI agents handle the heavy lifting — document review, eligibility scans, and personalized guidance — while our human coaches provide strategy when it matters most.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] rounded-2xl p-8 text-center">
            <h3 className="text-white text-xl font-bold mb-6">Impact by the Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '500+', label: 'Businesses Assessed' },
                { value: '$2M+', label: 'Capital Facilitated' },
                { value: '92%', label: 'Client Satisfaction' },
                { value: '6', label: 'AI Agents Active' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ready to build your business credibility?</p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] text-white font-semibold px-8 py-3 rounded-xl no-underline hover:shadow-lg transition-all"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
