
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Send, CornerDownLeft } from 'lucide-react';
import { Email, validateAndSendReply } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmailCardProps {
  email: Email;
  replies?: Email[];
  isOpen?: boolean;
  onOpen?: (emailId: string) => void;
  onReplySent?: () => void;
}

const getCategoryColor = (category: string = '') => {
  switch (category.toLowerCase()) {
    case 'lead':
      return 'bg-category-lead';
    case 'high-priority':
    case 'high priority':
      return 'bg-category-high-priority';
    case 'customer-support':
    case 'customer support':
      return 'bg-category-support';
    case 'marketing':
      return 'bg-category-marketing';
    case 'partnership':
      return 'bg-category-partnership';
    default:
      return 'bg-category-general';
  }
};

const getCategoryLabel = (category: string = '') => {
  switch (category.toLowerCase()) {
    case 'lead':
      return 'Lead';
    case 'high-priority':
    case 'high priority':
      return 'High Priority';
    case 'customer-support':
    case 'customer support':
      return 'Support';
    case 'marketing':
      return 'Marketing';
    case 'partnership':
      return 'Partnership';
    default:
      return 'General';
  }
};

const EmailCard = ({
  email,
  replies = [],
  isOpen,
  onOpen,
  onReplySent
}: EmailCardProps) => {
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState<Record<string, boolean>>({});
  
  const formattedDate = new Date(email.received_at);
  const isToday = new Date().toDateString() === formattedDate.toDateString();
  const displayDate = isToday 
    ? format(formattedDate, 'h:mm a') 
    : formattedDate.toDateString() === new Date(Date.now() - 86400000).toDateString() 
      ? 'Yesterday' 
      : format(formattedDate, 'MMM d');

  const handleValidate = (replyId: string) => {
    setIsValidated(prev => ({ ...prev, [replyId]: true }));
    toast.success('Reply validated');
  };

  const handleReject = (replyId: string) => {
    setIsValidated(prev => ({ ...prev, [replyId]: false }));
    toast.error('Reply rejected');
  };

  const handleSendReply = async (replyId: string) => {
    setSendingReplyId(replyId);
    const success = await validateAndSendReply(replyId);
    
    if (success && onReplySent) {
      onReplySent();
    }
    
    setSendingReplyId(null);
  };

  // Filter for draft replies that need validation
  const draftReplies = replies.filter(reply => 
    reply.direction === 'outgoing' && 
    reply.type === 'reply' && 
    reply.status === 'draft'
  );
  
  // Filter for sent replies to display
  const sentReplies = replies.filter(reply => 
    reply.direction === 'outgoing' && 
    reply.type === 'reply' && 
    reply.status === 'sent'
  );

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
            {email.category && (
              <Badge className={cn("text-white", getCategoryColor(email.category))}>
                {getCategoryLabel(email.category)}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {displayDate}
            </span>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold mb-2">{email.subject}</h2>
        
        <div className={cn("email-body transition-all overflow-hidden", isOpen ? "max-h-full" : "max-h-16")}>
          <p className={cn("text-muted-foreground whitespace-pre-line", !isOpen && "line-clamp-2")}>
            {email.body}
          </p>
          
          {/* Display draft replies that need validation */}
          {isOpen && draftReplies.length > 0 && draftReplies.map(reply => (
            <div key={reply.id} className="mt-6 p-4 rounded-lg border border-border dark:bg-neutral-800">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                  <span className="text-xs">AI</span>
                </div>
                <h4 className="font-medium">AI Suggested Reply</h4>
              </div>
              <p className="whitespace-pre-line text-sm">
                {reply.body}
              </p>
              
              {!isValidated[reply.id] ? (
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleValidate(reply.id);
                    }} 
                    className="gap-1 text-slate-50 bg-violet-600 hover:bg-violet-500"
                  >
                    <Check className="h-4 w-4" />
                    Validate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(reply.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <Button 
                    className="gap-1 w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendReply(reply.id);
                    }}
                    disabled={sendingReplyId === reply.id}
                  >
                    {sendingReplyId === reply.id ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Validate & Send
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {/* Display sent replies */}
          {isOpen && sentReplies.map(reply => (
            <div key={reply.id} className="mt-6 p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                  <CornerDownLeft className="h-3 w-3" />
                </div>
                <h4 className="font-medium">Your Reply</h4>
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(reply.received_at), 'h:mm a')}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm">
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailCard;
