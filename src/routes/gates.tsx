import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

import { API_BASE } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ActiveGuildProvider } from '../providers/active-guild-provider';
import { useSession } from '../providers/session-provider';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Skeleton } from '../components/ui/skeleton';

export function PublicEntry() {
    const qc = useQueryClient();
    const [params, setSearchParams] = useSearchParams();
    const { token, me, resolved, isPending, sessionError } = useSession();

    const [authErrorOnce] = useState(() =>
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('auth_error')
            : null,
    );

    useEffect(() => {
        if (!params.get('auth_error')) return;
        const next = new URLSearchParams(params);
        next.delete('auth_error');
        setSearchParams(next, { replace: true });
    }, [params, setSearchParams]);
    const noEligibleFromAuth = authErrorOnce === 'no_eligible_guild';

    if (noEligibleFromAuth) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 html.light:bg-zinc-50">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Discord sign-in completed</CardTitle>
                        <CardDescription>
                            No SuperBot servers were linked where you have Administrator or Manage Server. Invite the
                            bot and run <code className="text-cyan-600">/setup</code> in Discord, then try again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="secondary" asChild>
                            <a href="/">Back</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 html.light:bg-zinc-50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">SuperBot Admin</CardTitle>
                        <CardDescription>
                            Sign in with Discord to configure alerts, tracked wallets, and collections.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <a href={`${API_BASE}/api/v1/auth/discord`}>Continue with Discord</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (token && isPending) {
        return (
            <div className="flex min-h-screen flex-col gap-3 p-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full max-w-2xl" />
            </div>
        );
    }

    if (token && resolved && sessionError != null) {
        const msg =
            sessionError instanceof Error ? sessionError.message : 'Unable to verify your session with the API.';
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 html.light:bg-zinc-50">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Could not load session</CardTitle>
                        <CardDescription className="text-rose-400">{msg}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => qc.invalidateQueries({ queryKey: ['session', 'me'] })}>
                            Retry
                        </Button>
                        <Button asChild className="flex-1">
                            <a href={`${API_BASE}/api/v1/auth/discord`}>Sign in again</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!me) {
        return (
            <div className="flex min-h-screen flex-col gap-3 p-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full max-w-2xl" />
            </div>
        );
    }

    const eligible = me.eligibleGuildIds ?? [];
    if (eligible.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 html.light:bg-zinc-50">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Your bot isn&apos;t installed in any server you admin yet</CardTitle>
                        <CardDescription>
                            Run <code className="text-cyan-600">/setup</code> in your Discord server after inviting
                            SuperBot, then refresh this page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return <Navigate to="/app/overview" replace />;
}

export function AuthenticatedLayout() {
    const qc = useQueryClient();
    const { token, me, resolved, isPending, sessionError } = useSession();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col gap-3 p-6 md:p-10">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[480px] w-full" />
            </div>
        );
    }

    if (resolved && sessionError != null) {
        const msg =
            sessionError instanceof Error ? sessionError.message : 'Unable to verify your session with the API.';
        return (
            <div className="flex flex-1 flex-col gap-3 p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Could not load session</CardTitle>
                        <CardDescription className="text-rose-400">{msg}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => qc.invalidateQueries({ queryKey: ['session', 'me'] })}>
                            Retry
                        </Button>
                        <Button asChild>
                            <a href={`${API_BASE}/api/v1/auth/discord`}>Sign in again</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!me) {
        return (
            <div className="flex min-h-screen flex-col gap-3 p-6 md:p-10">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[480px] w-full" />
            </div>
        );
    }

    const eligible = me.eligibleGuildIds ?? [];
    if (eligible.length === 0) {
        return <Navigate to="/" replace />;
    }

    return (
        <ActiveGuildProvider me={me}>
            <DashboardLayout me={me}>
                <Outlet />
            </DashboardLayout>
        </ActiveGuildProvider>
    );
}
