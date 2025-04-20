
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Since we're not using mock-data anymore, define Lead inline
interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  industry: string | null;
  notes: string | null;
  status: string;
  type?: string | null;
  company?: string;
  assignedTo?: string;
  lastContact?: string;
  phone?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

const LeadsTable = ({ leads, onSelectLead }: LeadsTableProps) => {
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  
  const handleEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditData({ industry: lead.industry, notes: lead.notes });
  };
  
  const handleChange = (field: keyof Lead, value: string) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };
  
  const handleSave = (leadId: string) => {
    // In a real app, this would update the data in the backend
    toast.success('Lead information updated');
    setEditingLeadId(null);
  };
  
  const isEditing = (leadId: string) => editingLeadId === leadId;
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[250px]">Email</TableHead>
            <TableHead className="w-[150px]">Industry</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectLead && onSelectLead(lead)}
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>
                {isEditing(lead.id) ? (
                  <Input 
                    value={editData.industry || ''}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div 
                    className="hover:bg-muted p-1 rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(lead);
                    }}
                  >
                    {lead.industry}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {isEditing(lead.id) ? (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input 
                      value={editData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="flex-1"
                    />
                    <button 
                      className="text-sm text-primary font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(lead.id);
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div 
                    className="hover:bg-muted p-1 rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(lead);
                    }}
                  >
                    {lead.notes}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
