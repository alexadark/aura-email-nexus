
import { Mail, Users, PercentCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockEmails } from '@/data/mock-data';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  iconClass,
  changePositive = true
}: { 
  title: string; 
  value: string | number; 
  change: string;
  icon: React.ElementType;
  iconClass?: string;
  changePositive?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className={cn(
              "text-xs flex items-center mt-1",
              changePositive ? "text-green-500" : "text-red-500"
            )}>
              {changePositive ? '↑' : '↓'} {change} from last week
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconClass || "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              iconClass ? "text-white" : "text-primary"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsCards = () => {
  const totalEmails = mockEmails.length;
  const newLeads = mockEmails.filter(e => e.category === 'lead').length;
  const aiSuggestions = mockEmails.filter(e => e.langbase_reply).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Emails" 
        value={245}
        change="12%" 
        icon={Mail}
      />
      <StatCard 
        title="New Leads" 
        value={28}
        change="8%" 
        icon={Users}
        iconClass="bg-category-lead"
      />
      <StatCard 
        title="Response Rate" 
        value="92%"
        change="3%" 
        changePositive={false}
        icon={PercentCircle}
        iconClass="bg-purple-500"
      />
      <StatCard 
        title="AI Suggestions" 
        value={187}
        change="156 approved (83%)" 
        icon={Sparkles}
        iconClass="bg-amber-500"
      />
    </div>
  );
};

export default StatsCards;
