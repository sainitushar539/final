import { Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="no-underline flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground text-sm">Credibility Suite</span>
        </Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 no-underline">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
      </div>
    </nav>

    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 16, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">1. Introduction</h2>
          <p>Credibility Suite AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and related services (collectively, the "Service").</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">2. Information We Collect</h2>
          <p className="mb-2"><strong className="text-foreground">Personal Information:</strong> When you register or use our Service, we may collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full name, email address, and phone number</li>
            <li>Business name, industry, and NAICS code</li>
            <li>Estimated credit score range</li>
            <li>Annual revenue and time in business</li>
            <li>Funding needs and business goals</li>
          </ul>
          <p className="mt-3 mb-2"><strong className="text-foreground">Usage Data:</strong> We automatically collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Browser type, device information, and IP address</li>
            <li>Pages visited, features used, and time spent</li>
            <li>Referral sources and interaction patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and personalize our Service, including fundability scoring</li>
            <li>Match you with relevant funding products and business guidance</li>
            <li>Communicate with you about your account, updates, and offers</li>
            <li>Improve our platform, AI models, and user experience</li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">4. Information Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Service Providers:</strong> Third parties that help us operate our platform (hosting, analytics, email)</li>
            <li><strong className="text-foreground">Lending Partners:</strong> With your explicit consent, we may share business data with funding partners to facilitate loan matching</li>
            <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, subpoena, or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">5. Data Security</h2>
          <p>We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted storage, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access, correct, or delete your personal data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data in a portable format</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@credibilitysuite.ai" className="text-primary hover:underline no-underline">privacy@credibilitysuite.ai</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">7. Cookies & Tracking</h2>
          <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage patterns. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">8. Third-Party Services</h2>
          <p>Our Service may contain links to third-party websites or integrate with external services (e.g., scheduling tools, payment processors). We are not responsible for the privacy practices of these third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">9. Children's Privacy</h2>
          <p>Our Service is not intended for individuals under 18 years of age. We do not knowingly collect information from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">11. Disclaimer</h2>
          <p>The information, tools, scores, and recommendations provided through Credibility Suite AI are for general informational and educational purposes only. <strong className="text-foreground">This platform does not provide financial, legal, or tax advice.</strong> Nothing on this platform should be construed as professional advice or a guarantee of funding, credit approval, or business outcomes.</p>
          <p className="mt-2">AI-generated content, including scores, insights, and recommendations, is produced by automated systems and may not reflect your complete financial picture. Always consult with a licensed financial advisor, attorney, or tax professional before making significant business or financial decisions.</p>
          <p className="mt-2">Credibility Suite AI, She Wins With AI, and their affiliates are not responsible for any actions taken based on the information provided through this platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">12. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our Disclaimer, please contact us at:</p>
          <p className="mt-2">
            <strong className="text-foreground">Credibility Suite AI</strong><br />
            Email: <a href="mailto:privacy@credibilitysuite.ai" className="text-primary hover:underline no-underline">privacy@credibilitysuite.ai</a>
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
