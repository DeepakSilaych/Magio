import { deleteLatestTrackingView, fetchTrackingData, type TrackingData } from './api';
import { getOpenEmailSender, getSender } from './gmail';

const SIDEBAR_ID = 'magio-sidebar';
const SIDEBAR_WIDTH = 320;
const SHELL_WIDTH_ATTR = 'data-magio-shell-width';
const LAYOUT_DISPLAY_ATTR = 'data-magio-layout-display';
const LAYOUT_ALIGN_ATTR = 'data-magio-layout-align';
const LAYOUT_OVERFLOW_ATTR = 'data-magio-layout-overflow';
const MAIN_FLEX_ATTR = 'data-magio-main-flex';
const MAIN_MIN_WIDTH_ATTR = 'data-magio-main-min-width';
const SIDEBAR_SELECTOR = `#${SIDEBAR_ID}, [data-magio-sidebar="true"]`;

let renderToken = 0;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function parseBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  return 'Unknown';
}

function getLocationText(v: TrackingData['views'][number]): string {
  const location = [v.city, v.region, v.country].filter(Boolean).join(', ');
  if (location) return location;
  if (v.browser === 'Gmail proxy') return 'Gmail image proxy';
  return 'Unknown location';
}

function getDeviceText(v: TrackingData['views'][number], fallbackBrowser: string): string {
  return [v.device, v.os, v.browser || fallbackBrowser].filter(Boolean).join(' · ');
}

function buildViewRow(v: TrackingData['views'][number]): string {
  const browser = v.browser || parseBrowser(v.userAgent || '');
  const location = getLocationText(v);
  const device = getDeviceText(v, browser);
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f3f4;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:22px;height:22px;border-radius:50%;background:#f1f3f4;display:flex;align-items:center;justify-content:center;font-size:10px;color:#5f6368;font-weight:500;">${browser.slice(0, 2)}</div>
        <div>
          <div style="font-size:12px;color:#202124;line-height:1.25;">${location}</div>
          <div style="font-size:11px;color:#5f6368;line-height:1.2;">${device}</div>
        </div>
      </div>
      <div style="font-size:11px;color:#5f6368;white-space:nowrap;padding-left:8px;">${formatTime(v.viewedAt)}</div>
    </div>
  `;
}

function buildHeaderHTML(): string {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #dadce0;">
      <div style="font-size:20px;font-weight:500;line-height:1.2;color:#202124;font-family:'Google Sans',Roboto,sans-serif;">Tracking</div>
      <div data-magio-close="true" style="width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#5f6368;cursor:pointer;font-size:18px;line-height:1;">×</div>
    </div>
  `;
}

function buildLoadingHTML(): string {
  return `
    ${buildHeaderHTML()}
    <div style="padding:20px 14px;text-align:center;color:#5f6368;font-size:13px;">Loading...</div>
  `;
}

function buildNoDataHTML(): string {
  return `
    ${buildHeaderHTML()}
    <div style="padding:20px 14px;text-align:center;color:#5f6368;font-size:13px;">No tracking data for this email</div>
  `;
}

