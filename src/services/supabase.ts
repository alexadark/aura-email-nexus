import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export interface Email {
  id: string;
  subject: string | null;
  body: string | null;
  sender_name: string | null;
  sender_email: string | null;
  thread_id: string | null;
  received_at: string | null;
  direction: string; // Changed from literal type to string to match Supabase
  type: string; // Changed from literal type to string to match Supabase
  category?: string | null;
  subcategory?: string | null;
  status?: string | null;
  sent_at?: string | null;
  validated_at?: string | null;
  created_at?: string | null;
}

export interface EmailThread {
  threadId: string;
  originalEmail: Email;
  replies: Email[];
  category: string;
  hasUnreadReplies: boolean;
}

// Function to fetch emails from Supabase
export const fetchEmails = async (): Promise<EmailThread[]> => {
  try {
    // Fetch emails with specified categories
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .in('category', ['lead', 'high priority', 'customer support'])
      .order('received_at', { ascending: true });

    if (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No emails found');
      return [];
    }

    // Group emails by thread_id
    const threadMap = new Map<string, Email[]>();
    
    data.forEach((email) => {
      if (email.thread_id && !threadMap.has(email.thread_id)) {
        threadMap.set(email.thread_id, []);
      }
      if (email.thread_id) {
        threadMap.get(email.thread_id)?.push(email as Email);
      }
    });

    // Create EmailThread objects
    const threads: EmailThread[] = [];
    
    threadMap.forEach((emails, threadId) => {
      // Find the original email
      const originalEmail = emails.find(
        email => email.direction === 'incoming' && email.type === 'original'
      );
      
      if (originalEmail) {
        // Get replies
        const replies = emails.filter(
          email => (email.direction === 'outgoing' && email.type === 'reply') || 
                  (email.direction === 'incoming' && email.type !== 'original')
        );
        
        // Sort replies by received_at
        replies.sort((a, b) => {
          const dateA = a.received_at ? new Date(a.received_at).getTime() : 0;
          const dateB = b.received_at ? new Date(b.received_at).getTime() : 0;
          return dateA - dateB;
        });
        
        // Check if there are any draft replies
        const hasUnreadReplies = replies.some(reply => reply.status === 'draft');
        
        threads.push({
          threadId,
          originalEmail,
          replies,
          category: originalEmail.category || 'other',
          hasUnreadReplies
        });
      }
    });

    // Sort threads - leads and high priority first, then by received_at
    threads.sort((a, b) => {
      // First, prioritize threads by category
      if (a.category === 'lead' && b.category !== 'lead') return -1;
      if (a.category !== 'lead' && b.category === 'lead') return 1;
      if (a.category === 'high priority' && b.category !== 'high priority') return -1;
      if (a.category !== 'high priority' && b.category === 'high priority') return 1;
      
      // Then, sort by received_at (most recent first)
      const dateA = a.originalEmail.received_at ? new Date(a.originalEmail.received_at).getTime() : 0;
      const dateB = b.originalEmail.received_at ? new Date(b.originalEmail.received_at).getTime() : 0;
      return dateB - dateA;
    });

    return threads;
  } catch (error) {
    console.error('Error processing emails:', error);
    toast.error('Failed to process emails');
    return [];
  }
};

// Function to update a draft reply
export const updateDraftReply = async (replyId: string, newBody: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('emails')
      .update({ body: newBody })
      .eq('id', replyId)
      .eq('status', 'draft');

    if (error) {
      console.error('Error updating draft reply:', error);
      toast.error('Failed to update draft');
      return false;
    }

    toast.success('Draft updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating draft:', error);
    toast.error('Failed to update draft');
    return false;
  }
};

// Function to validate and send a reply
export const validateAndSendReply = async (replyId: string): Promise<boolean> => {
  try {
    // Send request to N8N webhook
    const response = await fetch('https://cutzai.app.n8n.cloud/webhook/bc8ded86-23ec-467e-8be0-396326476b50', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: replyId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    // Update the reply status in Supabase
    const { error } = await supabase
      .from('emails')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', replyId);

    if (error) {
      console.error('Error updating reply status:', error);
      toast.error('Failed to update reply status');
      return false;
    }

    toast.success('Reply sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending reply:', error);
    toast.error('Failed to send reply');
    return false;
  }
};
