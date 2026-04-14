import type { PlasmoCSConfig } from 'plasmo';
import { getTrackingEnabled, setTrackingEnabled } from './lib/storage';
import { registerEmail, getPixelUrl } from './lib/api';
import { getComposeWindows, getComposeBody, getComposeToolbar, getSubject, getRecipient, getSender, getSendButton, getOpenEmailSubject, isInEmailView } from './lib/gmail';
import { renderSidebar, removeSidebar } from './lib/sidebar';

export const config: PlasmoCSConfig = {
  matches: ['https://mail.google.com/*'],
  all_frames: true,
  run_at: 'document_idle',
};

const BUTTON_ID = 'magio-toggle';
const INJECTED_ATTR = 'data-magio-injected';

function createToggleButton(): HTMLElement {
  const enabled = getTrackingEnabled();

  const wrapper = document.createElement('div');
  wrapper.id = BUTTON_ID;
  wrapper.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-left:8px;cursor:pointer;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500;font-family:Google Sans,Roboto,sans-serif;user-select:none;transition:all 0.15s;';

  const dot = document.createElement('span');
  dot.style.cssText = 'width:8px;height:8px;border-radius:50%;transition:background 0.15s;';

  const label = document.createElement('span');

  function render(on: boolean) {
    wrapper.style.background = on ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)';
    wrapper.style.color = on ? '#059669' : '#6b7280';
    dot.style.background = on ? '#10b981' : '#9ca3af';
    label.textContent = on ? 'Tracking on' : 'Tracking off';
  }

  render(enabled);
  wrapper.appendChild(dot);
  wrapper.appendChild(label);

  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = !getTrackingEnabled();
    setTrackingEnabled(next);
    render(next);
  });

  wrapper.addEventListener('mouseenter', () => { wrapper.style.opacity = '0.8'; });
  wrapper.addEventListener('mouseleave', () => { wrapper.style.opacity = '1'; });

  return wrapper;
}

async function injectPixelBeforeSend(composeWindow: Element) {
  if (!getTrackingEnabled()) return;

  const body = getComposeBody(composeWindow);
  if (!body) return;

  const subject = getSubject(composeWindow);
  const recipient = getRecipient(composeWindow);
  const sender = getSender();

  const email = await registerEmail(subject, recipient, sender);
  if (!email) return;

  const img = document.createElement('img');
  img.src = getPixelUrl(email.id);
  img.width = 1;
  img.height = 1;
  img.style.cssText = 'display:none !important;width:1px;height:1px;opacity:0;';
  body.appendChild(img);
}

function hookSendButton(composeWindow: Element) {
  const sendBtn = getSendButton(composeWindow);
  if (!sendBtn || sendBtn.hasAttribute(INJECTED_ATTR)) return;
  sendBtn.setAttribute(INJECTED_ATTR, 'true');
  sendBtn.addEventListener('click', () => injectPixelBeforeSend(composeWindow), true);
}

function processComposeWindows() {
  for (const win of getComposeWindows()) {
    if (win.querySelector(`#${BUTTON_ID}`)) continue;
    const toolbar = getComposeToolbar(win);
    if (!toolbar) continue;
    toolbar.appendChild(createToggleButton());
    hookSendButton(win);
  }
}

let lastEmailSubject: string | null = null;

function processEmailView() {
  if (!isInEmailView()) {
    if (lastEmailSubject !== null) {
      removeSidebar();
      lastEmailSubject = null;
    }
    return;
  }

  const subject = getOpenEmailSubject();
  if (!subject || subject === lastEmailSubject) return;

  lastEmailSubject = subject;
  renderSidebar(subject);
}

const observer = new MutationObserver(() => {
  processComposeWindows();
  processEmailView();
});

observer.observe(document.body, { childList: true, subtree: true });
processComposeWindows();
processEmailView();
