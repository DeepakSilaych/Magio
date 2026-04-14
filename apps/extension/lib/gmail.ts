export function getComposeWindows(): Element[] {
  return Array.from(document.querySelectorAll('div.M9'));
}

export function getComposeBody(composeWindow: Element): HTMLElement | null {
  return composeWindow.querySelector('div[role="textbox"][aria-label="Message Body"]') as HTMLElement | null;
}

export function getComposeToolbar(composeWindow: Element): HTMLElement | null {
  const toolbars = composeWindow.querySelectorAll('tr.btC td.gU');
  return (toolbars.length > 0 ? toolbars[0] : null) as HTMLElement | null;
}

export function getSubject(composeWindow: Element): string {
  const input = composeWindow.querySelector('input[name="subjectbox"]') as HTMLInputElement;
  return input?.value || 'Unknown Subject';
}

export function getRecipient(composeWindow: Element): string {
  const toSpans = composeWindow.querySelectorAll('div[aria-label="To"] span[email]');
  if (toSpans.length > 0) return Array.from(toSpans).map((s) => s.getAttribute('email')).filter(Boolean).join(', ');
  const toInput = composeWindow.querySelector('input[name="to"]') as HTMLInputElement;
  return toInput?.value || 'Unknown Recipient';
}

export function getSender(): string {
  const fromEl = document.querySelector('span[data-hovercard-id]');
  return fromEl?.getAttribute('data-hovercard-id') || 'unknown@gmail.com';
}

export function getSendButton(composeWindow: Element): HTMLElement | null {
  return composeWindow.querySelector('div[role="button"][aria-label*="Send"]') as HTMLElement | null;
}

export function getOpenEmailSubject(): string | null {
  const subjectEl = document.querySelector('h2[data-thread-perm-id]');
  if (subjectEl) return subjectEl.textContent?.trim() || null;

  const altSubject = document.querySelector('div[role="main"] h2.hP');
  if (altSubject) return altSubject.textContent?.trim() || null;

  const titleSubject = document.querySelector('div[role="main"] span[data-thread-id]');
  if (titleSubject) return titleSubject.textContent?.trim() || null;

  return null;
}

export function getEmailSidePanel(): HTMLElement | null {
  return document.querySelector('div.y3') as HTMLElement | null;
}

export function isInEmailView(): boolean {
  return !!document.querySelector('div[role="main"] div.adn');
}
