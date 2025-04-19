
export interface Email {
  id: string;
  subject: string;
  body: string;
  sender_name: string;
  sender_email: string;
  received_at: string;
  category: 'lead' | 'high-priority' | 'customer-support' | 'general' | 'marketing' | 'partnership';
  subcategory?: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  status: 'new' | 'read' | 'replied' | 'archived';
  validated_at?: string;
  sent_at?: string;
  langbase_reply?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  industry: string;
  notes: string;
}

export const mockEmails: Email[] = [
  {
    id: "e1",
    subject: "Product Demo Request - Enterprise Plan",
    body: "Hello, I'm interested in scheduling a demo of your enterprise solution. Our team of 150+ employees is looking for a comprehensive CRM system that can integrate with our existing software. Can you provide more details about your enterprise plan and pricing?",
    sender_name: "Sarah Johnson",
    sender_email: "sarah.johnson@techcorp.com",
    received_at: "2025-04-19T10:42:00",
    category: "lead",
    thread_id: "t1",
    direction: "inbound",
    status: "new",
    langbase_reply: "Hi Sarah,\n\nThank you for your interest in our enterprise solution! I'd be happy to schedule a personalized demo for your team. Our enterprise plan includes comprehensive CRM features, unlimited users, advanced analytics, and premium integrations.\n\nWould you be available for a 30-minute demo call next Tuesday or Wednesday? I'll also send over our detailed enterprise pricing information for you to review beforehand.\n\nLooking forward to showing you how our solution can integrate with your existing software and meet your team's needs.\n\nBest regards,\n[Your Name]\nEnterprise Solutions Consultant"
  },
  {
    id: "e2",
    subject: "Urgent: API Integration Issues",
    body: "Hi Team,\n\nWe're experiencing critical issues with the API integration we set up last week. Our development team has noticed that approximately 30% of the requests are timing out, causing data synchronization problems between our systems.\n\nCould someone from your technical team look into this as soon as possible? This is affecting our production environment and causing issues for our customers.\n\nI've attached the error logs for your reference.\n\nBest regards,\nMichael Chen\nCTO, InnovaTech",
    sender_name: "Michael Chen",
    sender_email: "michael.chen@innovatech.co",
    received_at: "2025-04-18T15:27:00",
    category: "high-priority",
    thread_id: "t2",
    direction: "inbound",
    status: "read",
    langbase_reply: "Hi Michael,\n\nThank you for bringing this urgent issue to our attention. I understand the severity of API timeout errors and the impact they're having on your production environment.\n\nI've escalated this to our senior technical team, and they'll be investigating immediately. Our API specialist, David, will contact you directly within the next hour to work through the issue.\n\nIn the meantime, could you please provide any additional information about when this started occurring and if there were any changes made to your implementation recently?\n\nBest regards,\n[Your Name]\nTechnical Support Manager"
  },
  {
    id: "e3",
    subject: "Question about premium features",
    body: "I've been using your platform for a few months now and I'm considering upgrading to the premium plan. However, I have a few questions about some of the features mentioned on your website...",
    sender_name: "Emily Rodriguez",
    sender_email: "emily@globalretail.com",
    received_at: "2025-04-18T11:15:00",
    category: "customer-support",
    thread_id: "t3",
    direction: "inbound",
    status: "new",
    langbase_reply: "Hi Emily,\n\nThank you for your interest in our premium features! I'd be happy to address your questions and provide more details about our premium plan benefits.\n\nCould you please specify which particular features you're interested in learning more about? This way, I can provide you with the most relevant information for your needs.\n\nIn the meantime, I'd like to let you know that all premium plans include a 14-day free trial, so you can explore all the features before committing.\n\nLooking forward to helping you make the right choice for your needs!\n\nBest regards,\n[Your Name]\nCustomer Success Team"
  },
  {
    id: "e4",
    subject: "Partnership Opportunity - Joint Webinar Series",
    body: "Hello, I represent MarketPro, a leading digital marketing platform. I noticed that our companies serve similar audiences but with complementary products. I'd like to propose a joint webinar series that could...",
    sender_name: "James Wilson",
    sender_email: "james.wilson@marketpro.io",
    received_at: "2025-04-17T09:45:00",
    category: "marketing",
    subcategory: "partnership",
    thread_id: "t4",
    direction: "inbound",
    status: "read",
    langbase_reply: "Hi James,\n\nThank you for reaching out with this collaboration opportunity. A joint webinar series sounds like an excellent way to provide value to both our audiences.\n\nI'd be interested in discussing this further and exploring how we can structure these webinars to highlight the complementary aspects of our solutions. My calendar is open next week for an initial brainstorming call.\n\nCould you share some thoughts on potential topics and your expectations for this partnership?\n\nLooking forward to potentially working together!\n\nBest regards,\n[Your Name]\nPartnership Manager"
  },
  {
    id: "e5",
    subject: "Invoice #INV-2025-0342",
    body: "Please find attached the invoice for your recent subscription renewal. The payment is due by April 15, 2025. If you have any questions regarding this invoice or if you require any changes...",
    sender_name: "Lisa Thompson",
    sender_email: "lisa.thompson@edulearn.org",
    received_at: "2025-04-16T14:20:00",
    category: "general",
    thread_id: "t5",
    direction: "inbound",
    status: "new",
    langbase_reply: "Hi Lisa,\n\nThank you for sending the invoice for our subscription renewal. I've received the attached document and will process the payment before the April 15 deadline.\n\nJust to confirm - this is for our team's annual plan with 25 user licenses, correct? I want to ensure we're on the same page regarding the renewal terms.\n\nPlease let me know if there's anything else needed from our end to complete this process smoothly.\n\nBest regards,\n[Your Name]\nAccounts Payable"
  }
];

export const mockLeads: Lead[] = [
  {
    id: "l1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    industry: "Technology",
    notes: "Enterprise client, interested in full CRM suite, team of 150+ employees"
  },
  {
    id: "l2",
    name: "Michael Chen",
    email: "michael.chen@innovatech.co",
    industry: "Software Development",
    notes: "Using our API integration, having technical issues with timeouts"
  },
  {
    id: "l3",
    name: "Emily Rodriguez",
    email: "emily@globalretail.com",
    industry: "Retail",
    notes: "Current user considering premium plan upgrade"
  },
  {
    id: "l4",
    name: "James Wilson",
    email: "james.wilson@marketpro.io",
    industry: "Marketing",
    notes: "Potential partnership opportunity, joint webinar series"
  },
  {
    id: "l5",
    name: "Lisa Thompson",
    email: "lisa.thompson@edulearn.org",
    industry: "Education",
    notes: "Current client, subscription renewal in process"
  }
];
