import { useEffect, useState } from 'react';
import {
  Mail,
  Inbox,
  Users,
  Star,
  HelpCircle,
  FolderClosed,
  SendHorizontal,
  Settings,
} from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

interface Counts {
  inbox: number;
  leads: number;
  highPriority: number;
  customerSupport: number;
  marketing: number;
  sent: number;
  subcategories: Record<string, number>;
}

interface Subcategory {
  name: string;
  count: number;
  parent: string;
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
    sent: 0,
    subcategories: {},
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

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

        // Process subcategories
        const subCats: Record<string, Subcategory> = {};
        categoryData?.forEach((email) => {
          if (email.subcategory && email.category) {
            const key = `${email.category}:${email.subcategory}`;
            if (!subCats[key]) {
              subCats[key] = {
                name: email.subcategory,
                count: 1,
                parent: email.category,
              };
            } else {
              subCats[key].count += 1;
            }
          }
        });

        setSubcategories(Object.values(subCats));

        // Group subcategories by category for counting
        const subcategoryCounts: Record<string, number> = {};
        Object.values(subCats).forEach((subcat) => {
          subcategoryCounts[subcat.name] = subcat.count;
        });

        const newCounts = {
          inbox: categoryData?.length || 0,
          leads:
            categoryData?.filter(
              (e) => e.category?.toLowerCase() === 'Lead'.toLowerCase()
            ).length || 0,
          highPriority:
            categoryData?.filter(
              (e) => e.category?.toLowerCase() === 'High Priority'.toLowerCase()
            ).length || 0,
          customerSupport:
            categoryData?.filter(
              (e) =>
                e.category?.toLowerCase() === 'Customer Support'.toLowerCase()
            ).length || 0,
          marketing:
            categoryData?.filter(
              (e) => e.category?.toLowerCase() === 'Marketing'.toLowerCase()
            ).length || 0,
          sent: sentCount || 0,
          subcategories: subcategoryCounts,
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

  // Group subcategories by their parent category
  const subcategoriesByCategory = subcategories.reduce<
    Record<string, Subcategory[]>
  >((acc, subcat) => {
    if (!acc[subcat.parent]) {
      acc[subcat.parent] = [];
    }
    acc[subcat.parent].push(subcat);
    return acc;
  }, {});

  // Get category color class
  const getCategoryColorClass = (category: string): string => {
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
      case 'lead':
        return 'bg-category-lead';
      case 'high priority':
        return 'bg-category-highpriority';
      case 'customer support':
        return 'bg-category-support';
      case 'marketing':
        return 'bg-category-marketing';
      default:
        return 'bg-category-general';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Mail className="h-4 w-4 text-sidebar-background" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">
            MailAssist AI
          </h1>
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
                    <Badge variant="secondary" className="ml-auto">
                      {counts.inbox}
                    </Badge>
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
                    <Badge variant="secondary" className="ml-auto">
                      {counts.leads}
                    </Badge>
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
                    <Badge variant="secondary" className="ml-auto">
                      {counts.highPriority}
                    </Badge>
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
                    <Badge variant="secondary" className="ml-auto">
                      {counts.customerSupport}
                    </Badge>
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
                    <Badge variant="secondary" className="ml-auto">
                      {counts.sent}
                    </Badge>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(subcategoriesByCategory).map(
                ([category, subcats]) => (
                  <SidebarMenuItem key={category}>
                    <SidebarMenuButton>
                      <span
                        className={`h-2 w-2 rounded-full ${getCategoryColorClass(
                          category
                        )} mr-2`}
                      ></span>
                      <span>{category}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {subcats.reduce((sum, subcat) => sum + subcat.count, 0)}
                      </Badge>
                    </SidebarMenuButton>

                    <SidebarMenuSub>
                      {subcats.map((subcat) => (
                        <SidebarMenuSubItem key={`${category}-${subcat.name}`}>
                          <SidebarMenuSubButton
                            onClick={() =>
                              navigate(
                                `/category/${category.toLowerCase()}/${subcat.name.toLowerCase()}`
                              )
                            }
                          >
                            {subcat.name}
                            <Badge variant="secondary" className="ml-auto">
                              {subcat.count}
                            </Badge>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton
          asChild
          variant="outline"
          className="w-full justify-start gap-3"
        >
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
