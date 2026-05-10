import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { guildCollections, patchCollection } from '../lib/api';
import { useActiveGuild } from '../providers/active-guild-provider';
import type { TrackedCollection } from '../types';

type FloorForm = {
    collectionId: string;
    floorDropPct: string;
    floorRisePct: string;
};

export function FloorAlertsPage() {
    const { guildId } = useActiveGuild();
    const qc = useQueryClient();
    const colQ = useQuery({
        queryKey: ['guild', guildId, 'collections'],
        queryFn: () => guildCollections(guildId!),
        enabled: !!guildId,
    });

    const mut = useMutation({
        mutationFn: (values: FloorForm) => {
            const patch: Record<string, unknown> = {};
            if (values.floorDropPct.trim()) {
                const n = Number(values.floorDropPct.trim());
                if (!Number.isFinite(n) || n <= 0) return Promise.reject(new Error('Floor drop % must be positive'));
                patch.floorAlertPct = n;
            }
            if (values.floorRisePct.trim()) {
                const n = Number(values.floorRisePct.trim());
                if (!Number.isFinite(n) || n <= 0) return Promise.reject(new Error('Floor rise % must be positive'));
                patch.floorRiseAlertPct = n;
            }
            if (Object.keys(patch).length === 0) {
                return Promise.reject(new Error('Enter at least one floor threshold'));
            }
            return patchCollection(guildId!, values.collectionId, patch);
        },
        onSuccess: () => {
            toast.success('Floor thresholds updated');
            void qc.invalidateQueries({ queryKey: ['guild', guildId, 'collections'] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
    });

    const clearMut = useMutation({
        mutationFn: ({ id }: { id: string }) =>
            patchCollection(guildId!, id, {
                floorAlertPct: null,
                floorRiseAlertPct: null,
            }),
        onSuccess: () => {
            toast.success('Floor alerts cleared');
            void qc.invalidateQueries({ queryKey: ['guild', guildId, 'collections'] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Clear failed'),
    });

    const form = useForm<FloorForm>({
        defaultValues: {
            collectionId: '',
            floorDropPct: '',
            floorRisePct: '',
        },
        mode: 'onChange',
    });

    const cid = form.watch('collectionId');
    useEffect(() => {
        const list = colQ.data as TrackedCollection[] | undefined;
        if (!cid || !list) return;
        const s = list.find((r) => r.id === cid);
        if (!s) return;
        form.reset(
            {
                collectionId: cid,
                floorDropPct: typeof s.floorAlertPct === 'number' ? String(s.floorAlertPct) : '',
                floorRisePct: typeof s.floorRiseAlertPct === 'number' ? String(s.floorRiseAlertPct) : '',
            },
            { keepDefaultValues: false },
        );
    }, [cid, colQ.data, form]);

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Floor alerts</h1>
                <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                    Mirrors{' '}
                    <code className="font-mono text-xs text-cyan-400 html.light:text-cyan-700">/floor-alert</code> thresholds
                    by applying percent moves on already tracked contracts.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configure thresholds</CardTitle>
                </CardHeader>
                <CardContent>
                    {colQ.isPending ? (
                        <Skeleton className="h-48 w-full" />
                    ) : !(colQ.data ?? []).some((r) => r.id) ? (
                        <div className="rounded-lg border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-400 html.light:border-zinc-300 html.light:text-zinc-700">
                            No tracked collections yet — add one under{' '}
                            <strong className="text-zinc-200 html.light:text-zinc-900">Tracked Collections</strong> before
                            floor alerts appear here.
                        </div>
                    ) : (
                        <form className="grid gap-4" onSubmit={form.handleSubmit((v) => mut.mutate(v))}>
                            <div className="grid gap-2">
                                <Label htmlFor="flo-col">Tracked collection</Label>
                                <select
                                    id="flo-col"
                                    className="flex h-9 w-full rounded-md border border-zinc-600 bg-zinc-900/70 px-3 text-sm outline-none html.light:border-zinc-300 html.light:bg-white html.light:text-zinc-950"
                                    aria-label="Collection for floor alert"
                                    {...form.register('collectionId')}
                                >
                                    <option value="">Select…</option>
                                    {(colQ.data ?? []).map((r) =>
                                        r.id ? (
                                            <option key={r.id} value={r.id}>
                                                {r.name} · {r.contractAddress.slice(0, 6)}…
                                            </option>
                                        ) : null,
                                    )}
                                </select>
                                {form.watch('collectionId') ? null : (
                                    <p className="text-xs text-zinc-500">Select a collection above to unlock saving.</p>
                                )}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="fl-drop">Floor drop % (fires when decline ≥)</Label>
                                    <Input id="fl-drop" type="number" step="any" {...form.register('floorDropPct')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fl-rise">Floor rise % (fires when surge ≥)</Label>
                                    <Input id="fl-rise" type="number" step="any" {...form.register('floorRisePct')} />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={!cid || mut.isPending}
                                className="gap-2"
                            >
                                {mut.isPending ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin" aria-hidden />
                                        Applying…
                                    </>
                                ) : (
                                    'Save thresholds'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!cid || mut.isPending || clearMut.isPending}
                                onClick={() => {
                                    if (!cid || !guildId) return;
                                    clearMut.mutate(
                                        { id: cid },
                                        {
                                            onSuccess: () => {
                                                form.setValue('floorDropPct', '');
                                                form.setValue('floorRisePct', '');
                                            },
                                        },
                                    );
                                }}
                            >
                                Disable both for this NFT
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
