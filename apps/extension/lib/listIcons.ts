import { fetchAllTrackingStatuses, type EmailStatus } from './api';
import { getTrackingEnabledSync } from './storage';
import { getEmailRows, getRowSubject, getRowTimestampCell } from './gmail';

const ICON_ATTR = 'data-magio-eye';
const CACHE_TTL = 60_000;

let statusCache: Map<string, number> = new Map();
let lastFetch = 0;
let fetching = false;

function normalize(subject: string): string {
  return subject.replace(/^(re|fwd|fw)\s*:\s*/gi, '').trim().toLowerCase();
}

function buildStatusMap(statuses: EmailStatus[]) {
  const map = new Map<string, number>();
  for (const s of statuses) {
    const key = normalize(s.subject);
    const existing = map.get(key) ?? 0;
    map.set(key, existing + s.viewCount);
  }
  return map;
}

async function refreshCache() {
  if (fetching) return;
  if (Date.now() - lastFetch < CACHE_TTL) return;
  fetching = true;
  try {
    const statuses = await fetchAllTrackingStatuses();
    statusCache = buildStatusMap(statuses);
    lastFetch = Date.now();
  } finally {
    fetching = false;
  }
}

const EYE_OPEN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_CLOSED = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80868b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function createIcon(viewed: boolean): HTMLSpanElement {
  const span = document.createElement('span');
  span.setAttribute(ICON_ATTR, 'true');
  span.style.cssText = 'display:inline-flex;align-items:center;margin-right:6px;vertical-align:middle;flex-shrink:0;';
  span.title = viewed ? 'Viewed' : 'Not viewed';
  span.innerHTML = viewed ? EYE_OPEN : EYE_CLOSED;
  return span;
}

function injectIcon(row: HTMLTableRowElement, viewCount: number) {
  if (row.querySelector(`[${ICON_ATTR}]`)) return;
  const cell = getRowTimestampCell(row);
  if (!cell) return;
  const icon = createIcon(viewCount > 0);
  const firstChild = cell.firstChild;
  if (firstChild) {
    cell.insertBefore(icon, firstChild);
  } else {
    cell.appendChild(icon);
  }
}

function removeAllIcons() {
  document.querySelectorAll(`[${ICON_ATTR}]`).forEach((el) => el.remove());
}

export async function processListIcons() {
  if (!getTrackingEnabledSync()) {
    removeAllIcons();
    return;
  }

  await refreshCache();
  if (statusCache.size === 0) return;

  const rows = getEmailRows();
  for (const row of rows) {
    if (row.querySelector(`[${ICON_ATTR}]`)) continue;
    const subject = getRowSubject(row);
    if (!subject) continue;
    const key = normalize(subject);
    const viewCount = statusCache.get(key);
    if (viewCount === undefined) continue;
    injectIcon(row, viewCount);
  }
}

export function invalidateListIconCache() {
  lastFetch = 0;
}
