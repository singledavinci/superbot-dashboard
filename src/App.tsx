import { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Layers, Settings, BellRing, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './index.css';

// Import modular pages
import OverviewPage from './components/OverviewPage';
import WalletsPage from './components/WalletsPage';
import CollectionsPage from './components/CollectionsPage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/SettingsPage';
import type {
  AuthMeResponse,
  Collection,
  CollectionsResponse,
  GuildStatusResponse,
  Rule,
  RulesResponse,
  Wallet as WatchedWallet,
  WalletsResponse,
} from './types';
import { API_BASE, fetchGuildStatus } from './api';



// Sidebar Item Component
const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <div onClick={onClick} className={`sidebar-item${active ? ' active' : ''}`}>
    <Icon size={18} />
    <span>{label}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState<Rule[]>([]);
  const [wallets, setWallets] = useState<WatchedWallet[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [guildStatus, setGuildStatus] = useState<GuildStatusResponse | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('superbot_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      return tokenFromUrl;
    }

    return localStorage.getItem('superbot_token');
  });
  const [isLoading, setIsLoading] = useState(() => !!token);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Always refresh session info to get latest guildId
        const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, { headers });
        if (meRes.status === 401) {
          localStorage.removeItem('superbot_token');
          setToken(null);
          setIsLoading(false);
          return;
        }

        const meData = (await meRes.json()) as AuthMeResponse;
        if (meData.guildId) {
          setGuildId(meData.guildId);

          const [rRes, wRes, cRes] = await Promise.all([
            fetch(`${API_BASE}/api/v1/guilds/${meData.guildId}/rules`, { headers }),
            fetch(`${API_BASE}/api/v1/guilds/${meData.guildId}/wallets`, { headers }),
            fetch(`${API_BASE}/api/v1/guilds/${meData.guildId}/collections`, { headers }),
          ]);

          const [rData, wData, cData] = (await Promise.all([
            rRes.json(),
            wRes.json(),
            cRes.json(),
          ])) as [RulesResponse, WalletsResponse, CollectionsResponse];
          setRules(rData.rules || []);
          setWallets(wData.wallets || []);
          setCollections(cData.collections || []);

          try {
            const status = (await fetchGuildStatus(meData.guildId)) as GuildStatusResponse;
            setGuildStatus(status);
          } catch {
            setGuildStatus(null);
          }
        }
      } catch (e) {
        console.error('Data load failed', e);
      }
      setIsLoading(false);
    };

    void loadData();
  }, [token]);

  const isAuth = !!token;
  const GUILD_ID = guildId;

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
              <button className="cyber-btn primary" onClick={() => (window.location.href = `${API_BASE}/api/v1/auth/discord`)}>
                Login
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Loading live data...</div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewPage rules={rules} wallets={wallets} collections={collections} guildStatus={guildStatus} />}
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
