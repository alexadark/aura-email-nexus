import { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import EmailCard from '@/components/emails/email-card';
import StatsCards from '@/components/dashboard/stats-cards';
import LeadsTable from '@/components/crm/leads-table';
import KanbanView from '@/components/crm/kanban-view';
import LeadDetail from '@/components/crm/lead-detail';
import { mockEmails, mockLeads, Lead } from '@/data/mock-data';

const EmailListView = ({ emails, title }: { emails: typeof mockEmails, title?: string }) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  return (
    <div>
      <StatsCards />
      <div className="space-y-4">
        {emails.map((email) => (
          <EmailCard 
            key={email.id} 
            email={email}
            isOpen={selectedEmailId === email.id}
            onOpen={setSelectedEmailId}
          />
        ))}
      </div>
    </div>
  );
};

const CRMView = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
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
          leads={mockLeads} 
          onSelectLead={setSelectedLead}
        />
      ) : (
        <KanbanView 
          leads={mockLeads}
          onSelectLead={setSelectedLead}
        />
      )}
    </div>
  );
};

const Index = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
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
