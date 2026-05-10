import * as SeparatorPrimitive from '@radix-ui/react-separator';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/utils';

export function Separator({
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            className={cn(
                'shrink-0 bg-zinc-700 html.light:bg-zinc-200',
                props.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
                className,
            )}
            {...props}
        />
    );
}
