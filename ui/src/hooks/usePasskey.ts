import { useState, useEffect, useCallback } from 'react';
import { type Hex } from 'viem';
import { Account, WebAuthnP256 } from 'viem/tempo';
import { useToast } from './useToast';

const STORAGE_KEY = 'substream_passkey';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

type StoredCredential = {
    id: string;
    publicKey: Hex;
    address: Hex;
};

export function usePasskey() {
    const toast = useToast();
    const [credentialId, setCredentialId] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<Hex | null>(null);
    const [address, setAddress] = useState<Hex | null>(null);

    // Load stored credential on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: StoredCredential = JSON.parse(stored);
                console.log('[usePasskey] Loaded from storage:', parsed.address);
                setCredentialId(parsed.id);
                setPublicKey(parsed.publicKey);
                setAddress(parsed.address);
            } catch (e) {
                console.error('[usePasskey] Storage parse error', e);
                localStorage.removeItem(STORAGE_KEY);
            }
        } else {
            console.log('[usePasskey] No credentials found in storage');
        }
    }, []);

    const register = useCallback(async () => {
        try {
            console.log('[usePasskey] Starting registration...');
            const credential = await WebAuthnP256.createCredential({ label: 'SubStream' });

            const account = Account.fromWebAuthnP256({
                id: credential.id,
                publicKey: credential.publicKey,
            });

            const stored: StoredCredential = {
                id: credential.id,
                publicKey: credential.publicKey,
                address: account.address as Hex,
            };

            // Store public key on the backend for future login
            await fetch(`${API_URL}/credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stored),
            });

            console.log('[usePasskey] Registered new account:', stored.address);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            setCredentialId(stored.id);
            setPublicKey(stored.publicKey);
            setAddress(stored.address);
            toast.success('Registration successful! Your passkey is ready.');

            return stored;
        } catch (error: any) {
            console.error('Passkey registration failed:', error);
            toast.error(`Registration failed: ${error.message || 'Unknown error'}`);
            throw error;
        }
    }, []);

    const login = useCallback(async () => {
        try {
            console.log('[usePasskey] Starting login...');

            // Fetch all known credential IDs so the browser can match one
            const idsRes = await fetch(`${API_URL}/credentials`);
            if (!idsRes.ok) {
                throw new Error('Failed to fetch credentials from server. Is the backend running?');
            }
            const { credentialIds } = await idsRes.json();
            if (!credentialIds || credentialIds.length === 0) {
                throw new Error('No registered accounts found. Please register first.');
            }

            const credential = await WebAuthnP256.getCredential({
                credentialId: credentialIds,
                async getPublicKey(cred) {
                    const res = await fetch(`${API_URL}/credentials?id=${encodeURIComponent(cred.id)}`);
                    if (!res.ok) throw new Error('Credential not found on server. Please register first.');
                    const data = await res.json();
                    return data.publicKey as Hex;
                },
            });

            const account = Account.fromWebAuthnP256({
                id: credential.id,
                publicKey: credential.publicKey,
            });

            const stored: StoredCredential = {
                id: credential.id,
                publicKey: credential.publicKey,
                address: account.address as Hex,
            };

            console.log('[usePasskey] Logged in as:', stored.address);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            setCredentialId(stored.id);
            setPublicKey(stored.publicKey);
            setAddress(stored.address);
            toast.success('Login successful! Welcome back.');

            return stored;
        } catch (error: any) {
            console.error('Passkey login failed:', error);
            toast.error(`Login failed: ${error.message || 'Unknown error'}`);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        console.log('[usePasskey] Logging out...');
        localStorage.removeItem(STORAGE_KEY);
        setCredentialId(null);
        setPublicKey(null);
        setAddress(null);
        toast.info('Logged out successfully.');
        // Force reload to clear any app state
        setTimeout(() => window.location.reload(), 1000);
    }, [toast]);

    return {
        register,
        login,
        logout,
        address,
        credentialId,
        publicKey,
        isRegistered: !!credentialId,
    };
}
