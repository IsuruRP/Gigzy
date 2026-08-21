export type GigCategory =
  | 'All'
  | 'Tech & Coding'
  | 'Design & Creative'
  | 'Writing & Translation'
  | 'Events & Hospitality'
  | 'Tutoring & Teaching'
  | 'Marketing & Social Media'
  | 'Photo & Video'
  | 'Other';

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: GigCategory | string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  location: string;
  isRemote: boolean;
  clientName: string;
  clientId: string;
  clientAvatar?: string;
  clientRating?: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  tags: string[];
  deadline?: string;
  duration?: string;
  applicantsCount?: number;
  createdAt: any;
}
