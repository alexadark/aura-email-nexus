
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Check, X, Send, CornerDownLeft } from 'lucide-react';
import { Email } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmailCardProps {
  email: Email;
  isOpen?: boolean;
  onOpen?: (emailId: string) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'lead':
      return 'bg-category-lead';
    case 'high-priority':
      return 'bg-category-high-priority';
    case 'customer-support':
      return 'bg-category-support';
    case 'marketing':
      return 'bg-category-marketing';
    case 'partnership':
      return 'bg-category-partnership';
    default:
      return 'bg-category-general';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'lead':
      return 'Lead';
    case 'high-priority':
      return 'High Priority';
    case 'customer-support':
      return 'Support';
    case 'marketing':
      return 'Marketing';
    case 'partnership':
      return 'Partnership';
    default:
      return 'General';
  }
};

const EmailCard = ({ email, isOpen, onOpen }: EmailCardProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [replySubmitted, setReplySubmitted] = useState(false);
  
  const formattedDate = new Date(email.received_at);
  const isToday = new Date().toDateString() === formattedDate.toDateString();
  const displayDate = isToday 
    ? format(formattedDate, 'h:mm a')
    : formattedDate.toDateString() === new Date(Date.now() - 86400000).toDateString()
      ? 'Yesterday'
      : format(formattedDate, 'MMM d');
  
  const handleValidate = () => {
    setIsValidated(true);
    toast.success('Reply validated');
  };
  
  const handleReject = () => {
    setIsReplying(false);
    toast.error('Reply rejected');
  };
  
  const handleSendReply = () => {
    setReplySubmitted(true);
    toast.success('Reply sent successfully');
  };
  
  return (
    <Card 
      className={cn(
        "mb-4 email-card border-l-4 transition-all overflow-hidden",
        isOpen ? "border-l-primary" : "border-l-transparent"
      )}
      onClick={() => onOpen && onOpen(email.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden mr-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.sender_name)}&background=random`} 
              alt={email.sender_name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">
              {email.sender_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {email.sender_email}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Badge 
              className={cn(
                "text-white", 
                getCategoryColor(email.category)
              )}
            >
              {getCategoryLabel(email.category)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {displayDate}
            </span>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold mb-2">{email.subject}</h2>
        
        <div className={cn(
          "email-body transition-all overflow-hidden",
          isOpen ? "max-h-full" : "max-h-16"
        )}>
          <p className={cn(
            "text-muted-foreground whitespace-pre-line",
            !isOpen && "line-clamp-2"
          )}>
            {email.body}
          </p>
          
          {isOpen && email.langbase_reply && !replySubmitted && (
            <div className="mt-6 bg-accent/50 p-4 rounded-lg border border-border">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                  <span className="text-xs">AI</span>
                </div>
                <h4 className="font-medium">AI Suggested Reply</h4>
              </div>
              <p className="whitespace-pre-line text-sm">
                {email.langbase_reply}
              </p>
              
              {!isValidated && !isReplying && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={handleValidate}
                  >
                    <Check className="h-4 w-4" />
                    Validate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={handleReject}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {isValidated && !replySubmitted && (
            <div className="mt-4">
              <Button 
                className="gap-1 w-full"
                onClick={handleSendReply}
              >
                <Send className="h-4 w-4" />
                Send Reply
              </Button>
            </div>
          )}
          
          {replySubmitted && (
            <div className="mt-6 p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                  <CornerDownLeft className="h-3 w-3" />
                </div>
                <h4 className="font-medium">Your Reply</h4>
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(), 'h:mm a')}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm">
                {email.langbase_reply}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailCard;
