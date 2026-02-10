import { useState } from 'react';
import { type Hex } from 'viem';
import { Account } from 'viem/tempo';
import { useToast } from './useToast';
import { KeyAuthorization } from 'ox/tempo';
import { generateEphemeralKeyPair, computeAuthorizationDigest } from '../utils/crypto';

export function useSubscription(
    credentialId: string | null,
    publicKey: Hex | null,
    userAddress: Hex | null
) {
    const toast = useToast();
    const [status, setStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle');
    const [subKey, setSubKey] = useState<Hex | null>(null);

    const subscribe = async (planId: string, amount: number) => {
        if (!credentialId || !publicKey || !userAddress) {
            toast.error('Please register a passkey first!');
            return;
        }

        try {
            setStatus('authorizing');
            console.log(`[UI] Starting subscription for plan: ${planId}`);

            // 1. Generate Ephemeral Key (Subscription Key) — P256
            const ephemeral = generateEphemeralKeyPair();
            console.log('[UI] Generated Subscription Key:', ephemeral.address);

            // 2. Create Auth Payload using SDK
            const expiry = Math.floor(Date.now() / 1000) + 31536000;
            // Limit = 12x the plan amount (allow recurring payments up to 12 times)
            const limitAmount = BigInt(amount * 12 * 1_000_000); // 6 decimals

            const MOCK_USDC = '0x20c0000000000000000000000000000000000001' as Hex;
            const NATIVE_TOKEN = '0x20c0000000000000000000000000000000000000' as Hex;

            const authorization = KeyAuthorization.from({
                address: ephemeral.address,
                chainId: 42431n,
                type: 'p256',
                expiry: expiry,
                limits: [
                    { token: MOCK_USDC, limit: limitAmount }, // Subscription Payment
                    { token: NATIVE_TOKEN, limit: BigInt(50 * 1_000_000) } // Gas Fees (Allow ~50 Native Tokens)
                ],
            });

            // 3. Compute Digest using SDK
            const digest = computeAuthorizationDigest(authorization);
            console.log('[UI] Authorization Digest:', digest);

            // 4. Sign with WebAuthn Passkey (biometric prompt)
            const account = Account.fromWebAuthnP256({
                id: credentialId,
                publicKey: publicKey,
            });

            console.log('[UI] Requesting biometric signature...');
            const signature = await account.sign({ hash: digest });
            console.log('[UI] WebAuthn Signature:', signature);

            // 5. Send to Backend
            const endpoints = [
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/subscribe`,
                '/api/subscribe',
            ];

            let response;
            let success = false;

            for (const url of endpoints) {
                try {
                    console.log(`[UI] Trying to connect to Backend at: ${url} ...`);
                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(
                            {
                                planId: planId,
                                userAddress: userAddress,
                                subscriptionPrivateKey: ephemeral.privateKey,
                                signedAuthorization: {
                                    authorization: authorization,
                                    signature: signature,
                                },
                            },
                            (_k, v) => (typeof v === 'bigint' ? v.toString() : v)
                        ),
                    });

                    if (response.ok) {
                        success = true;
                        console.log(`[UI] Connected successfully via ${url}`);
                        break;
                    }
                } catch (e) {
                    console.warn(`[UI] Failed to connect to ${url}`, e);
                }
            }

            if (!success || !response) {
                throw new Error('Could not connect to Backend Server on any port/address.');
            }

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Server rejected subscription');
            }

            const data = await response.json();
            console.log('[UI] Success:', data);

            setSubKey(ephemeral.address as Hex);
            setStatus('success');
            toast.success('Subscription active! Enjoy your premium access.');
        } catch (e: any) {
            console.error('Subscription failed:', e);
            toast.error(`Subscription failed: ${e.message || 'Unknown error'}`);
            setStatus('error');
        }
    };

    return { subscribe, status, subKey };
}
