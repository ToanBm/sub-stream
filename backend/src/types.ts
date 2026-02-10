import { Hex } from 'viem';

export enum SignatureType {
    Secp256k1 = 0,
    P256 = 1,
    WebAuthn = 2,
}

export type TokenLimit = {
    token: Hex;
    limit: bigint;
};

// SDK-structured authorization shape (matches ox/tempo KeyAuthorization)
export type SDKAuthorization = {
    address: Hex;
    chainId?: bigint;
    type: 'secp256k1' | 'p256' | 'webAuthn';
    expiry?: number;
    limits?: TokenLimit[];
};

// ------------------------------------------------------------------
// Tempo Transaction Types
// ------------------------------------------------------------------

export type TempoCall = {
    to: Hex;
    value: bigint;
    input: Hex;
};

export type TempoTransaction = {
    chainId: bigint;
    nonce: bigint;
    nonceKey: bigint;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
    gasLimit: bigint;
    calls: TempoCall[];
    keyAuthorization?: any;
};

// Subscription types

export type SubscriptionPlan = {
    id: string;
    name: string;
    price: number;
    currencyAddress: Hex;
    durationSeconds: number;
};

export type UserSubscription = {
    userAddress: Hex;
    subscriptionKeyId: Hex;
    keyType: 'p256';
    planId: string;
    status: 'active' | 'cancelled' | 'pending';
    nextPaymentDue: number;
    encryptedPrivateKey: string;
    signedAuthorization?: {
        authorization: SDKAuthorization;
        signature: Hex;
    };
};

export type SubscriptionRequest = {
    userAddress: Hex;
    subscriptionPrivateKey: Hex;
    signedAuthorization: {
        authorization: SDKAuthorization;
        signature: Hex;
    };
    planId: string;
};
