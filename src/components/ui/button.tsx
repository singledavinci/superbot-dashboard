import { Slot } from '@radix-ui/react-slot';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4',
    {
        variants: {
            variant: {
                default: 'bg-cyan-600 text-white hover:bg-cyan-500 dark:bg-cyan-500 dark:text-zinc-950',
                destructive: 'bg-rose-600 text-white hover:bg-rose-500',
                outline:
                    'border border-zinc-600 bg-transparent hover:bg-zinc-800 hover:text-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800 html.light:border-zinc-300 html.light:text-zinc-900 html.light:hover:bg-zinc-200',
                ghost: 'hover:bg-zinc-800 html.light:hover:bg-zinc-200',
                secondary: 'bg-zinc-800 text-zinc-50 hover:bg-zinc-700 html.light:bg-zinc-200 html.light:text-zinc-900 html.light:hover:bg-zinc-300',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-11 rounded-lg px-6',
                icon: 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref as never}
                type={asChild ? undefined : type}
                {...props}
            />
        );
    },
);

Button.displayName = 'Button';
