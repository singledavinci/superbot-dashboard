import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { deleteWatchlistItem, listWatchlist, postWatchlistItem } from '../lib/api';

const schema = z.object({
    targetType: z.enum(['wallet', 'collection']),
    targetAddress: z.string().trim().regex(/^0x[a-fA-F0-9]{40}$/, 'Valid 0x address required'),
});

type WlForm = z.infer<typeof schema>;

export function WatchlistsPage() {
    const qc = useQueryClient();
    const listQ = useQuery({
        queryKey: ['watchlist'],
        queryFn: listWatchlist,
    });

    const addMut = useMutation({
        mutationFn: (body: WlForm) =>
            postWatchlistItem({
                targetType: body.targetType,
                targetAddress: body.targetAddress.toLowerCase(),
            }),
        onSuccess: () => {
            toast.success('Watchlist saved');
            void qc.invalidateQueries({ queryKey: ['watchlist'] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
    });

    const delMut = useMutation({
        mutationFn: (id: string) => deleteWatchlistItem(id),
        onSuccess: () => {
            toast.success('Removed');
            void qc.invalidateQueries({ queryKey: ['watchlist'] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Remove failed'),
    });

    const form = useForm<WlForm>({
        resolver: zodResolver(schema),
        defaultValues: { targetAddress: '', targetType: 'wallet' },
        mode: 'onChange',
    });

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Watchlists</h1>
                <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                    Personal bookmarks for wallets or collections synced with your Discord user id (stored in{' '}
                    <code className="text-xs font-mono text-cyan-500">Watchlist</code>).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add watchlist entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={form.handleSubmit((v) =>
                            addMut.mutate(v, {
                                onSuccess: () => form.reset({ targetAddress: '', targetType: v.targetType }),
                            }),
                        )}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="wt">Target kind</Label>
                            <select
                                id="wt"
                                className="flex h-9 w-full rounded-md border border-zinc-600 bg-zinc-900/70 px-3 text-sm outline-none html.light:border-zinc-300 html.light:bg-white html.light:text-zinc-950"
                                {...form.register('targetType')}
                                aria-label="Watchlist entry type"
                            >
                                <option value="wallet">Wallet</option>
                                <option value="collection">Collection contract</option>
                            </select>
                        </div>
                        <div className="grid gap-2 md:col-span-1 md:col-start-2">
                            <Label htmlFor="wv">Ethereum address</Label>
                            <Input id="wv" {...form.register('targetAddress')} />
                            {form.formState.errors.targetAddress ? (
                                <p className="text-xs text-rose-400" role="alert">
                                    {String(form.formState.errors.targetAddress.message)}
                                </p>
                            ) : null}
                        </div>
                        <div className="md:col-span-2">
                            <Button type="submit" disabled={!form.formState.isValid || addMut.isPending} className="gap-2">
                                <PlusIcon className="size-4" />
                                Add entry
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Saved watches</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {listQ.isPending ? (
                        <div className="space-y-3 p-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : !(listQ.data ?? []).length ? (
                        <p className="px-8 py-14 text-center text-sm text-zinc-400 html.light:text-zinc-600">
                            Watchlist empty — bookmark a whale wallet or NFT contract once you paste the canonical 0x
                            address above.
                        </p>
                    ) : (
                        <ul className="divide-y divide-zinc-800 html.light:divide-zinc-200">
                            {listQ.data!.map((w) => (
                                <li
                                    key={w.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
                                >
                                    <div>
                                        <div className="font-mono text-xs uppercase text-zinc-500">{w.targetType}</div>
                                        <div className="break-all font-mono text-[13px]">{w.targetAddress}</div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        type="button"
                                        disabled={delMut.isPending}
                                        onClick={() => delMut.mutate(w.id)}
                                        aria-label="Remove watchlist item"
                                    >
                                        <Trash2Icon className="size-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
