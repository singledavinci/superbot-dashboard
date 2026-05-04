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
    console.log('[APP] Component mounted');
    
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    console.log('[APP] Token from URL:', tokenFromUrl ? 'YES' : 'NO');
    
    if (tokenFromUrl) {
      console.log('[APP] Saving token to localStorage');
      localStorage.setItem('superbot_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const tokenFromStorage = localStorage.getItem('superbot_token');
    console.log('[APP] Token in localStorage:', tokenFromStorage ? 'YES' : 'NO');
    
    if (tokenFromStorage) {
      console.log('[APP] Starting data load...');
      const loadData = async () => {
        setIsLoading(true);
        try {
          const headers = { Authorization: `Bearer ${tokenFromStorage}` };
          
          console.log('[API] Fetching /auth/me...');
          const meRes = await fetch(`https://superbot-backend-production.up.railway.app/api/v1/auth/me`, { headers });
          console.log('[API] /auth/me status:', meRes.status);
          
          if (!meRes.ok) {
            console.error('[ERROR] /auth/me failed:', meRes.status, meRes.statusText);
            setIsLoading(false);
            return;
          }
          
          const meData = await meRes.json();
          console.log('[API] /auth/me response:', meData);
          
          if (!meData.guildId) {
            console.error('[ERROR] No guildId in response');
            setIsLoading(false);
            return;
          }
          
          const finalGuildId = meData.guildId;
          console.log('[API] Got guildId:', finalGuildId);
          setGuildId(finalGuildId);
          
          console.log('[API] Fetching rules, wallets, collections...');
          const [rRes, wRes, cRes] = await Promise.all([
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/rules`, { headers }),
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/wallets`, { headers }),
            fetch(`https://superbot-backend-production.up.railway.app/api/v1/guilds/${finalGuildId}/collections`, { headers })
          ]);
          
          console.log('[API] Response statuses:', {
            rules: rRes.status,
            wallets: wRes.status,
            collections: cRes.status
          });
          
          const [rData, wData, cData] = await Promise.all([
            rRes.json(),
            wRes.json(),
            cRes.json()
          ]);
          
          console.log('[API] Raw responses:', { rData, wData, cData });
          
          // Handle both wrapped and unwrapped responses
          const rulesData = Array.isArray(rData) ? rData : (rData.rules || []);
          const walletsData = Array.isArray(wData) ? wData : (wData.wallets || []);
          const collectionsData = Array.isArray(cData) ? cData : (cData.collections || []);
          
          console.log('[APP] Processed data:', {
            rules: rulesData.length,
            wallets: walletsData.length,
            collections: collectionsData.length
          });
          
          setRules(rulesData);
          setWallets(walletsData);
          setCollections(collectionsData);
          
          console.log('[APP] Data loaded successfully');
        } catch (e) {
          console.error('[ERROR] Data load failed:', e);
        }
        setIsLoading(false);
      };
      
      loadData();
    } else {
      console.log('[APP] No token found - user needs to login');
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
      
    </div>
  );
}

export default App;
