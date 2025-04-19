import { useNavigate, useLocation } from 'react-router-dom';
import { Inbox, Users, Star, HelpCircle, FolderClosed, SendHorizontal, Settings, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { mockEmails } from '@/data/mock-data';
const NavItem = ({
  icon: Icon,
  label,
  path,
  count,
  active
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  count?: number;
  active: boolean;
}) => {
  const navigate = useNavigate();
  return <Button variant="ghost" className={cn("w-full justify-start gap-3 mb-1 pl-4", active ? "bg-sidebar-accent" : "bg-transparent hover:bg-sidebar-accent/50")} onClick={() => navigate(path)}>
      <Icon className="h-5 w-5" />
      <span className="font-medium text-white ">{label}</span>
      {count !== undefined && <Badge variant="secondary" className="ml-auto mr-2">
          {count}
        </Badge>}
    </Button>;
};
const Sidebar = () => {
  const location = useLocation();

  // Count emails by category
  const counts = {
    inbox: mockEmails.filter(e => e.status !== 'archived').length,
    leads: mockEmails.filter(e => e.category === 'lead').length,
    highPriority: mockEmails.filter(e => e.category === 'high-priority').length,
    customerSupport: mockEmails.filter(e => e.category === 'customer-support').length,
    general: mockEmails.filter(e => e.category === 'general').length,
    marketing: mockEmails.filter(e => e.category === 'marketing').length,
    partnership: mockEmails.filter(e => e.subcategory === 'partnership').length,
    sent: mockEmails.filter(e => e.direction === 'outbound').length
  };
  return <aside className="w-64 h-screen bg-sidebar flex flex-col border-r shrink-0">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Mail className="h-4 w-4 text-sidebar-background" />
        </div>
        <h1 className="text-xl font-bold text-sidebar-foreground">MailAssist AI</h1>
        <ThemeToggle />
      </div>
      
      <div className="mt-4 flex-1 overflow-y-auto">
        <nav className="px-2 space-y-1">
          <NavItem icon={Inbox} label="Inbox" path="/" count={counts.inbox} active={location.pathname === '/'} />
          <NavItem icon={Users} label="Leads" path="/leads" count={counts.leads} active={location.pathname === '/leads'} />
          <NavItem icon={Star} label="High Priority" path="/high-priority" count={counts.highPriority} active={location.pathname === '/high-priority'} />
          <NavItem icon={HelpCircle} label="Customer Support" path="/customer-support" count={counts.customerSupport} active={location.pathname === '/customer-support'} />
          <NavItem icon={FolderClosed} label="CRM" path="/crm" active={location.pathname === '/crm'} />
          <NavItem icon={SendHorizontal} label="Sent Emails" path="/sent" count={counts.sent} active={location.pathname === '/sent'} />
        </nav>
        
        <Separator className="my-4 bg-sidebar-border/50" />
        
        <div className="px-3">
          <h4 className="mb-2 text-xs uppercase tracking-wider text-sidebar-foreground/70 font-semibold px-2">
            Categories
          </h4>
          <div className="space-y-1">
            <div className="flex items-center px-2 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-category-lead mr-3"></span>
              <span className="text-sidebar-foreground">Sales</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.leads}
              </Badge>
            </div>
            <div className="flex items-center px-2 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-category-marketing mr-3"></span>
              <span className="text-sidebar-foreground">Marketing</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.marketing}
              </Badge>
            </div>
            <div className="flex items-center px-2 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-category-partnership mr-3"></span>
              <span className="text-sidebar-foreground">Partnership</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.partnership}
              </Badge>
            </div>
            <div className="flex items-center px-2 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-category-general mr-3"></span>
              <span className="text-sidebar-foreground">General</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.general}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-sidebar-border/50">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Button>
        <div className="flex items-center mt-4 gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Alex+Morgan&background=0D8ABC&color=fff" alt="Alex Morgan" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap text-ellipsis overflow-hidden">
              Alex Morgan
            </div>
            <div className="text-xs text-sidebar-foreground/70 whitespace-nowrap text-ellipsis overflow-hidden">
              alex@company.com
            </div>
          </div>
        </div>
      </div>
    </aside>;
};
export default Sidebar;