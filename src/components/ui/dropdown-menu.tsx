import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export function DropdownMenu(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) {
    return <DropdownMenuPrimitive.Root {...props} />;
}

export function DropdownMenuTrigger(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>) {
    return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuContent({
    className,
    sideOffset = 4,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 min-w-48 rounded-md border border-zinc-700 bg-zinc-950 p-1 shadow-xl html.light:border-zinc-200 html.light:bg-white',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownMenuItem({
    className,
    inset,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                'focus:bg-zinc-800 focus:text-zinc-50 relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 html.light:focus:bg-zinc-100',
                inset ? 'pl-8' : '',
                className,
            )}
            {...props}
        />
    );
}

export function DropdownMenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('text-muted-foreground px-3 py-1.5 text-xs font-semibold', className)} {...props} />
    );
}

export function DropdownMenuSeparator({
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
    return <DropdownMenuPrimitive.Separator className="bg-muted -mx-1 my-1 h-px" {...props} />;
}

export function DropdownMenuRadioGroup(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

export function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            className={cn(
                'focus:bg-zinc-800 relative flex cursor-pointer select-none items-center rounded py-2 pr-8 pl-3 text-sm outline-none html.light:focus:bg-zinc-100',
                className,
            )}
            {...props}
        >
            <span className="absolute right-3 flex size-4 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

export function DropdownMenuCheckboxItem({
    className,
    children,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            className={cn(
                'focus:bg-zinc-800 relative flex cursor-pointer select-none items-center rounded py-2 pr-8 pl-3 text-sm outline-none html.light:focus:bg-zinc-100',
                className,
            )}
            {...props}
        >
            <span className="absolute right-3 flex size-4 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <CheckIcon className="size-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

export function DropdownMenuShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span className={cn('text-muted-foreground ml-auto text-xs tracking-widest opacity-75', className)} {...props} />
    );
}

export function DropdownMenuSub(props: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Sub>) {
    return <DropdownMenuPrimitive.Sub {...props} />;
}

export function DropdownMenuSubTrigger({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            className={cn(
                'focus:bg-zinc-800 flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm outline-none html.light:focus:bg-zinc-100',
                className,
            )}
            {...props}
        >
            {props.children}
            <ChevronRightIcon className="ml-auto size-4" />
        </DropdownMenuPrimitive.SubTrigger>
    );
}

export function DropdownMenuSubContent({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>) {
    return (
        <DropdownMenuPrimitive.SubContent
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out z-50 min-w-44 rounded-md border border-zinc-700 bg-zinc-950 p-1 shadow-lg html.light:border-zinc-200 html.light:bg-white',
                className,
            )}
            {...props}
        />
    );
}
