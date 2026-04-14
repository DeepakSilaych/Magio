const STORAGE_KEY = 'magio_enabled';

export function getTrackingEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY);
  return val === null ? true : val === 'true';
}

export function setTrackingEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}
