import {
    ActivityIcon,
    AlertTriangleIcon,
    BarChart3Icon,
    BellRingIcon,
    LayoutDashboardIcon,
    LayersIcon,
    ListIcon,
    MenuIcon,
    SettingsIcon,
    WalletIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { BUILD_SHA, disconnectDiscord } from '../../lib/api';
import type { AuthMeResponse } from '../../types';
import { useActiveGuild } from '../../providers/active-guild-provider';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent } from '../ui/dialog';
import { cn } from '../../lib/utils';

const nav = [
    { to: '/app/overview', label: 'Overview', icon: BarChart3Icon },
    { to: '/app/wallets', label: 'Watched Wallets', icon: WalletIcon },
    { to: '/app/collections', label: 'Tracked Collections', icon: LayersIcon },
    { to: '/app/alert-routing', label: 'Alert Routing', icon: BellRingIcon },
    { to: '/app/watchlists', label: 'Watchlists', icon: ListIcon },
    { to: '/app/floor-alerts', label: 'Floor Alerts', icon: AlertTriangleIcon },
    { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
] as const;

export function DashboardLayout({ children, me }: { children: ReactNode; me: AuthMeResponse }) {
    const { guildId, setGuildId, guildLabel } = useActiveGuild();
    const eligible = me.eligibleGuildIds ?? [];
    const location = useLocation();
    const [mobileNav, setMobileNav] = useState(false);

    useEffect(() => {
        setMobileNav(false);
    }, [location.pathname]);

    const initials = (me.username ?? me.userId ?? '?').slice(0, 2).toUpperCase();

    const navBody = (
        <>
            <div className="flex items-center gap-2 px-3 py-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500 text-zinc-950">
                    <ActivityIcon className="size-5" />
                </div>
                <span className="font-semibold tracking-tight">SuperBot</span>
            </div>
            <Separator className="opacity-60" />
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {nav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
                                isActive
                                    ? 'bg-zinc-800 text-cyan-300 html.light:bg-zinc-200 html.light:text-cyan-800'
                                    : 'text-zinc-300 hover:bg-zinc-800/70 html.light:text-zinc-700 html.light:hover:bg-zinc-100',
                            )
                        }
                    >
                        <item.icon className="size-4 shrink-0 opacity-85" aria-hidden />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </>
    );

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 html.light:bg-zinc-50">
            <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:hidden html.light:border-zinc-200 html.light:bg-white/90">
                <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    aria-label="Open navigation menu"
                    onClick={() => setMobileNav(true)}
                >
                    <MenuIcon />
                </Button>
                <span className="text-sm font-semibold tracking-tight">SuperBot Admin</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" type="button" className="px-2" aria-label="Account menu">
                            <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold html.light:bg-zinc-200">
                                {initials}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-zinc-200 html.light:text-zinc-800">
                            {me.username ?? me.userId}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800 html.light:bg-zinc-200" />
                        <DropdownMenuItem asChild>
                            <NavLink to="/app/settings">Settings</NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void disconnectDiscord()}>Disconnect Discord</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {guildId && eligible.length ? (
                <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-2 text-xs backdrop-blur md:hidden html.light:border-zinc-200 html.light:bg-white/90">
                    <span className="font-medium text-zinc-400 html.light:text-zinc-600">Server</span>
                    <select
                        value={guildId}
                        aria-label="Select Discord server"
                        onChange={(e) => setGuildId(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-900 px-2 py-2 text-[11px] text-zinc-100 outline-none html.light:border-zinc-300 html.light:bg-white html.light:text-zinc-950"
                    >
                        {eligible.map((id) => (
                            <option key={id} value={id}>
                                {guildLabel(id)}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            <Dialog open={mobileNav} onOpenChange={setMobileNav}>
                <DialogContent className="fixed top-0 left-0 flex h-full max-h-none w-[min(20rem,calc(100vw-48px))] translate-x-0 translate-y-0 flex-col rounded-none border-r p-0 data-[state=open]:animate-in [&>button]:hidden">
                    <div className="flex items-center justify-between border-b border-zinc-800 p-4 html.light:border-zinc-200">
                        <span className="font-semibold">Menu</span>
                        <Button type="button" variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileNav(false)}>
                            <XIcon />
                        </Button>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto">{navBody}</div>
                </DialogContent>
            </Dialog>

            <div className="flex flex-1">
                <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 md:flex html.light:border-zinc-200 html.light:bg-white">
                    {navBody}
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="sticky top-0 z-30 hidden flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/95 px-6 py-4 backdrop-blur md:flex html.light:border-zinc-200 html.light:bg-white/95">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 opacity-95">
                                <LayoutDashboardIcon className="size-4 text-zinc-500" aria-hidden />
                                <span className="text-sm font-semibold tracking-tight">Admin</span>
                            </div>
                            {guildId ? (
                                <label className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 html.light:text-zinc-600">
                                    <span className="font-medium text-zinc-200 html.light:text-zinc-800">
                                        Discord server
                                    </span>
                                    <select
                                        value={guildId}
                                        aria-label="Select Discord server"
                                        onChange={(e) => setGuildId(e.target.value)}
                                        className="rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none transition hover:border-zinc-500 html.light:border-zinc-300 html.light:bg-white html.light:text-zinc-900 md:max-w-xs md:text-sm"
                                    >
                                        {eligible.map((id) => (
                                            <option key={id} value={id}>
                                                {guildLabel(id)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    aria-label="User menu"
                                    className="gap-2 px-3"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold uppercase html.light:bg-zinc-200">
                                        {initials}
                                    </span>
                                    <span className="max-w-[140px] truncate">{me.username ?? me.userId}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-800 html.light:bg-zinc-200" />
                                <DropdownMenuItem asChild>
                                    <NavLink to="/app/settings">Settings</NavLink>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => void disconnectDiscord()}>
                                    Disconnect Discord
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <main className="flex-1 px-4 py-8 md:px-8">{children}</main>

                    <footer className="border-t border-zinc-800 px-6 py-3 text-[11px] text-zinc-500 html.light:border-zinc-200">
                        build: <span className="font-mono text-zinc-400 html.light:text-zinc-600">{BUILD_SHA}</span>
                    </footer>
                </div>
            </div>
        </div>
    );
}
