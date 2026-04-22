import { useAuth } from '@/contexts/AuthContext';
import { Brain, LayoutDashboard, Building2, Zap, Landmark, Bot, BarChart3, Settings, LogOut, Users, Mail, MessageSquare, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onSignOut?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const navItems = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'businesses', icon: Building2, label: 'All Businesses' },
  ]},
  { section: 'CRM', items: [
    { id: 'leads', icon: Users, label: 'Leads CRM' },
    { id: 'lead-finder', icon: Search, label: 'Lead Finder' },
    { id: 'nurture-bot', icon: MessageSquare, label: 'Nurture Bot' },
    { id: 'crm-email', icon: Mail, label: 'Email Outreach' },
  ]},
  { section: 'Capital', items: [
    { id: 'pipeline', icon: Zap, label: 'Pipeline', badge: '10' },
    { id: 'loans', icon: Landmark, label: 'Loan Queue', badge: '3', isWarning: true },
  ]},
  { section: 'Intelligence', items: [
    { id: 'agents', icon: Bot, label: 'AI Agents', badge: '5' },
  ]},
  { section: 'Reporting', items: [
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]},
];

const Sidebar = ({ activePage, onNavigate, onSignOut, collapsed = false, onToggleCollapsed }: SidebarProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className={`${collapsed ? 'w-[84px]' : 'w-[280px]'} bg-[#0B0F19] border-r border-[#1A2233] fixed top-0 left-0 bottom-0 flex flex-col z-[100] transition-[width] duration-200`}>
      {/* Logo */}
      <div className="px-4 pt-4 pb-4 border-b border-[#1A2233]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md border border-[#D4AF37]/25 bg-[#111827] flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#D4AF37]" />
          </div>
          {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#E5E7EB] leading-tight tracking-tight">
              Credibility Suite
            </div>
            <div className="text-[10px] text-[#9CA3AF] tracking-[0.16em] uppercase mt-0.5">
              Fund Manager Portal
            </div>
          </div>
          )}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="ml-auto hidden h-8 w-8 items-center justify-center rounded-md border border-[#1A2233] bg-[#111827] text-[#9CA3AF] transition hover:border-[#D4AF37]/35 hover:text-[#E5E7EB] lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="py-4 flex-1 overflow-y-auto px-3">
        {navItems.map(section => (
          <div key={section.section} className="mb-3">
            {!collapsed && <div className="text-[10px] font-semibold tracking-[0.2em] text-[#5F6B7D] uppercase px-3 pt-2 pb-2">
              {section.section}
            </div>}
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 cursor-pointer transition-all duration-200 text-[12px] font-semibold text-left rounded-md mb-1 border border-transparent uppercase tracking-[0.04em] ${
                    activePage === item.id
                      ? 'text-[#E5E7EB] bg-[#111827] border-[#1A2233]'
                      : 'text-[#7D8794] hover:text-[#E5E7EB] hover:bg-[#111827]/70'
                  }`}
                >
                  {activePage === item.id && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#D4AF37]" />}
                  <Icon className={`w-4 h-4 flex-shrink-0 ${activePage === item.id ? 'text-[#D4AF37]' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.isWarning
                        ? 'bg-[#3A1F25] text-[#D9A0A8]'
                        : 'bg-[#2A2417] text-[#D4AF37]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#1A2233]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-md border border-[#1A2233] bg-[#111827] flex items-center justify-center text-[11px] font-bold text-[#E5E7EB] flex-shrink-0">
            {initials}
          </div>
          {!collapsed && <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#E5E7EB] truncate">{displayName}</div>
            <div className="text-[10px] text-[#9CA3AF] truncate">{user?.email}</div>
          </div>
          }
        </div>
        {onSignOut && !collapsed && (
          <button
            onClick={onSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 text-[11px] font-medium text-[#9CA3AF] hover:text-[#E5E7EB] transition-all bg-[#111827] border border-[#1A2233] hover:border-[#D4AF37]/25 rounded-md py-2.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
