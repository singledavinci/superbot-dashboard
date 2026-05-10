import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '../../lib/utils';

export const Label = ({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) => (
    <LabelPrimitive.Root
        className={cn(
            'text-xs font-medium text-zinc-400 html.light:text-zinc-600',
            className,
        )}
        {...props}
    />
);
