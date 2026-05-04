import { useState } from 'react';
import { Layers, BellRing, Zap, Shield, Plus, X, Trash2 } from 'lucide-react';
import { StatCard, SectionHeader, Badge } from './Shared';
import { addCollection, deleteCollection } from '../api';

const CollectionsPage = ({ collections, setCollections, guildId }: { collections: any[], setCollections: any, guildId: string }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contract: '', name: '', floorAlert: '', channelId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!form.contract.startsWith('0x')) { setError('Enter a valid contract address'); return; }
    if (!form.name.trim()) { setError('Collection name is required'); return; }
    setSaving(true); setError('');
    try {
      await addCollection(guildId, form.contract, form.name, form.floorAlert ? parseFloat(form.floorAlert) : undefined, form.channelId || undefined);
      setCollections((prev: any) => [...prev, { name: form.name, contractAddress: form.contract, chain: 'ETH' }]);
      setForm({ contract: '', name: '', floorAlert: '', channelId: '' }); setShowModal(false);
    } catch { setError('API error'); }
    setSaving(false);
  };

  const handleDelete = async (c: any) => {
    if (!confirm(`Untrack ${c.name}?`)) return;
    try {
      await deleteCollection(guildId, c.id);
      setCollections((prev: any) => prev.filter((x: any) => x.contractAddress !== c.contractAddress));
    } catch { alert('Delete failed'); }
  };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>Add Collection</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <label className="form-label">Contract Address</label>
            <input className="form-input" style={{ marginBottom: 14 }} placeholder="0x..." value={form.contract} onChange={e => setForm(f => ({...f, contract: e.target.value}))} />
            <label className="form-label">Collection Name</label>
            <input className="form-input" style={{ marginBottom: 14 }} placeholder="e.g. Pudgy Penguins" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <label className="form-label">Alert Channel ID (optional)</label>
            <input className="form-input" style={{ marginBottom: 20 }} placeholder="Discord channel ID" value={form.channelId} onChange={e => setForm(f => ({...f, channelId: e.target.value}))} />
            {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginBottom: 12 }}>{error}</p>}
            <button className="cyber-btn primary" style={{ width: '100%' }} onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add Collection'}</button>
          </div>
        </div>
      )}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard label="TRACKED" value={`${collections.length}`} color="var(--accent-cyan)" icon={Layers} />
        <StatCard label="ALERTS" value="0" color="var(--accent-purple)" icon={BellRing} />
        <StatCard label="STATUS" value="LIVE" color="var(--accent-emerald)" icon={Zap} />
        <StatCard label="ACCURACY" value="99%" color="#f59e0b" icon={Shield} />
      </div>
      <div className="glass-panel" style={{ padding: 24 }}>
        <SectionHeader title="Tracked Collections" action={
          <button className="cyber-btn primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }} onClick={() => setShowModal(true)}><Plus size={14} />Add Collection</button>
        } />
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>COLLECTION</th><th>CONTRACT</th><th>STATUS</th><th></th></tr></thead>
          <tbody>
            {collections.length > 0 ? collections.map(c => (
              <tr key={c.id || c.contractAddress}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.contractAddress.slice(0, 10)}...{c.contractAddress.slice(-6)}</td>
                <td><Badge text="Tracked" color="var(--accent-emerald)" /></td>
                <td><button className="icon-btn danger" onClick={() => handleDelete(c)}><Trash2 size={14} /></button></td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No collections found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
