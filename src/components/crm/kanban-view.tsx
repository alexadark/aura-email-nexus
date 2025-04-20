
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Lead } from "@/data/mock-data";

const LEAD_STATUSES = ["New", "Contacted", "Meeting", "Proposal", "Closed"] as const;

interface KanbanColumnProps {
  title: string;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const KanbanColumn = ({ title, leads, onSelectLead }: KanbanColumnProps) => (
  <div className="flex flex-col gap-3 min-w-[300px]">
    <div className="flex items-center justify-between py-2 px-4 bg-secondary rounded-lg">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-sm text-muted-foreground">{leads.length}</span>
    </div>
    <div className="flex flex-col gap-2">
      {leads.map((lead) => (
        <Card 
          key={lead.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectLead(lead)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
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

const KanbanView = ({ leads, onSelectLead }: { leads: Lead[], onSelectLead: (lead: Lead) => void }) => {
  // Group leads by status (in a real app, status would come from the database)
  const groupedLeads = LEAD_STATUSES.reduce((acc, status) => {
    // For demo, randomly distribute leads across statuses
    acc[status] = leads.filter((_, idx) => idx % LEAD_STATUSES.length === LEAD_STATUSES.indexOf(status));
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-6">Lead Pipeline</h2>
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max">
          {LEAD_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              title={status}
              leads={groupedLeads[status]}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanView;
