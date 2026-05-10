import { useQueries } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { guildRecentAlerts, guildStats, guildStatus } from '../lib/api';
import { useActiveGuild } from '../providers/active-guild-provider';

export function OverviewPage() {
    const { guildId } = useActiveGuild();

    const [statsQ, recentQ, statusQ] = useQueries({
        queries: [
            {
                queryKey: ['guild', guildId, 'stats'],
                queryFn: () => guildStats(guildId!),
                enabled: !!guildId,
            },
            {
                queryKey: ['guild', guildId, 'recent'],
                queryFn: () => guildRecentAlerts(guildId!),
                enabled: !!guildId,
            },
            {
                queryKey: ['guild', guildId, 'status'],
                queryFn: () => guildStatus(guildId!),
                enabled: !!guildId,
            },
        ],
    });

    const loading = statsQ.isPending || recentQ.isPending || statusQ.isPending;

    const walletsCount = statsQ.data?.wallets ?? statusQ.data?.wallets ?? null;
    const collectionsCount = statsQ.data?.collections ?? statusQ.data?.collections ?? null;
    const alertsLast24 = statsQ.data?.alertsLast24h ?? null;
    const deliveredToday = statsQ.data?.deliveredTodayByType ?? null;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Overview</h1>
                <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                    Live snapshot for this Discord server&apos;s tracked wallets, collections, and delivered alerts.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    <>
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 html.light:text-zinc-600">
                                    Tracked wallets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-semibold tabular-nums">{walletsCount ?? '—'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 html.light:text-zinc-600">
                                    Tracked collections
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-semibold tabular-nums">{collectionsCount ?? '—'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 html.light:text-zinc-600">
                                    Alerts delivered (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-semibold tabular-nums">
                                    {typeof alertsLast24 === 'number' ? alertsLast24 : '—'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 html.light:text-zinc-600">
                                    Alert mix (today UTC)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 html.light:text-zinc-600">
                                    {deliveredToday && Object.keys(deliveredToday).length > 0
                                        ? Object.entries(deliveredToday)
                                              .map(([k, v]) => `${k}: ${String(v)}`)
                                              .slice(0, 4)
                                              .join(' · ')
                                        : statusQ.data
                                          ? `${statusQ.data.channels ?? 0} alert routes configured`
                                          : 'No deliveries recorded yet'}
                                </p>
                                {deliveredToday && Object.keys(deliveredToday).length > 4 ? (
                                    <p className="mt-1 text-xs text-zinc-500">Showing first types in subtitle — full list grows with traffic.</p>
                                ) : null}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Recent deliveries</CardTitle>
                    <p className="text-sm text-zinc-400 html.light:text-zinc-600">
                        Last twenty alert deliveries routed to channels linked with this guild (past 24h).
                    </p>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                    {recentQ.isPending ? (
                        <div className="space-y-2">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                    ) : !(recentQ.data ?? []).length ? (
                        <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-400 html.light:border-zinc-300">
                            No recent activity yet — deliveries will appear here after SuperBot posts to your configured
                            channels.
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-800 html.light:divide-zinc-200">
                            {(recentQ.data ?? []).map((row) => (
                                <li
                                    key={row.id}
                                    className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <span className="font-mono text-xs text-cyan-400 html.light:text-cyan-700">
                                            {row.alertType}
                                        </span>
                                        <span className="mx-2 text-zinc-600">·</span>
                                        <span className="text-zinc-300 html.light:text-zinc-800">{row.status}</span>
                                    </div>
                                    <div className="font-mono text-[11px] text-zinc-500">
                                        {new Date(row.createdAt).toLocaleString()} · ch {row.channelId.slice(0, 6)}…
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
