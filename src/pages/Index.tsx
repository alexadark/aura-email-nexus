
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import EmailCard from '@/components/emails/email-card';
import StatsCards from '@/components/dashboard/stats-cards';
import LeadsTable from '@/components/crm/leads-table';
import KanbanView from '@/components/crm/kanban-view';
import LeadDetail from '@/components/crm/lead-detail';
import { fetchEmails, EmailThread, Email } from '@/services/supabase';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

// Type definition for Lead (to maintain compatibility with existing components)
interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  assignedTo?: string;
  lastContact?: string;
  phone?: string;
  type?: string;
}

const EmailListView = ({ 
  emailThreads, 
  title, 
  isLoading, 
  refetch 
}: { 
  emailThreads: EmailThread[], 
  title?: string, 
  isLoading: boolean,
  refetch: () => void
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  return (
    <div>
      <StatsCards />
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md mb-4" />
          ))
        ) : emailThreads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No emails found in this category.
          </div>
        ) : (
          emailThreads.map((thread) => (
            <EmailCard 
              key={thread.threadId} 
              email={thread.originalEmail}
              replies={thread.replies}
              isOpen={selectedEmailId === thread.originalEmail.id}
              onOpen={setSelectedEmailId}
              onReplySent={refetch}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CRMView = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // In a real implementation, we would fetch leads from Supabase here
  // For now, we'll use an empty array
  const leads: Lead[] = [];
  
  if (selectedLead) {
    return (
      <LeadDetail 
        lead={selectedLead} 
        onBack={() => setSelectedLead(null)} 
      />
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Customer Relationship Management</h2>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </button>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <LeadsTable 
          leads={leads} 
          onSelectLead={setSelectedLead}
        />
      ) : (
        <KanbanView 
          leads={leads}
          onSelectLead={setSelectedLead}
        />
      )}
    </div>
  );
};

const Index = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Fetch emails from Supabase
  const { 
    data: emailThreads = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['emails'],
    queryFn: fetchEmails,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
  
  // Define the renderContent function here
  const renderContent = () => {
    const path = location.pathname;
    
    // Filter emails based on the current route
    if (path === '/crm') {
      return <CRMView />;
    } else {
      let filteredThreads = [...emailThreads];
      
      if (path === '/leads') {
        filteredThreads = emailThreads.filter(thread => thread.category === 'lead');
      } else if (path === '/high-priority') {
        filteredThreads = emailThreads.filter(thread => thread.category === 'high-priority');
      } else if (path === '/customer-support') {
        filteredThreads = emailThreads.filter(thread => thread.category === 'customer-support');
      } else if (path === '/sent') {
        // For sent view, we'd need to modify this to show sent emails
        filteredThreads = emailThreads.filter(thread => 
          thread.replies.some(reply => reply.direction === 'outgoing' && reply.status === 'sent')
        );
      }
      
      return (
        <EmailListView 
          emailThreads={filteredThreads} 
          isLoading={isLoading}
          refetch={refetch}
        />
      );
    }
  };
  
  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
