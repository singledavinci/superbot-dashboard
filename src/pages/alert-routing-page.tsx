import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { COLLECTION_SCOPED_ALERT_TYPES, DASHBOARD_ALERT_TYPES } from '../lib/constants';
import { deleteGuildAlertChannel, guildAlertChannels, putGuildAlertChannel } from '../lib/api';
import { cn } from '../lib/utils';
import { useActiveGuild } from '../providers/active-guild-provider';

const routingRowSchema = z.object({
    discordChannelId: z
        .string()
        .trim()
        .regex(/^\d{17,20}$/, 'Discord channel id must be 17–20 digits'),
    mentionRoleId: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || /^\d{17,20}$/.test(v), 'Role id must be numeric'),
});

export function AlertRoutingPage() {
    const { guildId } = useActiveGuild();
    const qc = useQueryClient();

    const routingQ = useQuery({
        queryKey: ['guild', guildId, 'alertChannels'],
        queryFn: () => guildAlertChannels(guildId!),
        enabled: !!guildId,
    });

    const saveMutation = useMutation({
        mutationFn: ({
            alertType,
            body,
        }: {
            alertType: string;
            body: z.infer<typeof routingRowSchema>;
        }) =>
            putGuildAlertChannel(guildId!, alertType, {
                discordChannelId: body.discordChannelId.trim(),
                mentionRoleId: body.mentionRoleId?.trim() || null,
                name: alertType,
            }),
        onSuccess: () => {
            toast.success('Routing saved');
            void qc.invalidateQueries({ queryKey: ['guild', guildId, 'alertChannels'] });
            void qc.invalidateQueries({ queryKey: ['guild', guildId] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Save failed'),
    });

    const clearMutation = useMutation({
        mutationFn: (alertType: string) => deleteGuildAlertChannel(guildId!, alertType),
        onSuccess: () => {
            toast.success('Cleared routing');
            void qc.invalidateQueries({ queryKey: ['guild', guildId, 'alertChannels'] });
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Clear failed'),
    });

    const byType = new Map((routingQ.data ?? []).map((c) => [c.alertType, c]));

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Alert routing</h1>
                <p className="mt-2 text-sm text-zinc-400 html.light:text-zinc-600">
                    Map outbound alert types to Discord channels. Values persist on the backend as{' '}
                    <code className="font-mono text-xs text-cyan-400 html.light:text-cyan-700">AlertChannel</code> rows per
                    server + alert combination.
                </p>
                <Card className="mt-4 border border-amber-500/35 bg-amber-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-amber-200 html.light:text-amber-950">
                            Collection-scoped deliveries
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-zinc-300 html.light:text-zinc-700">
                        {COLLECTION_SCOPED_ALERT_TYPES.join(', ')} still respect each collection&apos;s own channel overrides
                        in <strong className="font-medium">Tracked Collections</strong>. The rows below steer worker defaults
                        and global intents (whale batches, Mint Radar).
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-6">
                {routingQ.isPending ? (
                    <>
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </>
                ) : (
                    DASHBOARD_ALERT_TYPES.map((alertType) => (
                        <AlertTypeRow
                            key={alertType}
                            alertType={alertType}
                            existing={byType.get(alertType)}
                            busyType={saveMutation.variables?.alertType}
                            clearing={clearMutation.isPending}
                            saving={saveMutation.isPending}
                            onSave={(vals) =>
                                saveMutation.mutate({
                                    alertType,
                                    body: vals,
                                })
                            }
                            onClear={() => {
                                if (!byType.has(alertType)) {
                                    toast.message('Nothing to clear yet');
                                    return;
                                }
                                if (!confirm(`Remove saved routing for ${alertType}?`)) return;
                                clearMutation.mutate(alertType);
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function AlertTypeRow({
    alertType,
    existing,
    onSave,
    onClear,
    saving,
    clearing,
    busyType,
}: {
    alertType: string;
    existing?: import('../types').AlertChannelRow | undefined;
    onSave: (v: z.infer<typeof routingRowSchema>) => void;
    onClear: () => void;
    saving: boolean;
    clearing: boolean;
    busyType?: string;
}) {
    const form = useForm<z.infer<typeof routingRowSchema>>({
        resolver: zodResolver(routingRowSchema),
        defaultValues: {
            discordChannelId: existing?.discordChannelId ?? '',
            mentionRoleId: existing?.mentionRoleId ?? '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        form.reset({
            discordChannelId: existing?.discordChannelId ?? '',
            mentionRoleId: existing?.mentionRoleId ?? '',
        });
    }, [existing?.id, existing?.discordChannelId, existing?.mentionRoleId, form]);

    const rowBusy = saving && busyType === alertType;

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="font-mono text-sm">{alertType}</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
                    onSubmit={form.handleSubmit((data) => onSave(data))}
                >
                    <div className="grid gap-1">
                        <Label htmlFor={`ch-${alertType}`}>Discord channel ID</Label>
                        <Input id={`ch-${alertType}`} {...form.register('discordChannelId')} autoComplete="off" />
                        {form.formState.errors.discordChannelId ? (
                            <p className="text-xs text-rose-400" role="alert">
                                {String(form.formState.errors.discordChannelId.message)}
                            </p>
                        ) : null}
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor={`role-${alertType}`}>Role ping ID (optional)</Label>
                        <Input id={`role-${alertType}`} {...form.register('mentionRoleId')} autoComplete="off" />
                        {form.formState.errors.mentionRoleId ? (
                            <p className="text-xs text-rose-400" role="alert">
                                {String(form.formState.errors.mentionRoleId.message)}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex gap-2 md:flex-col md:justify-end">
                        <Button type="submit" disabled={!form.formState.isValid || rowBusy} className={cn('md:w-full')}>
                            {rowBusy ? <Loader2Icon className="size-4 animate-spin" /> : 'Save'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="md:w-full"
                            disabled={clearing || rowBusy}
                            onClick={onClear}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
