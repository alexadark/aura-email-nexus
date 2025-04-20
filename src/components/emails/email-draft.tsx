
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateDraftReply, validateAndSendReply } from '@/services/supabase';
import type { Email } from '@/services/supabase';

interface EmailDraftProps {
  email: Email;
  onReplySent: () => void;
}

export const EmailDraft = ({ email, onReplySent }: EmailDraftProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(email.body || '');
  const [isSending, setIsSending] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const success = await updateDraftReply(email.id, draftBody);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDraftBody(email.body || '');
    setIsEditing(false);
  };

  const handleSend = async () => {
    setIsSending(true);
    const success = await validateAndSendReply(email.id);
    setIsSending(false);
    if (success) {
      onReplySent();
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
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Draft
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="whitespace-pre-wrap text-sm">{draftBody}</div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSend} 
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Validate & Send'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
