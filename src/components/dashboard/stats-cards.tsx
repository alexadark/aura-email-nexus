
import { Mail, Users, PercentCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
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
        const totalCountResult = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true });
        
        const totalCount = totalCountResult.count || 0;
        const totalError = totalCountResult.error;
        
        // Query for lead emails
        const leadCountResult = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'lead');
        
        const leadCount = leadCountResult.count || 0;
        const leadError = leadCountResult.error;
        
        // Query for AI suggestions (draft replies)
        const draftCountResult = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft')
          .eq('direction', 'outgoing')
          .eq('type', 'reply');
        
        const draftCount = draftCountResult.count || 0;
        const draftError = draftCountResult.error;
        
        // Query for sent replies
        const sentCountResult = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent')
          .eq('direction', 'outgoing')
          .eq('type', 'reply');
        
        const sentCount = sentCountResult.count || 0;
        const sentError = sentCountResult.error;
        
        if (totalError || leadError || draftError || sentError) {
          throw new Error('Failed to fetch email statistics');
        }
        
        // Calculate response rate
        const responseRate = (draftCount || sentCount)
          ? Math.round((sentCount / (draftCount + sentCount)) * 100)
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
    }
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
