import { Search, Filter, Bell, Plus, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface HeaderProps {
  category?: string;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

const Header = ({
  category,
  onSearch,
  onMenuClick
}: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/leads':
        return 'Leads';
      case '/high-priority':
        return 'High Priority';
      case '/customer-support':
        return 'Customer Support';
      case '/crm':
        return 'CRM';
      case '/sent':
        return 'Sent Emails';
      default:
        return 'Inbox';
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (onSearch) onSearch(query);
  };

  const handleTabChange = (value: string) => {
    navigate(`/${value === 'inbox' ? '' : value}`);
  };

  return (
    <div className="border-b">
      <div className="flex items-center justify-between p-4 bg-background">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl md:text-2xl font-bold">{getPageTitle()}</h1>
        </div>
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="query" placeholder="Search emails, contacts..." className="pl-10 bg-secondary" />
          </div>
        </form>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="hidden md:inline-flex">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="hidden md:inline-flex">
            <Bell className="h-4 w-4" />
          </Button>
          <Button className="gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold">
            <Plus className="h-4 w-4" />
            {!isMobile && "Compose"}
          </Button>
        </div>
      </div>
      
      {location.pathname !== '/crm' && (
        <div className="overflow-x-auto">
          <Tabs 
            defaultValue={location.pathname === '/' ? 'inbox' : location.pathname.substring(1)} 
            className="w-full px-4 md:px-6" 
            onValueChange={handleTabChange}
          >
            <TabsList className="w-full justify-start bg-transparent h-12 p-0">
              <TabsTrigger value="inbox" className={cn("rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none", location.pathname === '/' ? "border-b-2 border-primary" : "")}>
                Inbox
              </TabsTrigger>
              <TabsTrigger value="leads" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Leads
              </TabsTrigger>
              <TabsTrigger value="high-priority" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                High Priority
              </TabsTrigger>
              <TabsTrigger value="customer-support" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Customer Support
              </TabsTrigger>
              <TabsTrigger value="crm" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                CRM
              </TabsTrigger>
              <TabsTrigger value="sent" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                Sent Emails
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Header;
