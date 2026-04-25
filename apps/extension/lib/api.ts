const API_BASE_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:3000';

const POST_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'X-Pinggy-No-Screen': 'true',
  'Accept': 'application/json',
};

export async function registerEmail(subject: string, recipient: string, sender: string): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails`, {
      method: 'POST',
      headers: POST_HEADERS,
      body: JSON.stringify({ subject, recipient, sender }),
    });
    if (res.ok) return res.json();
    console.error('[Magio] Server error:', await res.text());
    return null;
  } catch (err) {
    console.error('[Magio] Network error:', err);
    return null;
  }
}

export function getPixelUrl(emailId: string): string {
  return `${API_BASE_URL}/api/track/${emailId}.gif`;
}

export type TrackingData = {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  totalViews: number;
  uniqueIps: number;
  lastView: string | null;
  views: {
    viewedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    browser?: string | null;
    os?: string | null;
    device?: string | null;
  }[];
};

export async function fetchTrackingData(subject: string): Promise<TrackingData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails/search?subject=${encodeURIComponent(subject)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteLatestTrackingView(emailId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails/${emailId}/views/latest`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export type EmailStatus = { subject: string; viewCount: number };

export async function fetchAllTrackingStatuses(): Promise<EmailStatus[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails`);
    if (!res.ok) return [];
    const emails: { subject: string; views: unknown[] }[] = await res.json();
    return emails.map((e) => ({ subject: e.subject, viewCount: e.views.length }));
  } catch {
    return [];
  }
}
