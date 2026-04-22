import TopMarquee from '@/components/landing/TopMarquee';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import TrustSection from '@/components/landing/TrustSection';
import CTASection from '@/components/landing/CTASection';
import FAQSection from '@/components/landing/FAQSection';
import LandingFooter from '@/components/landing/LandingFooter';
import TechChatWidget from '@/components/TechChatWidget';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <TopMarquee />
      <LandingNav />
      <HeroSection />
      <HowItWorks />
      <TrustSection />
      <CTASection />
      <FAQSection />
      <LandingFooter />
      <TechChatWidget />
    </div>
  );
};

export default LandingPage;
