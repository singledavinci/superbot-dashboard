import { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Layers, Settings, BellRing, Activity } from 'lucide-react';
import './index.css';

// Import modular pages
import OverviewPage from './components/OverviewPage';
import WalletsPage from './components/WalletsPage';
import CollectionsPage from './components/CollectionsPage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/SettingsPage';



// Sidebar Item Component
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`sidebar-item${active ? ' active' : ''}`}>
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guildId, setGuildId] = useState<string | null>(null);
  const token = localStorage.getItem('superbot_token');
  const GUILD_ID = guildId;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('superbot_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const tokenFromStorage = localStorage.getItem('superbot_token');
    if (tokenFromStorage) {
      const loadData = async (currentGuildId?: string) => {
        setIsLoading(true);
        try {
          const headers = { Authorization: `Bearer ${tokenFromStorage}` };
          
          // If no guildId yet, fetch session first
          let finalGuildId = currentGuildId || guildId;
          if (!finalGuildId) {
            console.log('[DEBUG] Fetching auth/me to get guildId...');
            const meRes = await fetch(`https://superbot-backend-production.up.railway.app/api/v1/auth/me`, { headers });
            if (!meRes.ok) {
              console.error('[ERROR] auth/me failed:', meRes.status, meRes.statusText);
              throw new Error(`Auth failed: ${meRes.status}`);
            }
            const meData = await meRes.json();
            console.log('[DEBUG] auth/me response:', meData);
            if (meData.guildId) {
              finalGuildId = meData.guildId;
              console.log('[DEBUG] Got guildId:', finalGuildId);
              setGuildId(finalGuildId);
            } else {
              console.warn('[WARN] No guildId in auth response');
            }
          }

          if (finalGuildId) {
            console.log('[DEBUG] Fetching data for guildId:', finalGuildId);
            const [rRes, wRes, cRes] = await Promise.all([
              fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/rules`, { headers }),
              fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/wallets`, { headers }),
              fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/collections`, { headers })
            ]);

            if (!rRes.ok || !wRes.ok || !cRes.ok) {
              console.error('[ERROR] API responses not OK:', {
                rules: rRes.status,
                wallets: wRes.status,
                collections: cRes.status
              });
            }
            
            const [rData, wData, cData] = await Promise.all([rRes.json(), wRes.json(), cRes.json()]);

            console.log('[DEBUG] API responses:', { rData, wData, cData });

            const rulesData = rData.rules || rData || [];
            const walletsData = wData.wallets || wData || [];
            const collectionsData = cData.collections || cData || [];

            console.log('[DEBUG] Setting state with:', {
              rules: rulesData.length,
              wallets: walletsData.length,
              collections: collectionsData.length
            });

            setRules(rulesData);
            setWallets(walletsData);
            setCollections(collectionsData);
          } else {
            console.warn('[WARN] No finalGuildId available');
          }
        } catch (e) {
          console.error('[ERROR] Data load failed:', e);
        }
        setIsLoading(false);
      };
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const isAuth = !!token;

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
      <div className={`glass-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} />

      <header className="mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 999 }}>
        <button className="icon-btn" onClick={() => setSidebarOpen(true)} style={{ marginRight: 16 }}>
          <Activity size={20} color="var(--accent-cyan)" />
        </button>
        <h2 style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>SUPERBOT v2.0-LIVE</h2>
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
        <div className="mobile-header-spacer" style={{ height: '60px', display: 'none' }} />
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, marginTop: 'calc(var(--mobile-margin, 0px))' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', marginBottom: 4 }}>{PAGE_TITLE[activeTab]}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }} className="header-desc">Real-time NFT intelligence.</p>
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
            {activeTab === 'wallets' && GUILD_ID && <WalletsPage wallets={wallets} setWallets={setWallets} guildId={GUILD_ID} />}
            {activeTab === 'collections' && GUILD_ID && <CollectionsPage collections={collections} setCollections={setCollections} guildId={GUILD_ID} />}
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
