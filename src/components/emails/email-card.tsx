import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Send, CornerDownLeft, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { Email, validateAndSendReply } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmailDraft } from '@/components/emails/email-draft';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EmailCardProps {
  email: Email;
  replies: Email[];
  isOpen?: boolean;
  onOpen?: (emailId: string) => void;
  onReplySent?: () => void;
}

const getCategoryColor = (category: string = '') => {
  switch (category.toLowerCase()) {
    case 'lead':
      return 'bg-category-lead';
    case 'high priority':
      return 'bg-category-high-priority';
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
    case 'high priority':
      return 'High Priority';
    case 'customer support':
      return 'Customer Support';
    case 'marketing':
      return 'Marketing';
    case 'partnership':
      return 'Partnership';
    default:
      return 'General';
  }
};

function formatBody(body: string) {
  return body.replace(/\n/g, '<br />');
}

export default function EmailCard({
  email,
  replies,
  isOpen: propIsOpen,
  onOpen,
  onReplySent,
}: EmailCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState<Record<string, boolean>>({});

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (onOpen && !isOpen) {
      onOpen(email.id);
    }
  };

  const formattedDate = email.received_at 
    ? format(new Date(email.received_at), 'MMM d, yyyy h:mm a')
    : email.created_at
      ? format(new Date(email.created_at), 'MMM d, yyyy h:mm a')
      : '';

  // Sort the messages chronologically by timestamp
  const sortedMessages = [email, ...replies].sort((a, b) => {
    const dateA = a.received_at 
      ? new Date(a.received_at).getTime() 
      : a.created_at 
        ? new Date(a.created_at).getTime() 
        : 0;
    const dateB = b.received_at 
      ? new Date(b.received_at).getTime() 
      : b.created_at 
        ? new Date(b.created_at).getTime() 
        : 0;
    return dateA - dateB;
  });

  return (
    <Card className={cn(
      'mb-4 email-card border-l-4 transition-all',
      isOpen ? 'border-l-primary' : 'border-l-transparent'
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 cursor-pointer hover:bg-accent/50 flex items-center justify-between" onClick={handleToggle}>
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-center">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
            <div>
              <div className="font-medium">{email.sender_name || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[600px]">
                {email.subject || 'No subject'}
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col gap-6">
              {sortedMessages.map((msg) =>
                msg.status === 'draft' && msg.direction === 'outgoing' && msg.type === 'reply' ? (
                  <EmailDraft key={msg.id} email={msg} onReplySent={onReplySent} />
                ) : (
                  <div
                    key={msg.id}
                    className={cn(
                      'p-4 rounded-lg border border-border bg-background'
                    )}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                        <CornerDownLeft className="h-3 w-3" />
                      </div>
                      <h4 className="font-medium">
                        {msg.sender_name || 'Unknown'}
                      </h4>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {msg.received_at
                          ? format(new Date(msg.received_at), 'h:mm a')
                          : msg.created_at
                            ? format(new Date(msg.created_at), 'h:mm a')
                            : ''}
                      </span>
                    </div>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          msg.direction === 'incoming'
                            ? formatBody(msg.body || '')
                            : msg.body || ''
                      }}
                    />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
