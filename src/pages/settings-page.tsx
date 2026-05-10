import { useQuery } from '@tanstack/react-query';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { BUILD_SHA, disconnectDiscord, publicJson } from '../lib/api';
import { useSession } from '../providers/session-provider';

type VersionInfo = { gitSha?: string; service?: string; node?: string };

const THEME_KEY = 'superbot_theme';

export function SettingsPage() {
    const v = useQuery({
        queryKey: ['public', 'version'],
        queryFn: () => publicJson<VersionInfo>('/api/version'),
    });

    const h = useQuery({
        queryKey: ['public', 'health'],
        queryFn: () => publicJson<{ status?: string; service?: string }>('/api/health'),
    });

    const { me } = useSession();

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        try {
            const s = localStorage.getItem(THEME_KEY);
            if (s === 'light' || s === 'dark') return s;
        } catch {
            /* ignore */
        }
        return 'dark';
    });

    useEffect(() => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            /* ignore */
        }
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
    }, [theme]);

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
                <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                    Runtime metadata, Discord session control, and display preferences stay on this browser only.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-400 html.light:text-zinc-600">
                        Accent theme applies instantly and persists locally as <span className="font-mono text-xs">{THEME_KEY}</span>.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            type="button"
                            className="gap-2"
                            onClick={() => setTheme('dark')}
                            aria-label="Use dark theme"
                        >
                            <MoonIcon />
                            Dark
                        </Button>
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            type="button"
                            className="gap-2"
                            onClick={() => setTheme('light')}
                            aria-label="Use light theme"
                        >
                            <SunIcon />
                            Light
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Connectivity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 font-mono text-sm">
                    <Row label="API health">{h.data ? `${h.data.status ?? '?'}` : h.isPending ? '…' : 'unreachable'}</Row>
                    <Row label="API service">{v.data?.service ?? '—'}</Row>
                    <Row label="API gitSha">{v.data?.gitSha ?? '—'}</Row>
                    <Row label="Node runtime">{v.data?.node ?? '—'}</Row>
                    <Separator className="my-3 opacity-70" />
                    <Row label="Dashboard user">{me?.username ?? me?.userId ?? '—'}</Row>
                    <Row label="Current guild id from token">{me?.guildId ?? '—'}</Row>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Session</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-zinc-400 html.light:text-zinc-600">
                        Disconnect revokes dashboard access locally, posts a no-op logout to the backend, then returns you
                        to the public landing page with storage cleared.
                    </p>
                    <Button variant="destructive" type="button" onClick={() => void disconnectDiscord()}>
                        Sign out of Discord
                    </Button>
                </CardContent>
            </Card>

            <p className="text-center text-[11px] text-zinc-500">
                This page build <span className="font-mono text-zinc-400 html.light:text-zinc-700">{BUILD_SHA}</span>
            </p>
        </div>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-wrap items-baseline gap-3">
            <span className="w-44 shrink-0 text-zinc-500">{label}</span>
            <span className="break-all text-zinc-200 html.light:text-zinc-900">{children}</span>
        </div>
    );
}
