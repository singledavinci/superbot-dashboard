import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { deleteWalletReq, guildWallets, postWallet } from '../lib/api';
import { useEnsLabel } from '../hooks/useEnsLabel';
import { useActiveGuild } from '../providers/active-guild-provider';
import type { WatchedWallet } from '../types';

const walletSchema = z.object({
    address: z
        .string()
        .trim()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address (0x + 40 hex digits)'),
    label: z.string().trim().optional(),
    alertChannelId: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || /^\d{17,20}$/.test(v), 'Channel id must be a Discord snowflake'),
});

type WalletForm = z.infer<typeof walletSchema>;

function EnsCell({ addr }: { addr: string }) {
    const q = useEnsLabel(addr);
    if (q.isPending) return <Skeleton className="inline-block h-4 w-24" />;
    return <span className="text-zinc-400">{q.data ?? '—'}</span>;
}

export function WalletsPage() {
    const { guildId } = useActiveGuild();
    const qc = useQueryClient();

    const walletsQ = useQuery({
        queryKey: ['guild', guildId, 'wallets'],
        queryFn: () => guildWallets(guildId!),
        enabled: !!guildId,
    });

    const invalidate = () => {
        void qc.invalidateQueries({ queryKey: ['guild', guildId] });
    };

    const addMutation = useMutation({
        mutationFn: (data: WalletForm) =>
            postWallet(guildId!, {
                address: data.address.trim(),
                label: data.label?.trim() || undefined,
                alertChannelId: data.alertChannelId?.trim() || null,
            }),
        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ['guild', guildId, 'wallets'] });
        },
        onSuccess: () => {
            toast.success('Wallet added');
            invalidate();
        },
        onError: (e) => {
            toast.error(e instanceof Error ? e.message : 'Failed to add wallet');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (walletId: string) => deleteWalletReq(guildId!, walletId),
        onSuccess: () => {
            toast.success('Wallet removed');
            invalidate();
        },
        onError: (e) => {
            toast.error(e instanceof Error ? e.message : 'Remove failed');
        },
    });

    const form = useForm<WalletForm>({
        resolver: zodResolver(walletSchema),
        mode: 'onChange',
        defaultValues: { address: '', label: '', alertChannelId: '' },
    });

    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold md:text-3xl">Watched Wallets</h1>
                    <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                        Track addresses for whale buy, sell, and mint alerts in this server.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" className="gap-2 self-start sm:self-auto">
                            <PlusIcon />
                            Add wallet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add wallet</DialogTitle>
                            <DialogDescription>Paste a checksummed or lowercase 0x wallet address.</DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={form.handleSubmit((data) => {
                                addMutation.mutate(data, {
                                    onSuccess: () => {
                                        form.reset();
                                        setDialogOpen(false);
                                    },
                                });
                            })}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="addr">Address</Label>
                                <Input id="addr" autoComplete="off" placeholder="0x…" {...form.register('address')} />
                                {form.formState.errors.address ? (
                                    <p className="text-xs text-rose-400" role="alert">
                                        {form.formState.errors.address.message}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="label">Label (optional)</Label>
                                <Input id="label" placeholder="e.g. Whale fund" {...form.register('label')} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ch">Alert channel id (optional)</Label>
                                <Input id="ch" placeholder="Discord channel snowflake" {...form.register('alertChannelId')} />
                                {form.formState.errors.alertChannelId ? (
                                    <p className="text-xs text-rose-400" role="alert">
                                        {form.formState.errors.alertChannelId.message}
                                    </p>
                                ) : null}
                            </div>
                            <Button
                                type="submit"
                                disabled={!form.formState.isValid || addMutation.isPending}
                                className="w-full sm:w-auto"
                            >
                                {addMutation.isPending ? 'Saving…' : 'Save wallet'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Tracked addresses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {walletsQ.isPending ? (
                        <div className="space-y-2 p-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : !walletsQ.data?.length ? (
                        <div className="p-12 text-center text-sm text-zinc-400 html.light:text-zinc-600">
                            No tracked wallets yet — add your first to start receiving whale alerts routed for this guild.
                            <div className="mt-4">
                                <Button type="button" onClick={() => setDialogOpen(true)}>
                                    Add wallet
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead className="bg-zinc-900/70 text-xs uppercase text-zinc-500 html.light:bg-zinc-50">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Label</th>
                                            <th className="px-5 py-3 font-medium">Address</th>
                                            <th className="px-5 py-3 font-medium">ENS</th>
                                            <th className="px-5 py-3 font-medium">Added</th>
                                            <th className="px-5 py-3 font-medium" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 html.light:divide-zinc-200">
                                        {(walletsQ.data as WatchedWallet[]).map((w) => (
                                            <tr key={w.id ?? w.address} className="hover:bg-zinc-900/50 html.light:hover:bg-zinc-50">
                                                <td className="px-5 py-3 font-medium">{w.label ?? '—'}</td>
                                                <td className="max-w-[200px] truncate px-5 py-3 font-mono text-xs">{w.address}</td>
                                                <td className="px-5 py-3">
                                                    <EnsCell addr={w.address} />
                                                </td>
                                                <td className="px-5 py-3 text-xs text-zinc-400">
                                                    {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-rose-400 hover:text-rose-300"
                                                        disabled={deleteMutation.isPending || !w.id}
                                                        aria-label="Remove wallet"
                                                        onClick={() => {
                                                            if (
                                                                !w.id ||
                                                                !confirm(
                                                                    `Remove ${w.label || w.address.slice(0, 8)}… from tracking?`,
                                                                )
                                                            ) {
                                                                return;
                                                            }
                                                            deleteMutation.mutate(w.id);
                                                        }}
                                                    >
                                                        <Trash2Icon />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y divide-zinc-800 p-4 md:hidden html.light:divide-zinc-200">
                                {(walletsQ.data as WatchedWallet[]).map((w) => (
                                    <article key={w.id ?? w.address} className="flex flex-col gap-2 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="font-medium">{w.label ?? 'Untitled wallet'}</span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="button"
                                                disabled={deleteMutation.isPending || !w.id}
                                                onClick={() => {
                                                    if (
                                                        !w.id ||
                                                        !confirm(
                                                            `Remove ${w.label || w.address.slice(0, 8)}… from tracking?`,
                                                        )
                                                    ) {
                                                        return;
                                                    }
                                                    deleteMutation.mutate(w.id);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <span className="break-all font-mono text-[11px] text-zinc-400">{w.address}</span>
                                        <div className="text-xs text-zinc-500">
                                            ENS <EnsCell addr={w.address} />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
