
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Lead } from "@/data/mock-data";
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const LEAD_STATUSES = ["New", "Contacted", "Meeting", "Proposal", "Closed"] as const;
type LeadStatus = typeof LEAD_STATUSES[number];

interface KanbanColumnProps {
  title: string;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDragStart: (lead: Lead, status: string) => void;
  onDrop: (status: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanColumn = ({ 
  title, 
  leads, 
  onSelectLead, 
  onDragStart, 
  onDrop, 
  onDragOver 
}: KanbanColumnProps) => (
  <div 
    className="flex flex-col gap-3 min-w-[250px] w-full"
    onDragOver={(e) => {
      e.preventDefault();
      onDragOver(e);
    }}
    onDrop={() => onDrop(title)}
  >
    <div className="flex items-center justify-between py-2 px-4 bg-secondary rounded-lg">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-sm text-muted-foreground">{leads.length}</span>
    </div>
    <div className="flex flex-col gap-2">
      {leads.map((lead) => (
        <Card 
          key={lead.id} 
          className="cursor-move hover:shadow-md transition-shadow"
          onClick={() => onSelectLead(lead)}
          draggable
          onDragStart={() => onDragStart(lead, title)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">{lead.name}</h4>
                <p className="text-sm text-muted-foreground">{lead.industry}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const KanbanView = ({ 
  leads,
  onSelectLead 
}: { 
  leads: Lead[], 
  onSelectLead: (lead: Lead) => void 
}) => {
  const isMobile = useIsMobile();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string>('');
  const [leadsByStatus, setLeadsByStatus] = useState(() => {
    // Initialize groupedLeads based on status
    return LEAD_STATUSES.reduce((acc, status) => {
      // For demo, randomly distribute leads across statuses
      acc[status] = leads.filter((_, idx) => idx % LEAD_STATUSES.length === LEAD_STATUSES.indexOf(status));
      return acc;
    }, {} as Record<string, Lead[]>);
  });
  
  const handleDragStart = (lead: Lead, status: string) => {
    setDraggedLead(lead);
    setSourceStatus(status);
  };
  
  const handleDrop = (targetStatus: string) => {
    if (draggedLead && sourceStatus !== targetStatus) {
      // Remove from source column
      const sourceLeads = leadsByStatus[sourceStatus].filter(
        lead => lead.id !== draggedLead.id
      );
      
      // Add to target column
      const targetLeads = [...leadsByStatus[targetStatus], draggedLead];
      
      // Update state
      setLeadsByStatus({
        ...leadsByStatus,
        [sourceStatus]: sourceLeads,
        [targetStatus]: targetLeads,
      });
    }
    
    // Reset drag state
    setDraggedLead(null);
    setSourceStatus('');
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-6">Lead Pipeline</h2>
      
      <div className="overflow-x-auto pb-6">
        {isMobile ? (
          // Mobile view - scrollable columns
          <div className="flex gap-4 min-w-max pb-4">
            {LEAD_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                title={status}
                leads={leadsByStatus[status]}
                onSelectLead={onSelectLead}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            ))}
          </div>
        ) : (
          // Desktop view - resizable panels
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[500px] rounded-lg border"
          >
            {LEAD_STATUSES.map((status, index) => (
              <>
                <ResizablePanel key={status} defaultSize={100 / LEAD_STATUSES.length}>
                  <div className="p-3 h-full">
                    <KanbanColumn
                      title={status}
                      leads={leadsByStatus[status]}
                      onSelectLead={onSelectLead}
                      onDragStart={handleDragStart}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    />
                  </div>
                </ResizablePanel>
                {index < LEAD_STATUSES.length - 1 && (
                  <ResizableHandle withHandle />
                )}
              </>
            ))}
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default KanbanView;
