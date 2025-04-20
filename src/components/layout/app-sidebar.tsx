import { useEffect, useState } from 'react';
import { Mail, Inbox, Users, Star, HelpCircle, FolderClosed, SendHorizontal, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface Counts {
  inbox: number;
  leads: number;
  highPriority: number;
  customerSupport: number;
  marketing: number;
  partnership: number;
  general: number;
  sent: number;
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Counts>({
    inbox: 0,
    leads: 0,
    highPriority: 0,
    customerSupport: 0,
    marketing: 0,
    partnership: 0,
    general: 0,
    sent: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Count emails by category
        const { data: categoryData, error: categoryError } = await supabase
          .from('emails')
          .select('category, subcategory', { count: 'exact' })
          .not('status', 'eq', 'archived');

        if (categoryError) throw categoryError;

        // Count sent emails
        const { count: sentCount, error: sentError } = await supabase
          .from('emails')
          .select('*', { count: 'exact' })
          .eq('direction', 'outgoing')
          .eq('status', 'sent');

        if (sentError) throw sentError;

        const newCounts = {
          inbox: categoryData?.length || 0,
          leads: categoryData?.filter(e => e.category?.toLowerCase() === 'lead').length || 0,
          highPriority: categoryData?.filter(e => e.category?.toLowerCase() === 'high priority').length || 0,
          customerSupport: categoryData?.filter(e => e.category?.toLowerCase() === 'customer support').length || 0,
          marketing: categoryData?.filter(e => e.category?.toLowerCase() === 'marketing').length || 0,
          partnership: categoryData?.filter(e => e.subcategory?.toLowerCase() === 'partnership').length || 0,
          general: categoryData?.filter(e => e.category?.toLowerCase() === 'general').length || 0,
          sent: sentCount || 0
        };

        setCounts(newCounts);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('email-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emails' },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Mail className="h-4 w-4 text-sidebar-background" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">MailAssist AI</h1>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/'} 
                  tooltip="Inbox"
                >
                  <button onClick={() => navigate('/')}>
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                    <Badge variant="secondary" className="ml-auto">{counts.inbox}</Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/leads'} 
                  tooltip="Leads"
                >
                  <button onClick={() => navigate('/leads')}>
                    <Users className="h-4 w-4" />
                    <span>Leads</span>
                    <Badge variant="secondary" className="ml-auto">{counts.leads}</Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/high-priority'} 
                  tooltip="High Priority"
                >
                  <button onClick={() => navigate('/high-priority')}>
                    <Star className="h-4 w-4" />
                    <span>High Priority</span>
                    <Badge variant="secondary" className="ml-auto">{counts.highPriority}</Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/customer-support'} 
                  tooltip="Customer Support"
                >
                  <button onClick={() => navigate('/customer-support')}>
                    <HelpCircle className="h-4 w-4" />
                    <span>Customer Support</span>
                    <Badge variant="secondary" className="ml-auto">{counts.customerSupport}</Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/crm'} 
                  tooltip="CRM"
                >
                  <button onClick={() => navigate('/crm')}>
                    <FolderClosed className="h-4 w-4" />
                    <span>CRM</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === '/sent'} 
                  tooltip="Sent Emails"
                >
                  <button onClick={() => navigate('/sent')}>
                    <SendHorizontal className="h-4 w-4" />
                    <span>Sent Emails</span>
                    <Badge variant="secondary" className="ml-auto">{counts.sent}</Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1 p-2">
              <div className="flex items-center px-2 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-category-lead mr-3"></span>
                <span className="text-sidebar-foreground">Sales</span>
                <Badge variant="secondary" className="ml-auto">{counts.leads}</Badge>
              </div>
              <div className="flex items-center px-2 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-category-marketing mr-3"></span>
                <span className="text-sidebar-foreground">Marketing</span>
                <Badge variant="secondary" className="ml-auto">{counts.marketing}</Badge>
              </div>
              <div className="flex items-center px-2 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-category-partnership mr-3"></span>
                <span className="text-sidebar-foreground">Partnership</span>
                <Badge variant="secondary" className="ml-auto">{counts.partnership}</Badge>
              </div>
              <div className="flex items-center px-2 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-category-general mr-3"></span>
                <span className="text-sidebar-foreground">General</span>
                <Badge variant="secondary" className="ml-auto">{counts.general}</Badge>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton asChild variant="outline" className="w-full justify-start gap-3">
          <button>
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </SidebarMenuButton>
        <div className="flex items-center mt-4 gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 overflow-hidden">
            <img 
              src="https://ui-avatars.com/api/?name=Alex+Morgan&background=0D8ABC&color=fff" 
              alt="Alex Morgan" 
              className="w-full h-full object-cover" 
            />
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
      </SidebarFooter>
    </Sidebar>
  );
}
