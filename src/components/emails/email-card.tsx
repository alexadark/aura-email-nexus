import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Send, CornerDownLeft, Edit } from 'lucide-react';
import { Email, validateAndSendReply } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmailDraft } from '@/components/emails/email-draft';

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
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return body.replace(/\n/g, '<br />');
}

export default function EmailCard({
  email,
  replies,
  isOpen,
  onOpen,
  onReplySent,
}: EmailCardProps) {
  console.log('EmailCard', { email, replies });
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState<Record<string, boolean>>({});

  const handleValidate = (replyId: string) => {
    setIsValidated((prev) => ({ ...prev, [replyId]: true }));
    toast.success('Reply validated');
  };

  const handleReject = (replyId: string) => {
    setIsValidated((prev) => ({ ...prev, [replyId]: false }));
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

  // Sort all messages (original + replies) by received_at


  return (
    <Card
      className={cn(
        'mb-4 email-card border-l-4 transition-all overflow-hidden',
        isOpen ? 'border-l-primary' : 'border-l-transparent'
      )}
      onClick={() => onOpen && onOpen(email.id)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-6">
          {[email, ...replies].map((msg) =>
            msg.status === 'draft' && msg.direction === 'outgoing' && msg.type === 'reply' ? (
              <EmailDraft key={msg.id} email={msg} onReplySent={onReplySent} />
            ) : (
              <div
                key={msg.id}
                className={cn(
                  'p-4 rounded-lg border border-border bg-background',
                  '' // remove isOriginal logic, as all messages are in order
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
                  dangerouslySetInnerHTML={{ __html: formatBody(msg.body || '') }}
                />
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};


