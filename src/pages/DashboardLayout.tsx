import { CSSProperties, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/Sidebar';
import ClientSidebar from '@/components/ClientSidebar';
import Topbar from '@/components/Topbar';
import DashboardPage from './DashboardPage';
import BusinessesPage from './BusinessesPage';
import PipelinePage from './PipelinePage';
import LoansPage from './LoansPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import AgentsPage from './AgentsPage';
import ClientDashboard from './ClientDashboard';
import LeadsCRMPage from './LeadsCRMPage';
import LeadFinderPage from './LeadFinderPage';
import NurtureBotPage from './NurtureBotPage';
import CRMEmailPage from './CRMEmailPage';
import TechChatWidget from '@/components/TechChatWidget';

const adminPageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Fund Manager Dashboard' },
  businesses: { title: 'All Businesses', subtitle: 'Complete fundability view' },
  leads: { title: 'Leads CRM', subtitle: 'Manage and nurture your leads' },
  'lead-finder': { title: 'Lead Finder', subtitle: 'Search and filter high-priority leads' },
  'nurture-bot': { title: 'Lead Nurture Bot', subtitle: 'AI-powered lead nurturing' },
  'crm-email': { title: 'Email Outreach', subtitle: 'Send personalized emails' },
  pipeline: { title: 'Fundability Pipeline', subtitle: 'Pipeline view of all businesses' },
  loans: { title: 'Loan Approval Queue', subtitle: 'Review and approve applications' },
  agents: { title: 'AI Agents', subtitle: 'AI-powered analysis' },
  analytics: { title: 'Analytics & Reporting', subtitle: 'Portfolio performance metrics' },
  settings: { title: 'Settings', subtitle: 'Profile and fund configuration' },
};

const clientPageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'My Dashboard', subtitle: 'Track your progress to capital access' },
  agents: { title: 'AI Agents', subtitle: 'AI-powered analysis' },
  settings: { title: 'Settings', subtitle: 'Manage your profile' },
};

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const adminPages = new Set(['dashboard', 'businesses', 'leads', 'lead-finder', 'nurture-bot', 'crm-email', 'pipeline', 'loans', 'agents', 'analytics', 'settings']);
  const clientPages = new Set(['dashboard', 'agents', 'settings']);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    try { sessionStorage.setItem('cs_dashboard_page', page); } catch { /* ignore */ }
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(isAdmin ? '/agent-login' : '/auth', { replace: true });
  };

  useEffect(() => {
    try {
      const savedPage = sessionStorage.getItem('cs_dashboard_page');
      if (savedPage) setActivePage(savedPage);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (loading) return;
    const allowedPages = isAdmin ? adminPages : clientPages;
    if (!allowedPages.has(activePage)) {
      setActivePage('dashboard');
      try { sessionStorage.setItem('cs_dashboard_page', 'dashboard'); } catch { /* ignore */ }
    }
  }, [activePage, isAdmin, loading]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ page: string }>;
      if (customEvent.detail?.page) {
        handleNavigate(customEvent.detail.page);
      }
    };

    window.addEventListener('admin:navigate', handler as EventListener);
    return () => window.removeEventListener('admin:navigate', handler as EventListener);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  const pageTitles = isAdmin ? adminPageTitles : clientPageTitles;
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  const adminTheme = {
    '--background': '222 39% 7%',
    '--foreground': '220 13% 91%',
    '--card': '221 39% 11%',
    '--card-foreground': '220 13% 91%',
    '--secondary': '220 32% 15%',
    '--secondary-foreground': '220 13% 91%',
    '--muted': '220 32% 15%',
    '--muted-foreground': '220 9% 64%',
    '--border': '220 32% 15%',
    '--input': '220 32% 15%',
    '--primary': '45 65% 52%',
    '--primary-foreground': '222 39% 7%',
    '--accent': '217 91% 60%',
    '--ring': '45 65% 52%',
    '--success': '158 35% 48%',
    '--warning': '45 65% 52%',
    '--info': '217 62% 55%',
  } as CSSProperties;

  const clientTheme = {
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%',
    '--card': '0 0% 100%',
    '--card-foreground': '222 47% 11%',
    '--secondary': '220 14% 96%',
    '--secondary-foreground': '222 47% 11%',
    '--muted': '220 14% 96%',
    '--muted-foreground': '215 16% 47%',
    '--border': '214 32% 91%',
    '--input': '214 32% 91%',
    '--primary': '222 89% 56%',
    '--primary-foreground': '0 0% 100%',
    '--accent': '222 89% 56%',
    '--ring': '222 89% 56%',
    '--success': '158 64% 42%',
    '--warning': '38 92% 50%',
    '--info': '217 91% 60%',
  } as CSSProperties;

  const sidebarWidth = sidebarCollapsed ? 84 : 280;

  return (
    <div
      className={`flex min-h-screen ${isAdmin ? 'admin-panel bg-[#070b13] text-foreground' : 'bg-[#F4F7FB] text-slate-900'}`}
      style={isAdmin ? adminTheme : clientTheme}
    >
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[99] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed z-[100] h-screen max-h-screen' : ''}`}>
        {isAdmin ? (
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
            onCloseMobile={() => setSidebarOpen(false)}
            mobileOpen={sidebarOpen}
          />
        ) : (
          <ClientSidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
            onCloseMobile={() => setSidebarOpen(false)}
            mobileOpen={sidebarOpen}
          />
        )}
      </div>

      <div
        className={`${isMobile ? 'w-full min-w-0' : ''} flex-1 min-h-screen flex flex-col transition-[margin] duration-200`}
        style={!isMobile && isAdmin ? { marginLeft: sidebarWidth } : !isMobile ? { marginLeft: 260 } : undefined}
      >
        <Topbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onLoanQueue={isAdmin && activePage === 'dashboard' ? () => setActivePage('loans') : undefined}
          onMenuToggle={isMobile ? () => setSidebarOpen(!sidebarOpen) : undefined}
          variant={isAdmin ? 'admin' : 'client'}
        />
        <main className={`${isAdmin ? 'p-3 sm:p-4 md:p-7' : 'p-4 md:p-6'} flex-1 overflow-x-hidden`}>
          {isAdmin ? (
            <>
              {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
              {activePage === 'businesses' && <BusinessesPage />}
              {activePage === 'leads' && <LeadsCRMPage />}
              {activePage === 'lead-finder' && <LeadFinderPage />}
              {activePage === 'nurture-bot' && <NurtureBotPage />}
              {activePage === 'crm-email' && <CRMEmailPage />}
              {activePage === 'pipeline' && <PipelinePage />}
              {activePage === 'loans' && <LoansPage />}
              {activePage === 'agents' && <AgentsPage />}
              {activePage === 'analytics' && <AnalyticsPage />}
              {activePage === 'settings' && <SettingsPage />}
            </>
          ) : (
            <>
              <div className={activePage === 'dashboard' ? '' : 'hidden'}>
                <ClientDashboard />
              </div>
              <div className={activePage === 'agents' ? '' : 'hidden'}>
                <AgentsPage />
              </div>
              <div className={activePage === 'settings' ? '' : 'hidden'}>
                <SettingsPage />
              </div>
            </>
          )}
        </main>
      </div>
      {!isAdmin && <TechChatWidget />}
    </div>
  );
};

export default DashboardLayout;
