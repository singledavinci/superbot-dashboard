import { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Layers, Settings, BellRing, Activity } from 'lucide-react';
import './index.css';

// --- Mock Data Fallback ---
const MOCK_RULES = [
  { id: '1', type: 'WHALE_BUY', target: '0xPranksy...', channelId: '#whale-alerts', status: 'Active' },
  { id: '2', type: 'MINT_RADAR', target: 'Global', channelId: '#mint-radar', status: 'Active' },
  { id: '3', type: 'COLLECTION_TRACK', target: 'Pudgy Penguins', channelId: '#pudgy-sales', status: 'Paused' },
];

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
      background: active ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
      borderLeft: active ? '3px solid var(--accent-cyan)' : '3px solid transparent',
      transition: 'all 0.2s ease',
      marginBottom: '8px'
    }}
  >
    <Icon size={20} />
    <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check for OAuth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        localStorage.setItem('superbot_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Fetch live rules from the SuperBot API
    fetch('http://localhost:3000/api/v1/guilds/MOCK_GUILD_ID/rules', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('superbot_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.rules && data.rules.length > 0) {
          setRules(data.rules);
        } else {
          setRules(MOCK_RULES); // Fallback to mock data if DB is empty
        }
      })
      .catch(err => {
        console.error('Failed to fetch from API, using mock data.', err);
        setRules(MOCK_RULES);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar Layout */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--border-glass)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(9, 9, 11, 0.6)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ 
            background: 'var(--accent-cyan)', 
            boxShadow: '0 0 15px var(--accent-cyan-glow)',
            width: '32px', height: '32px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color="var(--bg-obsidian)" />
          </div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', margin: 0 }}>SuperBot</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
          <SidebarItem active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} icon={Wallet} label="Watched Wallets" />
          <SidebarItem active={activeTab === 'collections'} onClick={() => setActiveTab('collections')} icon={Layers} label="Collections" />
          <SidebarItem active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={BellRing} label="Alert Routing" />
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <SidebarItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Server Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'alerts' && 'Alert Routing'}
              {activeTab === 'wallets' && 'Watched Wallets'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your Discord server's intelligence feeds.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {localStorage.getItem('superbot_token') ? (
                <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>✓ Authenticated</span>
            ) : (
                <button className="cyber-btn primary" onClick={() => window.location.href = 'http://localhost:3000/api/v1/auth/discord'}>
                    Login with Discord
                </button>
            )}
            <button className="cyber-btn">Documentation</button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="fade-in">
          
          {/* Top Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>ACTIVE RULES</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>12</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>EVENTS PROCESSED (24h)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>14.2k</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>SIGNAL ACCURACY</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>94%</div>
            </div>
          </div>

          {/* Active Rules Table (Glass Panel) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Active Alert Routes</h3>
              <button className="cyber-btn" style={{ fontSize: '0.875rem', padding: '6px 12px' }}>+ New Rule</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '12px 0' }}>RULE TYPE</th>
                  <th style={{ padding: '12px 0' }}>TARGET</th>
                  <th style={{ padding: '12px 0' }}>DISCORD CHANNEL</th>
                  <th style={{ padding: '12px 0' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>Loading live data...</td></tr>
                ) : rules.map(rule => (
                  <tr key={rule.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 0', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{rule.type}</td>
                    <td style={{ padding: '16px 0' }}>{rule.targetWalletId || rule.targetCollectionId || rule.target || 'Global'}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{rule.channelId}</td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: (rule.status || 'Active') === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: (rule.status || 'Active') === 'Active' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                      }}>
                        {rule.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

    </div>
  );
}

export default App;
