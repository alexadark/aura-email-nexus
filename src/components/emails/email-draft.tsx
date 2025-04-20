
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { updateDraftReply, validateAndSendReply } from '@/services/supabase';
import { toast } from 'sonner';
import type { Email } from '@/services/supabase';
import { Send, Check, X, Edit } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/rich-text';

interface EmailDraftProps {
  email: Email;
  onReplySent: (() => void) | undefined;
}

export const EmailDraft = ({ email, onReplySent }: EmailDraftProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(email.body || '');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Add key to force re-render the editor

  useEffect(() => {
    setDraftBody(email.body || '');
    setIsValidated(false);
    // Increment the key when email changes to force editor re-initialization
    setEditorKey(prev => prev + 1);
  }, [email.id, email.body]);

  const handleEdit = () => {
    setIsEditing(true);
    setIsValidated(false);
  };

  const handleContentChange = (html: string) => {
    setDraftBody(html);
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

  const handleValidate = () => {
    setIsValidated(true);
    setIsEditing(false);
    toast.success('Content validated');
  };

  const handleCancel = () => {
    setDraftBody(email.body || '');
    setIsEditing(false);
    setIsValidated(false);
  };

  const handleSend = async () => {
    if (!isValidated) {
      toast.error('Please validate the content before sending');
      return;
    }
    
    setIsSending(true);
    const success = await validateAndSendReply(email.id);
    setIsSending(false);
    
    if (success) {
      toast.success('Email sent successfully');
      if (onReplySent) {
        onReplySent();
      }
      setIsValidated(false);
    } else {
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-2">
            <span className="text-xs">AI</span>
          </div>
          <h3 className="text-sm font-medium">AI-Generated Draft Reply</h3>
        </div>
        {!isEditing && !isValidated && (
          <Button onClick={handleEdit} variant="secondary" size="sm" className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <RichTextEditor
            key={editorKey} // Use key to force re-render when email changes
            initialContent={draftBody}
            onChange={handleContentChange}
            className="min-h-[300px]"
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel} 
              disabled={isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              size="sm"
              disabled={isSaving}
              className="mr-2"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={handleValidate}
              size="sm"
              disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Validate
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-background/50 p-4 border"
            dangerouslySetInnerHTML={{ __html: draftBody }}
          />
          <div className="flex justify-end gap-2">
            {!isValidated && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {isValidated && (
              <Button 
                onClick={handleSend} 
                disabled={isSending}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                {isSending ? 'Sending...' : 'Send'}
                {!isSending && <Send className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
