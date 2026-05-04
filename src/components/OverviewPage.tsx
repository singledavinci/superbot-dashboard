import { Zap, Wallet, Layers, Shield } from 'lucide-react';
import { StatCard, SectionHeader, Badge } from './Shared';

const OverviewPage = ({ rules, wallets, collections }: { rules: any[], wallets: any[], collections: any[] }) => (
  <div className="fade-in">
    <div className="stats-grid" style={{ marginBottom: 32 }}>
      <StatCard label="ACTIVE RULES" value={`${rules.length}`} color="var(--accent-cyan)" icon={Zap} />
      <StatCard label="WALLETS" value={`${wallets.length}`} color="var(--accent-purple)" icon={Wallet} />
      <StatCard label="COLLECTIONS" value={`${collections.length}`} color="var(--accent-emerald)" icon={Layers} />
      <StatCard label="STATUS" value="LIVE" color="#f59e0b" icon={Shield} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="overview-grid">
      <div className="glass-panel" style={{ padding: 24 }}>
        <SectionHeader title="System Pulse" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { msg: 'Blockchain Indexer: Ethereum', ok: true },
            { msg: 'Credit Saving Mode: Active', ok: true },
            { msg: 'Database Sync: Postgres', ok: true },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.875rem' }}>{s.msg}</div>
              <Badge text={s.ok ? 'ONLINE' : 'OFFLINE'} color={s.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        <SectionHeader title="Chain Load" />
        {[
          { chain: 'Ethereum', events: 'Live', pct: 100 },
          { chain: 'Polygon', events: 'Paused', pct: 0 },
          { chain: 'Base', events: 'Paused', pct: 0 },
        ].map(c => (
          <div key={c.chain} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.875rem' }}>{c.chain}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{c.events}</span>
            </div>
            <div style={{ background: 'var(--bg-charcoal)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${c.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))', borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="glass-panel" style={{ padding: 24 }}>
      <SectionHeader title="Alert Routes" />
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>RULE TYPE</th><th>TARGET</th><th>CHANNEL</th><th>STATUS</th></tr></thead>
          <tbody>
            {rules.length > 0 ? rules.map(rule => (
              <tr key={rule.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{rule.type}</td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{typeof rule.target === 'string' ? (rule.target.startsWith('0x') ? rule.target.slice(0, 10) + '...' : rule.target) : 'Global'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{rule.channelId}</td>
                <td><Badge text={rule.status || 'Active'} color={rule.status === 'Paused' ? 'var(--accent-rose)' : 'var(--accent-emerald)'} /></td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No rules configured. Run /setup in Discord.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default OverviewPage;
