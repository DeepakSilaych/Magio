import { useState, useEffect } from "react"

function IndexPopup() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const val = localStorage.getItem('magio_enabled')
    setEnabled(val === null ? true : val === 'true')
  }, [])

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('magio_enabled', String(next))
  }

  return (
    <div style={{ width: 260, padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ background: '#6366f1', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
          M
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Magio</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Email View Tracker</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Auto-track emails</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Embed pixel on send</div>
        </div>
        <button
          onClick={toggle}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: enabled ? '#10b981' : '#d1d5db', position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute', top: 3,
            left: enabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        Toggle also available in compose toolbar
      </div>
    </div>
  )
}

export default IndexPopup
