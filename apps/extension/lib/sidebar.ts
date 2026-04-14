import { fetchTrackingData, type TrackingData } from './api';

const SIDEBAR_ID = 'magio-sidebar';

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

function buildLoadingHTML(): string {
  return `
    <div style="padding:20px;text-align:center;">
      <div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:12px;">Tracking</div>
      <div style="color:#9ca3af;font-size:12px;">Loading...</div>
    </div>
  `;
}

function buildNoDataHTML(): string {
  return `
    <div style="padding:20px;text-align:center;">
      <div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:16px;">Tracking</div>
      <div style="color:#9ca3af;font-size:12px;">No tracking data found for this email.</div>
    </div>
  `;
}

function buildSidebarHTML(data: TrackingData): string {
  const lastViewText = data.lastView ? `Viewed ${formatTimeAgo(data.lastView)}` : 'Not yet viewed';
  const lastViewSub = data.lastView ? `${data.totalViews} view${data.totalViews !== 1 ? 's' : ''} of last msg` : '';

  const viewRows = data.views.slice(0, 10).map((v) => {
    const browser = parseBrowser(v.userAgent || '');
    const ip = v.ipAddress || 'Unknown';
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:6px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6b7280;font-weight:600;">${browser.slice(0, 2)}</div>
          <div>
            <div style="font-size:12px;color:#374151;font-weight:500;">${ip}</div>
            <div style="font-size:10px;color:#9ca3af;">${browser}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#6b7280;text-align:right;">${formatTime(v.viewedAt)}</div>
      </div>
    `;
  }).join('');

  return `
    <div style="padding:16px;font-family:'Google Sans',Roboto,sans-serif;">
      <div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:16px;">Tracking</div>

      <div style="text-align:center;padding:16px 0;border-bottom:1px solid #e5e7eb;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${data.totalViews > 0 ? '#ecfdf5' : '#f3f4f6'};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${data.totalViews > 0 ? '#10b981' : '#9ca3af'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div style="font-size:14px;font-weight:600;color:#111827;">${lastViewText}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${lastViewSub}</div>
      </div>

      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;margin-bottom:12px;">
        <div style="text-align:center;flex:1;">
          <div style="font-size:18px;font-weight:700;color:#111827;">${data.totalViews}</div>
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">total views</div>
        </div>
        <div style="width:1px;background:#e5e7eb;"></div>
        <div style="text-align:center;flex:1;">
          <div style="font-size:18px;font-weight:700;color:#111827;">${data.uniqueIps}</div>
          <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">unique IPs</div>
        </div>
      </div>

      ${data.views.length > 0 ? `
        <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Recent Views</div>
        <div>${viewRows}</div>
      ` : ''}
    </div>
  `;
}

function findGmailSidebarContainer(): HTMLElement | null {
  const addonSidebar = document.querySelector('div.brC-brG');
  if (addonSidebar) return addonSidebar as HTMLElement;

  const rightSide = document.querySelector('div.y3');
  if (rightSide) return rightSide as HTMLElement;

  const mainView = document.querySelector('div[role="main"]');
  if (mainView) return mainView.parentElement as HTMLElement;

  return null;
}

export function removeSidebar() {
  document.getElementById(SIDEBAR_ID)?.remove();
}

export async function renderSidebar(subject: string) {
  removeSidebar();

  const sidebar = document.createElement('div');
  sidebar.id = SIDEBAR_ID;
  sidebar.style.cssText = `
    width:260px;
    background:#fff;
    border-left:1px solid #e5e7eb;
    overflow-y:auto;
    flex-shrink:0;
  `;
  sidebar.innerHTML = buildLoadingHTML();

  const container = findGmailSidebarContainer();
  if (container) {
    container.style.display = 'flex';
    container.appendChild(sidebar);
  } else {
    sidebar.style.cssText += 'position:fixed;top:0;right:0;height:100vh;z-index:9999;box-shadow:-2px 0 12px rgba(0,0,0,0.08);';
    document.body.appendChild(sidebar);
  }

  const data = await fetchTrackingData(subject);
  sidebar.innerHTML = data ? buildSidebarHTML(data) : buildNoDataHTML();
}
