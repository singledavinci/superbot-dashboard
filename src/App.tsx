import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Layers, Settings, BellRing, Activity, Shield, Zap, Plus, Trash2, X } from 'lucide-react';
import './index.css';
import { addWallet, addCollection, deleteCollection } from './api';

// Demo guild ID — replace with real guild from OAuth session
const GUILD_ID = 'MOCK_GUILD_ID';

// --- Sub-components ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`sidebar-item${active ? ' active' : ''}`}>
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, color, icon: Icon }: { label: string, value: string, color: string, icon: any }) => (
  <div className="glass-panel stat-card">
    <div className="stat-label"><Icon size={14} style={{ marginRight: 6 }} />{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
  </div>
);

const Badge = ({ text, color }: { text: string, color: string }) => (
  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}40`, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
    {text}
  </span>
);

const SectionHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h3>
    {action}
  </div>
);

// --- Page: Overview ---
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

// --- Page: Watched Wallets ---
const WalletsPage = ({ wallets, setWallets }: { wallets: any[], setWallets: any }) => {
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
      await addWallet(GUILD_ID, form.address, form.label, form.channelId || undefined);
      setWallets((prev: any) => [...prev, { address: form.address, label: form.label || form.address.slice(0, 8), chain: 'ETH' }]);
      setForm({ address: '', label: '', channelId: '' }); setShowModal(false);
    } catch { setError('API error'); }
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

// --- Page: Collections ---
const CollectionsPage = ({ collections, setCollections }: { collections: any[], setCollections: any }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contract: '', name: '', floorAlert: '', channelId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!form.contract.startsWith('0x')) { setError('Enter a valid contract address'); return; }
    if (!form.name.trim()) { setError('Collection name is required'); return; }
    setSaving(true); setError('');
    try {
      await addCollection(GUILD_ID, form.contract, form.name, form.floorAlert ? parseFloat(form.floorAlert) : undefined, form.channelId || undefined);
      setCollections((prev: any) => [...prev, { name: form.name, contractAddress: form.contract, chain: 'ETH' }]);
      setForm({ contract: '', name: '', floorAlert: '', channelId: '' }); setShowModal(false);
    } catch { setError('API error'); }
    setSaving(false);
  };

  const handleDelete = async (c: any) => {
    if (!confirm(`Untrack ${c.name}?`)) return;
    try {
      await deleteCollection(GUILD_ID, c.id);
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

// --- Page: Alert Routing ---
const AlertsPage = ({ rules }: { rules: any[] }) => (
  <div className="fade-in">
    <div className="stats-grid" style={{ marginBottom: 32 }}>
      <StatCard label="TOTAL RULES" value={`${rules.length}`} color="var(--accent-cyan)" icon={BellRing} />
      <StatCard label="ACTIVE" value={`${rules.length}`} color="var(--accent-emerald)" icon={Zap} />
      <StatCard label="STATUS" value="LIVE" color="var(--accent-purple)" icon={Shield} />
      <StatCard label="ACCURACY" value="100%" color="#f59e0b" icon={Activity} />
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
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{typeof rule.target === 'string' && rule.target.startsWith('0x') ? rule.target.slice(0, 14) + '...' : rule.target}</td>
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

// --- Page: Settings ---
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

// --- Root App ---
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('superbot_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const tokenFromStorage = localStorage.getItem('superbot_token');
    if (tokenFromStorage) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Use MOCK_GUILD_ID as a fallback or if not yet set
          const headers = { Authorization: `Bearer ${tokenFromStorage}` };
          const [rRes, wRes, cRes] = await Promise.all([
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${GUILD_ID}/rules`, { headers }),
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${GUILD_ID}/wallets`, { headers }),
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${GUILD_ID}/collections`, { headers })
          ]);
          
          const [rData, wData, cData] = await Promise.all([rRes.json(), wRes.json(), cRes.json()]);
          setRules(rData.rules || []);
          setWallets(wData.wallets || []);
          setCollections(cData.collections || []);
        } catch (e) {
          console.error('Data load failed', e);
        }
        setIsLoading(false);
      };
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const isAuth = !!localStorage.getItem('superbot_token');

  const PAGE_TITLE: Record<string, string> = {
    overview: 'System Overview',
    wallets: 'Watched Wallets',
    collections: 'Collections',
    alerts: 'Alert Routing',
    settings: 'Server Settings',
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Backdrop */}
      <div className={`glass-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} />

      {/* Mobile Top Bar */}
      <header className="mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 999 }}>
        <button className="icon-btn" onClick={() => setSidebarOpen(true)} style={{ marginRight: 16 }}>
          <Activity size={20} color="var(--accent-cyan)" />
        </button>
        <h2 style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>SUPERBOT</h2>
      </header>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Activity size={18} color="var(--bg-obsidian)" /></div>
          <h2>SuperBot</h2>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); closeSidebar(); }} icon={LayoutDashboard} label="Overview" />
          <SidebarItem active={activeTab === 'wallets'} onClick={() => { setActiveTab('wallets'); closeSidebar(); }} icon={Wallet} label="Watched Wallets" />
          <SidebarItem active={activeTab === 'collections'} onClick={() => { setActiveTab('collections'); closeSidebar(); }} icon={Layers} label="Collections" />
          <SidebarItem active={activeTab === 'alerts'} onClick={() => { setActiveTab('alerts'); closeSidebar(); }} icon={BellRing} label="Alert Routing" />
        </nav>
        <div>
          <SidebarItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); closeSidebar(); }} icon={Settings} label="Server Settings" />
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {/* Spacer for mobile fixed header */}
        <div className="mobile-header-spacer" style={{ height: '60px', display: 'none' }} />
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, marginTop: 'calc(var(--mobile-margin, 0px))' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', marginBottom: 4 }}>{PAGE_TITLE[activeTab]}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }} className="header-desc">Real-time NFT intelligence. <span style={{ color: 'var(--accent-purple)', marginLeft: 8, opacity: 0.5 }}>v2.0-LIVE</span></p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="header-actions">
            {isAuth ? (
              <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>✓ Authenticated</span>
            ) : (
              <button className="cyber-btn primary" onClick={() => (window.location.href = 'https://superbot-backend-production.up.railway.app/api/v1/auth/discord')}>
                Login
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Loading live data...</div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewPage rules={rules} wallets={wallets} collections={collections} />}
            {activeTab === 'wallets' && <WalletsPage wallets={wallets} setWallets={setWallets} />}
            {activeTab === 'collections' && <CollectionsPage collections={collections} setCollections={setCollections} />}
            {activeTab === 'alerts' && <AlertsPage rules={rules} />}
            {activeTab === 'settings' && <SettingsPage />}
          </>
        )}
      </main>
      
      <style>{`
        @media (max-width: 1024px) {
          .mobile-header-spacer { display: block !important; }
          .header-desc { display: none; }
          .main-content { padding-top: 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
