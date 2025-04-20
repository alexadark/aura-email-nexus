
import { Mail, Users, PercentCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  iconClass,
  changePositive = true,
  isLoading = false
}: { 
  title: string; 
  value: string | number; 
  change: string;
  icon: React.ElementType;
  iconClass?: string;
  changePositive?: boolean;
  isLoading?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
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
  // Fetch email statistics from Supabase
  const { data: stats, isLoading } = useQuery({
    queryKey: ['emailStats'],
    queryFn: async () => {
      try {
        // Query for total emails
        const { data: totalData, error: totalError } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        const totalCount = totalData ? (totalData as any).count || 0 : 0;
        
        // Query for lead emails
        const { data: leadData, error: leadError } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'lead');
        
        if (leadError) throw leadError;
        const leadCount = leadData ? (leadData as any).count || 0 : 0;
        
        // Query for AI suggestions (draft replies)
        const { data: draftData, error: draftError } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft')
          .eq('direction', 'outgoing')
          .eq('type', 'reply');
        
        if (draftError) throw draftError;
        const draftCount = draftData ? (draftData as any).count || 0 : 0;
        
        // Query for sent replies
        const { data: sentData, error: sentError } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent')
          .eq('direction', 'outgoing')
          .eq('type', 'reply');
        
        if (sentError) throw sentError;
        const sentCount = sentData ? (sentData as any).count || 0 : 0;
        
        // Calculate response rate
        const responseRate = sentCount + draftCount > 0
          ? Math.round((sentCount / (sentCount + draftCount)) * 100)
          : 0;
        
        return {
          totalCount,
          leadCount,
          draftCount,
          sentCount,
          responseRate
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
          totalCount: 0,
          leadCount: 0,
          draftCount: 0,
          sentCount: 0,
          responseRate: 0
        };
      }
    },
    refetchInterval: 60000 // Refetch every minute
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Emails" 
        value={stats?.totalCount || 0}
        change="12%" 
        icon={Mail}
        isLoading={isLoading}
      />
      <StatCard 
        title="New Leads" 
        value={stats?.leadCount || 0}
        change="8%" 
        icon={Users}
        iconClass="bg-category-lead"
        isLoading={isLoading}
      />
      <StatCard 
        title="Response Rate" 
        value={`${stats?.responseRate || 0}%`}
        change="3%" 
        changePositive={false}
        icon={PercentCircle}
        iconClass="bg-purple-500"
        isLoading={isLoading}
      />
      <StatCard 
        title="AI Suggestions" 
        value={stats?.draftCount || 0}
        change={`${stats?.sentCount || 0} approved`} 
        icon={Sparkles}
        iconClass="bg-amber-500"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsCards;
