import { type InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '../../lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(
            'flex h-9 w-full min-w-0 rounded-md border border-zinc-600 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 shadow-sm outline-none transition-colors placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:pointer-events-none disabled:opacity-50',
            'html.light:border-zinc-300 html.light:bg-white html.light:text-zinc-900',
            className,
        )}
        {...props}
    />
));

Input.displayName = 'Input';
