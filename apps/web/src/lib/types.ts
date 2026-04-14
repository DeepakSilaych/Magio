export type ViewLog = {
  id: string;
  viewedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type Email = {
  id: string;
  subject: string;
  recipient: string;
  sender: string;
  createdAt: Date;
  views: ViewLog[];
};

export type SortKey = 'createdAt' | 'views' | 'subject' | 'recipient';
export type SortDir = 'asc' | 'desc';

export type DashboardStats = {
  totalEmails: number;
  totalViews: number;
  uniqueIps: number;
  avgViewsPerEmail: number;
  viewsToday: number;
  emailsToday: number;
};

export type IpGroup = {
  ip: string;
  views: ViewLog[];
  lastSeen: Date;
  userAgent: string;
};
