import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
    chain: mainnet,
    transport: http('https://ethereum.publicnode.com'),
});

export function useEnsLabel(address: string | undefined) {
    const valid = typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/i.test(address);
    return useQuery({
        queryKey: ['ens', valid ? address.toLowerCase() : null],
        queryFn: () => client.getEnsName({ address: address!.toLowerCase() as `0x${string}` }),
        enabled: valid,
        staleTime: 900_000,
    });
}
