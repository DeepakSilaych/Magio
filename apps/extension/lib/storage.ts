const STORAGE_KEY = 'magio_enabled';

let cachedValue: boolean | null = null;

export async function getTrackingEnabled(): Promise<boolean> {
  if (cachedValue !== null) return cachedValue;
  const result = await chrome.storage.local.get(STORAGE_KEY);
  cachedValue = result[STORAGE_KEY] === undefined ? true : result[STORAGE_KEY];
  return cachedValue;
}

export function getTrackingEnabledSync(): boolean {
  return cachedValue ?? true;
}

export async function setTrackingEnabled(enabled: boolean): Promise<void> {
  cachedValue = enabled;
  await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
}

export function initStorageListener(onToggle: (enabled: boolean) => void) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      cachedValue = changes[STORAGE_KEY].newValue;
      onToggle(cachedValue!);
    }
  });
}

export async function loadInitialState(): Promise<boolean> {
  const enabled = await getTrackingEnabled();
  cachedValue = enabled;
  return enabled;
}
