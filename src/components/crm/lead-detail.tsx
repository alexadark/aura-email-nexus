
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Email } from '@/services/supabase';
import EmailCard from '@/components/emails/email-card';
import { toast } from 'sonner';

// Define the Lead interface compatible with the app
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
  industry: string;
  notes: string;
}

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
}

const LeadDetail = ({ lead, onBack }: LeadDetailProps) => {
  const [notes, setNotes] = useState(lead.notes);
  
  // Placeholder for lead emails - in real app, would fetch from Supabase
  const leadEmails: Email[] = [];
  
  const handleSaveNotes = () => {
    // In a real app, this would save to backend
    toast.success('Notes updated successfully');
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to leads
        </Button>
        <h2 className="text-xl font-bold">Lead Details</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=random`} 
                    alt={lead.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Industry</div>
                <div className="p-2 bg-secondary rounded">{lead.industry}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Notes</div>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  className="mt-2 w-full"
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Communication History</h3>
          {leadEmails.length > 0 ? (
            <div className="space-y-4">
              {leadEmails.map(email => (
                <EmailCard 
                  key={email.id}
                  email={email}
                  isOpen={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No email history found for this lead.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
