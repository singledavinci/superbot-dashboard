import { Badge } from './Shared';

const SettingsPage = () => (
  <div className="fade-in">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="overview-grid">
      <div className="glass-panel" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Backend Configuration</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>Settings are managed via Railway environment variables for security.</p>
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>RPC Endpoint</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Connected</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Database</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Postgres (Live)</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>System Status</h3>
        {[
          { service: 'Discord Bot', ok: true },
          { service: 'Blockchain Indexer', ok: true },
          { service: 'Redis Queue', ok: true },
          { service: 'PostgreSQL', ok: true },
          { service: 'ClickHouse', ok: true },
        ].map(s => (
          <div key={s.service} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.875rem' }}>{s.service}</span>
            <Badge text={s.ok ? 'Online' : 'Offline'} color={s.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SettingsPage;
