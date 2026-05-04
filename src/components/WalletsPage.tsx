import { useState } from 'react';
import { Wallet, Activity, Shield, Zap, Plus, X, Trash2 } from 'lucide-react';
import { StatCard, SectionHeader, Badge } from './Shared';
import { addWallet } from '../api';

const WalletsPage = ({ wallets, setWallets, guildId }: { wallets: any[], setWallets: any, guildId: string }) => {
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ address: '', label: '', channelId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = wallets.filter(w => (w.label || '').toLowerCase().includes(filter.toLowerCase()) || w.address.toLowerCase().includes(filter));

  const handleAdd = async () => {
    if (!form.address.startsWith('0x') || form.address.length < 42) { setError('Enter a valid 0x address'); return; }
    setSaving(true); setError('');
    try {
      await addWallet(guildId, form.address, form.label, form.channelId || undefined);
      setWallets((prev: any) => [...prev, { address: form.address, label: form.label || form.address.slice(0, 8), chain: 'ETH' }]);
      setForm({ address: '', label: '', channelId: '' }); setShowModal(false);
    } catch (err: any) { 
      if (err.response?.status === 401) {
        setError('Please login to manage wallets');
      } else {
        setError('API error - check login status');
      }
    }
    setSaving(false);
  };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>Add Wallet</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <label className="form-label">Wallet Address</label>
            <input className="form-input" style={{ marginBottom: 14 }} placeholder="0x..." value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
            <label className="form-label">Label (optional)</label>
            <input className="form-input" style={{ marginBottom: 14 }} placeholder="e.g. Whale Wallet" value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} />
            <label className="form-label">Alert Channel ID (optional)</label>
            <input className="form-input" style={{ marginBottom: 20 }} placeholder="Discord channel ID" value={form.channelId} onChange={e => setForm(f => ({...f, channelId: e.target.value}))} />
            {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginBottom: 12 }}>{error}</p>}
            <button className="cyber-btn primary" style={{ width: '100%' }} onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add Wallet'}</button>
          </div>
        </div>
      )}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard label="TRACKED WALLETS" value={`${wallets.length}`} color="var(--accent-cyan)" icon={Wallet} />
        <StatCard label="STATUS" value="LIVE" color="var(--accent-emerald)" icon={Zap} />
        <StatCard label="CHAIN" value="ETH" color="var(--accent-purple)" icon={Activity} />
        <StatCard label="ACCURACY" value="98%" color="#f59e0b" icon={Shield} />
      </div>
      <div className="glass-panel" style={{ padding: 24 }}>
        <SectionHeader title="Tracked Wallets" action={
          <div style={{ display: 'flex', gap: 12 }}>
            <input placeholder="Filter..." value={filter} onChange={e => setFilter(e.target.value)} className="search-input" />
            <button className="cyber-btn primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }} onClick={() => setShowModal(true)}><Plus size={14} />Add Wallet</button>
          </div>
        } />
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>LABEL</th><th>ADDRESS</th><th>CHAIN</th><th>STATUS</th><th></th></tr></thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(w => (
              <tr key={w.id || w.address}>
                <td style={{ fontWeight: 600 }}>{w.label || '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{w.address.slice(0, 10)}...{w.address.slice(-6)}</td>
                <td><Badge text={w.chain || 'ETH'} color="var(--accent-cyan)" /></td>
                <td><Badge text="Tracking" color="var(--accent-emerald)" /></td>
                <td><button className="icon-btn danger"><Trash2 size={14} /></button></td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No wallets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default WalletsPage;
