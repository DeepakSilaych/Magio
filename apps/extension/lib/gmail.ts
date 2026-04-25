function queryAll(selectors: string[]): Element[] {
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) return Array.from(els);
  }
  return [];
}

const COMPOSE_WINDOW_SELECTORS = [
  'div.M9',
  'div.AD',
  'div[role="dialog"][aria-label*="New"]',
  'div[role="dialog"][aria-label*="message"]',
  'div[role="dialog"][aria-label*="Message"]',
  'div[role="dialog"][aria-label*="Reply"]',
  'div[role="dialog"][aria-label*="Compose"]',
];

export function getComposeWindows(): Element[] {
  const results = queryAll(COMPOSE_WINDOW_SELECTORS);
  if (results.length > 0) return results;

  const bodies = document.querySelectorAll<HTMLElement>(
    'div[role="textbox"][aria-label*="Message Body"], div[role="textbox"][g_editable="true"], div[contenteditable="true"][aria-label*="Message"]'
  );
  const windows: Element[] = [];
  for (const body of Array.from(bodies)) {
    const container = body.closest('div.M9, div.AD, div[role="dialog"], form') || findComposeAncestor(body);
    if (container && !windows.includes(container)) windows.push(container);
  }
  return windows;
}

function findComposeAncestor(body: HTMLElement): Element | null {
  let el: HTMLElement | null = body;
  for (let i = 0; i < 15 && el; i++) {
    el = el.parentElement;
    if (!el) break;
    if (el.querySelector('input[name="subjectbox"], input[name="subject"]') &&
        el.querySelector('div[role="textbox"], div[contenteditable="true"]')) {
      return el;
    }
  }
  return null;
}

export function getComposeBody(composeWindow: Element): HTMLElement | null {
  const selectors = [
    'div[role="textbox"][aria-label="Message Body"]',
    'div[role="textbox"][g_editable="true"]',
    'div[contenteditable="true"][aria-label*="Message"]',
    'div[role="textbox"][aria-label*="body" i]',
    'div.editable[contenteditable="true"]',
  ];
  for (const s of selectors) {
    const el = composeWindow.querySelector<HTMLElement>(s);
    if (el) return el;
  }
  return null;
}

export function getComposeToolbar(composeWindow: Element): HTMLElement | null {
  const selectors = [
    'tr.btC td.gU',
    'td.gU',
    'div[role="toolbar"]',
    'tr.btC',
  ];
  for (const s of selectors) {
    const el = composeWindow.querySelector<HTMLElement>(s);
    if (el) return el;
  }
  const sendBtn = getSendButton(composeWindow);
  return sendBtn?.parentElement ?? null;
}

export function getSubject(composeWindow: Element): string {
  const input = composeWindow.querySelector<HTMLInputElement>('input[name="subjectbox"], input[name="subject"], input[aria-label*="Subject"]');
  return input?.value || 'Unknown Subject';
}

export function getRecipient(composeWindow: Element): string {
  const toSpans = composeWindow.querySelectorAll('div[aria-label="To"] span[email], span[email]');
  if (toSpans.length > 0) {
    return Array.from(toSpans).map((s) => s.getAttribute('email')).filter(Boolean).join(', ');
  }
  const toInput = composeWindow.querySelector<HTMLInputElement>('input[name="to"], input[aria-label*="To"]');
  return toInput?.value || 'Unknown Recipient';
}

export function getSender(): string {
  const fromSelect = document.querySelector<HTMLSelectElement>('select[aria-label*="From"]');
  if (fromSelect?.value) return fromSelect.value;

  const account = document.querySelector<HTMLMetaElement>('meta[name="og-profile-acct"]')?.content;
  if (account && account.includes('@')) return account;

  const selectors = [
    'span[data-hovercard-id]',
    'span[data-hovercard-owner-id]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const val = el?.getAttribute('data-hovercard-id')
      || el?.getAttribute('data-hovercard-owner-id');
    if (val && val.includes('@')) return val;
  }

  return 'unknown@gmail.com';
}

export function getSendButton(composeWindow: Element): HTMLElement | null {
  const selectors = [
    'div[role="button"][aria-label*="Send"]',
    'div[role="button"][data-tooltip*="Send"]',
    'div[role="button"][aria-label*="send" i]',
  ];
  for (const s of selectors) {
    const el = composeWindow.querySelector<HTMLElement>(s);
    if (el) return el;
  }
  return null;
}

export function getOpenEmailSubject(): string | null {
  const selectors = [
    'h2[data-thread-perm-id]',
    'div[role="main"] h2.hP',
    'div[role="main"] span[data-thread-id]',
    'div[role="main"] [data-legacy-thread-id]',
    'div[role="main"] h2',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

export function getOpenEmailSender(): string | null {
  const selectors = [
    'div[role="main"] span[email][data-hovercard-id]',
    'div[role="main"] span[email]',
    'div[role="main"] [data-hovercard-id]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    const email = el?.getAttribute('email') || el?.getAttribute('data-hovercard-id');
    if (email && email.includes('@')) return email;
  }
  return null;
}

export function getEmailRows(): HTMLTableRowElement[] {
  const selectors = [
    'div[role="main"] table tr.zA',
    'div[role="main"] table tbody tr[role="row"]',
    'div[role="main"] table tbody tr',
  ];
  for (const sel of selectors) {
    const rows = document.querySelectorAll<HTMLTableRowElement>(sel);
    if (rows.length > 0) return Array.from(rows);
  }
  return [];
}

export function getRowSubject(row: HTMLTableRowElement): string | null {
  const selectors = ['span.bog', 'span.bqe', 'td.xY span[data-thread-id]', 'td.a4W span.y2'];
  for (const sel of selectors) {
    const el = row.querySelector<HTMLElement>(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

export function getRowTimestampCell(row: HTMLTableRowElement): HTMLElement | null {
  const selectors = ['td.xW', 'td[tabindex] span[title]'];
  for (const sel of selectors) {
    const el = row.querySelector<HTMLElement>(sel);
    if (el) return sel.includes('span') ? el.parentElement : el;
  }
  const cells = row.querySelectorAll('td');
  if (cells.length > 0) {
    const lastCell = cells[cells.length - 1];
    if (lastCell.querySelector('span[title]')) return lastCell;
  }
  return null;
}

export function isInEmailView(): boolean {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  if (parts.length < 2 || parts[parts.length - 1].length <= 10) return false;

  return !!(
    document.querySelector('div[role="main"] div.adn') ||
    document.querySelector('h2[data-thread-perm-id]') ||
    document.querySelector('div[role="main"] h2.hP') ||
    document.querySelector('div[role="main"] h2')
  );
}
