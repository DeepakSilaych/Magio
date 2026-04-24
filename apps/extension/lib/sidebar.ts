import { fetchTrackingData, type TrackingData } from './api';

const SIDEBAR_ID = 'magio-sidebar';
const SIDEBAR_WIDTH = 260;

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

function buildViewRow(v: TrackingData['views'][number]): string {
  const browser = parseBrowser(v.userAgent || '');
  const ip = v.ipAddress || 'Unknown';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f3f4;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:26px;height:26px;border-radius:50%;background:#e8eaed;display:flex;align-items:center;justify-content:center;font-size:10px;color:#5f6368;font-weight:500;">${browser.slice(0, 2)}</div>
        <div>
          <div style="font-size:12px;color:#202124;">${ip}</div>
          <div style="font-size:11px;color:#5f6368;">${browser}</div>
        </div>
      </div>
      <div style="font-size:11px;color:#5f6368;">${formatTime(v.viewedAt)}</div>
    </div>
  `;
}

function buildLoadingHTML(): string {
  return `
    <div style="padding:16px 16px 12px;border-bottom:1px solid #dadce0;">
      <div style="font-size:14px;font-weight:500;color:#202124;font-family:'Google Sans',Roboto,sans-serif;">Tracking</div>
    </div>
    <div style="padding:24px 16px;text-align:center;color:#5f6368;font-size:13px;">Loading...</div>
  `;
}

function buildNoDataHTML(): string {
  return `
    <div style="padding:16px 16px 12px;border-bottom:1px solid #dadce0;">
      <div style="font-size:14px;font-weight:500;color:#202124;font-family:'Google Sans',Roboto,sans-serif;">Tracking</div>
    </div>
    <div style="padding:24px 16px;text-align:center;color:#5f6368;font-size:13px;">No tracking data for this email</div>
  `;
}

function buildSidebarHTML(data: TrackingData): string {
  const lastViewText = data.lastView ? `Viewed ${formatTimeAgo(data.lastView)}` : 'Not viewed yet';
  const viewRows = data.views.slice(0, 10).map(buildViewRow).join('');

  return `
    <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">
      <div style="padding:16px 16px 12px;border-bottom:1px solid #dadce0;">
        <div style="font-size:14px;font-weight:500;color:#202124;">Tracking</div>
      </div>

      <div style="padding:16px;text-align:center;border-bottom:1px solid #dadce0;">
        <div style="width:36px;height:36px;border-radius:50%;background:${data.totalViews > 0 ? '#e6f4ea' : '#f1f3f4'};display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${data.totalViews > 0 ? '#1e8e3e' : '#80868b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div style="font-size:13px;font-weight:500;color:#202124;">${lastViewText}</div>
        ${data.lastView ? `<div style="font-size:12px;color:#5f6368;margin-top:2px;">${data.totalViews} view${data.totalViews !== 1 ? 's' : ''}</div>` : ''}
      </div>

      <div style="display:flex;border-bottom:1px solid #dadce0;">
        <div style="flex:1;text-align:center;padding:12px 0;">
          <div style="font-size:20px;font-weight:500;color:#202124;">${data.totalViews}</div>
          <div style="font-size:11px;color:#5f6368;margin-top:2px;">Views</div>
        </div>
        <div style="width:1px;background:#dadce0;"></div>
        <div style="flex:1;text-align:center;padding:12px 0;">
          <div style="font-size:20px;font-weight:500;color:#202124;">${data.uniqueIps}</div>
          <div style="font-size:11px;color:#5f6368;margin-top:2px;">Unique</div>
        </div>
      </div>

      ${data.views.length > 0 ? `
        <div style="padding:12px 16px 8px;">
          <div style="font-size:11px;font-weight:500;color:#5f6368;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Recent activity</div>
          ${viewRows}
        </div>
      ` : ''}
    </div>
  `;
}

export function removeSidebar() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) sidebar.remove();
}

export async function renderSidebar(subject: string) {
  removeSidebar();

  const sidebar = document.createElement('div');
  sidebar.id = SIDEBAR_ID;
  sidebar.style.cssText = [
    'position:fixed',
    'right:0',
    'top:0',
    `width:${SIDEBAR_WIDTH}px`,
    'height:100vh',
    'background:#fff',
    'border-left:1px solid #dadce0',
    'overflow-y:auto',
    'z-index:1000',
    'box-shadow:-2px 0 8px rgba(0,0,0,0.08)',
  ].join(';');
  sidebar.innerHTML = buildLoadingHTML();
  document.body.appendChild(sidebar);

  const data = await fetchTrackingData(subject);
  if (document.getElementById(SIDEBAR_ID)) {
    sidebar.innerHTML = data ? buildSidebarHTML(data) : buildNoDataHTML();
  }
}
