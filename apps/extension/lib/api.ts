const API_BASE_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:3000';

const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'X-Pinggy-No-Screen': 'true',
  'Accept': 'application/json',
};

export async function registerEmail(subject: string, recipient: string, sender: string): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails`, {
      method: 'POST',
      headers: HEADERS,
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
  recipient: string;
  totalViews: number;
  uniqueIps: number;
  lastView: string | null;
  views: { viewedAt: string; ipAddress: string | null; userAgent: string | null }[];
};

export async function fetchTrackingData(subject: string): Promise<TrackingData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emails/search?subject=${encodeURIComponent(subject)}`, {
      headers: HEADERS,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