function buildSidebarHTML(data: TrackingData): string {
  const lastViewText = data.lastView ? `Viewed ${formatTimeAgo(data.lastView)}` : 'Not viewed yet';
  const viewRows = data.views.slice(0, 10).map(buildViewRow).join('');

  return `
    <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;background:#fff;height:100%;">
      ${buildHeaderHTML()}

      <div style="display:flex;border-bottom:1px solid #dadce0;">
        <div style="flex:1;padding:12px;text-align:center;">
          <div style="width:28px;height:28px;border-radius:50%;background:${data.totalViews > 0 ? '#e6f4ea' : '#f1f3f4'};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${data.totalViews > 0 ? '#1e8e3e' : '#80868b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div style="font-size:18px;font-weight:500;color:#202124;line-height:1.1;">${data.totalViews}</div>
          <div style="font-size:12px;color:#5f6368;margin-top:2px;">Views</div>
        </div>
        <div style="width:1px;background:#dadce0;"></div>
        <div style="flex:1;padding:12px;text-align:center;">
          <div style="width:28px;height:28px;border-radius:50%;background:#f1f3f4;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div style="font-size:18px;font-weight:500;color:#202124;line-height:1.1;">${data.uniqueIps}</div>
          <div style="font-size:12px;color:#5f6368;margin-top:2px;">Unique</div>
        </div>
      </div>

      <div style="padding:12px 14px;border-bottom:1px solid #dadce0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:26px;height:26px;border-radius:50%;background:${data.totalViews > 0 ? '#e6f4ea' : '#f1f3f4'};display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${data.totalViews > 0 ? '#1e8e3e' : '#80868b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          </div>
          <div>
            <div style="font-size:14px;font-weight:500;color:#202124;line-height:1.25;">${lastViewText}</div>
            <div style="font-size:12px;color:#5f6368;margin-top:2px;">${data.totalViews} total view${data.totalViews !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      ${data.views.length > 0 ? `
        <div style="padding:10px 14px 8px;">
          <div style="font-size:11px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:2px;">Recent activity</div>
          ${viewRows}
        </div>
      ` : ''}
    </div>
  `;
}

function getSidebarMountHost(): { parent: HTMLElement; before: ChildNode | null; embedded: boolean; shell: HTMLElement | null; main: HTMLElement | null } {
  const subject = document.querySelector<HTMLElement>('h2.hP, h2[data-thread-perm-id]');
  const main = subject?.closest<HTMLElement>('div.nH[role="main"]');
  if (main?.parentElement) {
    return { parent: main.parentElement, before: main.nextSibling, embedded: true, shell: null, main };
  }

  const sidePanel = document.querySelector<HTMLElement>('div[role="complementary"][aria-label="Side panel"], div[role="complementary"][aria-label="side panel"]');
  if (sidePanel?.parentElement) {
    return { parent: sidePanel.parentElement, before: sidePanel, embedded: true, shell: null, main: null };
  }
  return { parent: document.body, before: null, embedded: false, shell: null, main: null };
}

function bindCloseButton(sidebar: HTMLElement) {
  const close = sidebar.querySelector<HTMLElement>('[data-magio-close="true"]');
  if (!close) return;
  close.addEventListener('click', () => removeSidebar());
}

export function removeSidebar() {
  document.querySelectorAll(SIDEBAR_SELECTOR).forEach((sidebar) => sidebar.remove());

  const shell = document.querySelector<HTMLElement>(`[${SHELL_WIDTH_ATTR}]`);
  if (shell) {
    shell.style.width = shell.getAttribute(SHELL_WIDTH_ATTR) || '';
    shell.style.minWidth = '';
    shell.style.maxWidth = '';
    shell.removeAttribute(SHELL_WIDTH_ATTR);
  }

  const layout = document.querySelector<HTMLElement>(`[${LAYOUT_DISPLAY_ATTR}]`);
  if (layout) {
    layout.style.display = layout.getAttribute(LAYOUT_DISPLAY_ATTR) || '';
    layout.style.alignItems = layout.getAttribute(LAYOUT_ALIGN_ATTR) || '';
    layout.style.overflow = layout.getAttribute(LAYOUT_OVERFLOW_ATTR) || '';
    layout.removeAttribute(LAYOUT_DISPLAY_ATTR);
    layout.removeAttribute(LAYOUT_ALIGN_ATTR);
    layout.removeAttribute(LAYOUT_OVERFLOW_ATTR);
  }

  const main = document.querySelector<HTMLElement>(`[${MAIN_FLEX_ATTR}]`);
  if (main) {
    main.style.flex = main.getAttribute(MAIN_FLEX_ATTR) || '';
    main.style.minWidth = main.getAttribute(MAIN_MIN_WIDTH_ATTR) || '';
    main.removeAttribute(MAIN_FLEX_ATTR);
    main.removeAttribute(MAIN_MIN_WIDTH_ATTR);
  }
}

