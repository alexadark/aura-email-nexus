
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateDraftReply, validateAndSendReply } from '@/services/supabase';
import { toast } from 'sonner';
import type { Email } from '@/services/supabase';
import { Send, Check, X } from 'lucide-react';

interface EmailDraftProps {
  email: Email;
  onReplySent: () => void;
}

export const EmailDraft = ({ email, onReplySent }: EmailDraftProps) => {
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode by default
  const [draftBody, setDraftBody] = useState(email.body || '');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load the draft content whenever the email changes
  useEffect(() => {
    setDraftBody(email.body || '');
  }, [email.id, email.body]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateDraftReply(email.id, draftBody);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
      toast.success('Draft saved successfully');
    } else {
      toast.error('Failed to save draft');
    }
  };

  const handleCancel = () => {
    setDraftBody(email.body || '');
    setIsEditing(false);
  };

  const handleSend = async () => {
    // First save if in editing mode
    if (isEditing) {
      setIsSaving(true);
      const saveSuccess = await updateDraftReply(email.id, draftBody);
      setIsSaving(false);
      
      if (!saveSuccess) {
        toast.error('Failed to save draft before sending');
        return;
      }
    }
    
    setIsSending(true);
    const success = await validateAndSendReply(email.id);
    setIsSending(false);
    if (success) {
      toast.success('Email sent successfully');
      onReplySent();
    } else {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI-Generated Draft Reply</h3>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            Edit Draft
          </Button>
        )}
      </div>

      {isEditing ? (
        <>
          <Textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            className="min-h-[200px]"
            placeholder="Type your reply here..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              size="sm"
              disabled={isSaving}
              className="mr-2"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
              {!isSaving && <Check className="ml-2 h-4 w-4" />}
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending || isSaving}
            >
              {isSending ? 'Sending...' : 'Send'}
              {!isSending && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="whitespace-pre-wrap text-sm border border-transparent p-2 rounded-md bg-background/50">{draftBody}</div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSend} 
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Validate & Send'}
              {!isSending && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
