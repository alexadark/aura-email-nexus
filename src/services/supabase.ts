
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-supabase-anon-key';

// Check if we're in development environment without proper env variables
const isDevelopmentWithoutEnv = 
  import.meta.env.DEV && 
  (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_KEY);

// Create a mock Supabase client for development without env variables
const mockSupabaseClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        in: () => ({
          order: () => ({
            data: [],
            error: null,
            count: 0
          })
        }),
        count: () => ({ count: 0, error: null })
      }),
      in: () => ({
        order: () => ({ data: [], error: null })
      }),
      count: () => ({ count: 0, error: null })
    }),
    update: () => ({
      eq: () => ({ error: null })
    })
  })
} as unknown as SupabaseClient;

export const supabase = isDevelopmentWithoutEnv 
  ? mockSupabaseClient
  : createClient(supabaseUrl, supabaseKey);

export interface Email {
  id: string;
  subject: string;
  body: string;
  sender_name: string;
  sender_email: string;
  thread_id: string;
  received_at: string;
  direction: 'incoming' | 'outgoing';
  type: 'original' | 'reply';
  category?: 'lead' | 'high-priority' | 'customer-support' | string;
  subcategory?: string;
  status?: 'draft' | 'sent';
  langbase_reply?: string;
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
    if (isDevelopmentWithoutEnv) {
      console.warn('Development environment detected without Supabase credentials. Using mock data.');
      toast.warning('Using mock data - connect to Supabase for real data', {
        duration: 5000,
        id: 'supabase-warning',
      });
      return [];
    }

    // Fetch emails with specified categories
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .in('category', ['lead', 'high-priority', 'customer-support'])
      .order('received_at', { ascending: true });

    if (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
      return [];
    }

    // Group emails by thread_id
    const threadMap = new Map<string, Email[]>();
    
    data.forEach((email: Email) => {
      if (!threadMap.has(email.thread_id)) {
        threadMap.set(email.thread_id, []);
      }
      threadMap.get(email.thread_id)?.push(email);
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
        replies.sort((a, b) => 
          new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
        );
        
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
      if (a.category === 'high-priority' && b.category !== 'high-priority') return -1;
      if (a.category !== 'high-priority' && b.category === 'high-priority') return 1;
      
      // Then, sort by received_at
      return new Date(b.originalEmail.received_at).getTime() - 
             new Date(a.originalEmail.received_at).getTime();
    });

    return threads;
  } catch (error) {
    console.error('Error processing emails:', error);
    toast.error('Failed to process emails');
    return [];
  }
};

// Function to validate and send a reply
export const validateAndSendReply = async (replyId: string): Promise<boolean> => {
  try {
    if (isDevelopmentWithoutEnv) {
      console.warn('Development environment detected without Supabase credentials. Mocking reply send.');
      toast.success('Reply sent successfully (mocked)');
      return true;
    }

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
      .update({ status: 'sent' })
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
