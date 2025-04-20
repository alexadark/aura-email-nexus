
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Editor } from '@tinymce/tinymce-react';
import { updateDraftReply, validateAndSendReply } from '@/services/supabase';
import { toast } from 'sonner';
import type { Email } from '@/services/supabase';
import { Send, Check, X, Edit } from 'lucide-react';

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
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setDraftBody(email.body || '');
    setIsValidated(false);
  }, [email.id, email.body]);

  const handleEdit = () => {
    setIsEditing(true);
    setIsValidated(false);
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
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      setDraftBody(content);
      setIsValidated(true);
      setIsEditing(false);
      toast.success('Content validated');
    }
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
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit Draft
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={draftBody}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
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
          <div className="whitespace-pre-wrap text-sm border border-transparent p-2 rounded-md bg-background/50">
            {draftBody}
          </div>
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