export async function renderSidebar(subject: string) {
  const token = ++renderToken;
  removeSidebar();

  let data = await fetchTrackingData(subject);
  if (token !== renderToken) return;
  if (!data) return;

  const openEmailSender = getOpenEmailSender();
  const currentAccount = getSender();
  const isOwnerView = openEmailSender && currentAccount && openEmailSender === currentAccount;

  if (isOwnerView) {
    await wait(700);
    if (token !== renderToken) return;
    await deleteLatestTrackingView(data.id);
    if (token !== renderToken) return;
    data = await fetchTrackingData(subject);
    if (token !== renderToken) return;
    if (!data) return;
  }

  const mount = getSidebarMountHost();
  const embeddedHeight = mount.main ? `${Math.round(mount.main.getBoundingClientRect().height)}px` : '100%';
  const sidebar = document.createElement('div');
  sidebar.id = SIDEBAR_ID;
  sidebar.setAttribute('data-magio-sidebar', 'true');
  sidebar.style.cssText = mount.embedded
    ? [
        `width:${SIDEBAR_WIDTH}px`,
        `min-width:${SIDEBAR_WIDTH}px`,
        `max-width:${SIDEBAR_WIDTH}px`,
        `height:${embeddedHeight}`,
        `max-height:${embeddedHeight}`,
        'align-self:flex-start',
        'background:#fff',
        'border-left:1px solid #dadce0',
        'border-right:none',
        'overflow-y:auto',
        'box-sizing:border-box',
      ].join(';')
    : [
        'position:fixed',
        'right:56px',
        'top:64px',
        `width:${SIDEBAR_WIDTH}px`,
        'height:calc(100vh - 64px)',
        'background:#fff',
        'border-left:1px solid #dadce0',
        'border-right:1px solid #dadce0',
        'overflow-y:auto',
        'z-index:1000',
        'box-shadow:0 1px 3px rgba(60,64,67,.15),0 1px 2px rgba(60,64,67,.3)',
      ].join(';');
  sidebar.innerHTML = buildLoadingHTML();
  bindCloseButton(sidebar);
  if (mount.embedded && mount.shell) {
    mount.shell.setAttribute(SHELL_WIDTH_ATTR, mount.shell.style.width || '');
    mount.shell.style.width = `${SIDEBAR_WIDTH}px`;
    mount.shell.style.minWidth = `${SIDEBAR_WIDTH}px`;
    mount.shell.style.maxWidth = `${SIDEBAR_WIDTH}px`;
  }
  if (mount.embedded && mount.main) {
    mount.parent.setAttribute(LAYOUT_DISPLAY_ATTR, mount.parent.style.display || '');
    mount.parent.setAttribute(LAYOUT_ALIGN_ATTR, mount.parent.style.alignItems || '');
    mount.parent.setAttribute(LAYOUT_OVERFLOW_ATTR, mount.parent.style.overflow || '');
    mount.parent.style.display = 'flex';
    mount.parent.style.alignItems = 'flex-start';
    mount.parent.style.overflow = 'hidden';
    mount.main.setAttribute(MAIN_FLEX_ATTR, mount.main.style.flex || '');
    mount.main.setAttribute(MAIN_MIN_WIDTH_ATTR, mount.main.style.minWidth || '');
    mount.main.style.flex = '1 1 auto';
    mount.main.style.minWidth = '0';
  }
  if (mount.before) {
    mount.parent.insertBefore(sidebar, mount.before);
  } else {
    mount.parent.appendChild(sidebar);
  }

  if (token === renderToken && document.body.contains(sidebar)) {
    sidebar.innerHTML = buildSidebarHTML(data);
    bindCloseButton(sidebar);
  }
}
