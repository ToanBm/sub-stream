import { createWalletClient, http, parseAbi, type Hex, defineChain } from 'viem';
import { Account, withFeePayer } from 'viem/tempo';
import { tempoTestnet } from 'viem/chains';
import { usePasskey } from './usePasskey';

const USDC_ADDRESS = '0x20c0000000000000000000000000000000000001';
const RPC_URL = 'https://rpc.moderato.tempo.xyz/';
const FEE_PAYER_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/fee-payer` : 'http://localhost:3001/fee-payer';

const tempoModerato = defineChain({
    ...tempoTestnet,
    id: 42431,
    name: 'Tempo Moderato',
    rpcUrls: {
        default: { http: [RPC_URL] },
    },
});

export function useWalletActions() {
    const { credentialId, publicKey } = usePasskey();

    const withdrawUSDC = async (to: string, amount: number) => {
        if (!credentialId || !publicKey) throw new Error("Not logged in");

        console.log('[DevTools] Creating Account from Passkey...');
        const account = Account.fromWebAuthnP256({
            id: credentialId,
            publicKey: publicKey as Hex,
        });

        const client = createWalletClient({
            account,
            chain: tempoModerato,
            transport: withFeePayer(http(RPC_URL), http(FEE_PAYER_URL)),
        });

        console.log(`[DevTools] Sending ${amount} USDC to ${to}...`);

        // USDC Transfer ABI
        const abi = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

        try {
            const hash = await client.writeContract({
                address: USDC_ADDRESS,
                abi,
                functionName: 'transfer',
                args: [to as Hex, BigInt(amount * 1_000_000)],
                feePayer: true,
            });
            console.log('[DevTools] Tx Hash:', hash);
            return hash;
        } catch (e) {
            console.error('[DevTools] Withdraw failed:', e);
            throw e;
        }
    };

    return { withdrawUSDC };
}
