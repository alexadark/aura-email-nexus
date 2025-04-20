
import { useState } from 'react';
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
import { fetchEmails, EmailThread } from '@/services/supabase';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

// Type definition for Lead, compatible with components from Supabase and our UI components
interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  company?: string;
  status: string;  // Required for the CRM components
  assignedTo?: string;
  lastContact?: string;
  phone?: string;
  type?: string | null;
  industry: string | null;
  notes: string | null;
  created_at?: string | null;
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
  
  // Fetch leads from Supabase
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('crm_leads')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Map the data to match the Lead interface
        return data.map((lead: any): Lead => ({
          id: lead.id || '',
          name: lead.name || '',
          email: lead.email || '',
          company: '',
          status: lead.type || 'New', // Use type as status or default to 'New'
          assignedTo: '',
          lastContact: '',
          phone: '',
          type: lead.type || '',
          industry: lead.industry || '',
          notes: lead.notes || ''
        }));
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    }
  });
  
  // Function to handle lead selection
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };
  
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
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <LeadsTable 
          leads={leads} 
          onSelectLead={handleSelectLead}
        />
      ) : (
        <KanbanView 
          leads={leads}
          onSelectLead={handleSelectLead}
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
        filteredThreads = emailThreads.filter(thread => 
          thread.category.toLowerCase() === 'lead'
        );
      } else if (path === '/high-priority') {
        filteredThreads = emailThreads.filter(thread => 
          thread.category.toLowerCase() === 'high priority'
        );
      } else if (path === '/customer-support') {
        filteredThreads = emailThreads.filter(thread => 
          thread.category.toLowerCase() === 'customer support'
        );
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
