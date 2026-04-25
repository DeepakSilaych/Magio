type LocationLookup = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
};

type ViewDetails = {
  city?: string;
  region?: string;
  country?: string;
  browser: string;
  os: string;
  device: string;
};

function parseBrowser(userAgent: string): string {
  if (/GoogleImageProxy/i.test(userAgent)) return 'Gmail proxy';
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/CriOS\//.test(userAgent)) return 'Chrome iOS';
  if (/Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Unknown browser';
}

function parseOs(userAgent: string): string {
  if (/GoogleImageProxy/i.test(userAgent)) return 'Proxy';
  if (/Windows NT 10/i.test(userAgent)) return 'Windows';
  if (/Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Unknown OS';
}

function parseDevice(userAgent: string): string {
  if (/GoogleImageProxy/i.test(userAgent)) return 'Image proxy';
  if (/iPad|Tablet/i.test(userAgent)) return 'Tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return 'Mobile';
  return 'Desktop';
}

function isLookupableIp(ipAddress?: string): boolean {
  if (!ipAddress || ipAddress === 'unknown') return false;
  if (ipAddress === '127.0.0.1' || ipAddress === '::1') return false;
  if (/^(10|192\.168)\./.test(ipAddress)) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ipAddress)) return false;
  return true;
}

async function lookupLocation(ipAddress?: string) {
  if (!isLookupableIp(ipAddress)) return {};

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ipAddress!)}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return {};

    const data = await res.json() as LocationLookup;
    if (data.success === false) return {};

    return {
      city: data.city,
      region: data.region,
      country: data.country,
    };
  } catch {
    return {};
  }
}

export async function getViewDetails(ipAddress: string | undefined, userAgent: string): Promise<ViewDetails> {
  const location = await lookupLocation(ipAddress);

  return {
    ...location,
    browser: parseBrowser(userAgent),
    os: parseOs(userAgent),
    device: parseDevice(userAgent),
  };
}
