import { BellRing, Zap, Shield } from 'lucide-react';
import { StatCard, SectionHeader, Badge } from './Shared';
import type { Rule } from '../types';

const AlertsPage = ({ rules }: { rules: Rule[] }) => (
  <div className="fade-in">
    <div className="stats-grid" style={{ marginBottom: 32 }}>
      <StatCard label="TOTAL RULES" value={`${rules.length}`} color="var(--accent-cyan)" icon={BellRing} />
      <StatCard label="ACTIVE" value={`${rules.length}`} color="var(--accent-emerald)" icon={Zap} />
      <StatCard label="STATUS" value="CONFIGURED" color="var(--accent-purple)" icon={Shield} />
    </div>
    <div className="glass-panel" style={{ padding: 24 }}>
      <SectionHeader title="Active Alert Routes" />
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>TYPE</th><th>TARGET</th><th>CHANNEL</th><th>STATUS</th></tr></thead>
          <tbody>
            {rules.length > 0 ? rules.map(rule => (
              <tr key={rule.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{rule.type}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {typeof rule.target === 'string' && rule.target.startsWith('0x')
                    ? rule.target.slice(0, 14) + '...'
                    : rule.target}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{rule.channelId}</td>
                <td><Badge text="Active" color="var(--accent-emerald)" /></td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No alert rules found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AlertsPage;
