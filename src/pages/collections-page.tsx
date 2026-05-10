import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { deleteCollectionReq, guildCollections, patchCollection, postCollection } from '../lib/api';
import { useActiveGuild } from '../providers/active-guild-provider';
import type { TrackedCollection } from '../types';

const collectionFormSchema = z.object({
    contract: z.string().trim().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be contract 0x + 40 hex'),
    name: z.string().trim().min(1, 'Name is required'),
});

type CollForm = z.infer<typeof collectionFormSchema>;

function thumb(contract: string) {
    const seed = contract.slice(2, 14);
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}

export function CollectionsPage() {
    const { guildId } = useActiveGuild();
    const qc = useQueryClient();

    const colQ = useQuery({
        queryKey: ['guild', guildId, 'collections'],
        queryFn: () => guildCollections(guildId!),
        enabled: !!guildId,
    });

    const invalidate = () => void qc.invalidateQueries({ queryKey: ['guild', guildId] });

    const addMutation = useMutation({
        mutationFn: (data: CollForm) =>
            postCollection(guildId!, {
                contract: data.contract.trim(),
                name: data.name.trim(),
            }),
        onSuccess: () => {
            toast.success('Collection tracked');
            invalidate();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save collection'),
    });

    const delMutation = useMutation({
        mutationFn: (id: string) => deleteCollectionReq(guildId!, id),
        onSuccess: () => {
            toast.success('Collection removed');
            invalidate();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete'),
    });

    const patchMutation = useMutation({
        mutationFn: ({
            id,
            patch,
        }: {
            id: string;
            patch: Record<string, unknown>;
        }) => patchCollection(guildId!, id, patch),
        onSuccess: () => {
            toast.success('Saved');
            invalidate();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
    });

    const form = useForm<CollForm>({
        resolver: zodResolver(collectionFormSchema),
        mode: 'onChange',
        defaultValues: { contract: '', name: '' },
    });

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold md:text-3xl">Tracked Collections</h1>
                    <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                        Collections drive sweep, mint-radar companions, listing/delist bursts, and floor alerts.
                        Thresholds persist to SuperBot instantly.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" className="gap-2">
                            <PlusIcon />
                            Add collection
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Track a collection</DialogTitle>
                            <DialogDescription>Contract must already be monitored intents from your Discord workflows.</DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={form.handleSubmit((data) => {
                                addMutation.mutate(data, {
                                    onSuccess: () => {
                                        form.reset();
                                        setOpen(false);
                                    },
                                });
                            })}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="c-contract">Contract</Label>
                                <Input id="c-contract" placeholder="0x…" {...form.register('contract')} />
                                {form.formState.errors.contract ? (
                                    <p className="text-xs text-rose-400" role="alert">
                                        {form.formState.errors.contract.message}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="c-name">Display name</Label>
                                <Input id="c-name" {...form.register('name')} />
                                {form.formState.errors.name ? (
                                    <p className="text-xs text-rose-400" role="alert">
                                        {form.formState.errors.name.message}
                                    </p>
                                ) : null}
                            </div>
                            <Button type="submit" disabled={!form.formState.isValid || addMutation.isPending}>
                                Save collection
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="overflow-hidden p-0">
                <CardHeader className="px-6">
                    <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-6">
                    {colQ.isPending ? (
                        <div className="space-y-2 px-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : !colQ.data?.length ? (
                        <div className="px-12 py-14 text-center text-sm text-zinc-400 html.light:text-zinc-600">
                            No collections tracked yet — add a contract so SuperBot knows where to anchor floor, sweep,
                            and listing alerts for this Discord.
                            <div className="mt-4">
                                <Button type="button" onClick={() => setOpen(true)}>
                                    Track collection
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 px-4 md:px-6">
                            {(colQ.data as TrackedCollection[]).map((c) =>
                                !c.id ? null : (
                                    <CollectionInlineRow
                                        key={c.id}
                                        row={c as Required<TrackedCollection> & { id: string }}
                                        busy={patchMutation.isPending && editing === c.id}
                                        onSubmit={(patch) => {
                                            setEditing(c.id!);
                                            patchMutation.mutate({ id: c.id!, patch }, { onSettled: () => setEditing(null) });
                                        }}
                                        onDelete={() => {
                                            if (!confirm(`Stop tracking ${c.name}?`)) return;
                                            delMutation.mutate(c.id!);
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function CollectionInlineRow({
    row,
    onSubmit,
    onDelete,
    busy,
}: {
    row: TrackedCollection & { id: string };
    onSubmit: (patch: Record<string, unknown>) => void;
    onDelete: () => void;
    busy: boolean;
}) {
    type F = {
        sweep: string;
        massList: string;
        floorDrop: string;
        floorRise: string;
    };

    function parseBucket(raw: string, allowFloat: boolean, label: string): number | null | undefined {
        const t = raw.trim();
        if (!t) return null;
        const n = allowFloat ? Number(t) : parseInt(t, 10);
        if (!Number.isFinite(n) || (allowFloat ? n < 0 : !Number.isInteger(n) || n < 0)) {
            toast.error(`${label}: enter a valid number`);
            return undefined;
        }
        return allowFloat ? n : n;
    }

    const form = useForm<F>({
        defaultValues: {
            sweep: row.sweepThresholdNative != null ? String(row.sweepThresholdNative) : '',
            massList: row.massListingThreshold != null ? String(row.massListingThreshold) : '',
            floorDrop: row.floorAlertPct != null ? String(row.floorAlertPct) : '',
            floorRise: row.floorRiseAlertPct != null ? String(row.floorRiseAlertPct) : '',
        },
        mode: 'onChange',
    });

    const submitInner = form.handleSubmit((data) => {
        const sweep = parseBucket(data.sweep, true, 'Sweep threshold');
        const mass = parseBucket(data.massList, false, 'Mass listings');
        const drop = parseBucket(data.floorDrop, true, 'Floor drop');
        const rise = parseBucket(data.floorRise, true, 'Floor rise');
        if (sweep === undefined || mass === undefined || drop === undefined || rise === undefined) return;
        onSubmit({
            sweepThresholdNative: sweep,
            massListingThreshold: mass,
            floorAlertPct: drop,
            floorRiseAlertPct: rise,
        });
    });

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-700 p-4 md:flex-row md:items-start md:gap-6 html.light:border-zinc-200">
            <img src={thumb(row.contractAddress)} alt="" width={72} height={72} className="size-[72px] rounded-lg bg-zinc-800 object-cover html.light:bg-zinc-100" />

            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="truncate text-lg font-semibold">{row.name}</div>
                        <div className="truncate font-mono text-xs text-zinc-400">{row.contractAddress}</div>
                    </div>
                    <Button variant="destructive" size="sm" type="button" onClick={onDelete}>
                        <Trash2Icon className="mr-1 size-4" />
                        Remove
                    </Button>
                </div>

                <form
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitInner();
                    }}
                >
                    <div className="grid gap-1">
                        <Label className="text-[11px] uppercase tracking-wide text-zinc-500">Sweep (Ξ min)</Label>
                        <Input type="number" step="any" {...form.register('sweep')} />
                    </div>
                    <div className="grid gap-1">
                        <Label className="text-[11px] uppercase tracking-wide text-zinc-500">Mass listing (#)</Label>
                        <Input type="number" step="1" {...form.register('massList')} />
                    </div>
                    <div className="grid gap-1">
                        <Label className="text-[11px] uppercase tracking-wide text-zinc-500">Floor drop %</Label>
                        <Input type="number" step="any" {...form.register('floorDrop')} />
                    </div>
                    <div className="grid gap-1">
                        <Label className="text-[11px] uppercase tracking-wide text-zinc-500">Floor rise %</Label>
                        <Input type="number" step="any" {...form.register('floorRise')} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <Button type="submit" size="sm" disabled={busy}>
                            {busy ? 'Saving…' : 'Save thresholds'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
