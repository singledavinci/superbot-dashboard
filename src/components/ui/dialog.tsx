import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';
import { Button } from './button';

export function Dialog(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger {...props} />;
}

export function DialogPortal(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal {...props} />;
}

export function DialogClose(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close {...props} />;
}

export function DialogOverlay({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65',
                className,
            )}
            {...props}
        />
    );
}

export function DialogContent({
    className,
    children,
    ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-zinc-600 bg-zinc-950 p-6 shadow-xl duration-200 outline-none html.light:bg-white html.light:border-zinc-300',
                    className,
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close
                    aria-label="Close"
                    className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
                    asChild
                >
                    <Button variant="ghost" size="icon" className="size-8">
                        <XIcon />
                    </Button>
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPortal>
    );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-1.5 text-left', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
    return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
}

export function DialogDescription({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
    return <DialogPrimitive.Description className={cn('text-sm text-zinc-400 html.light:text-zinc-600', className)} {...props} />;
}
