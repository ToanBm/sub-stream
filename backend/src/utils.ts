import { Hex } from 'viem';
import { KeyAuthorization, SignatureEnvelope } from 'ox/tempo';
import { SDKAuthorization } from './types';

/**
 * Formats the SDK-structured authorization from the frontend
 * into the KeyAuthorization object expected by Viem (ox/tempo).
 */
export function formatKeyAuthorization(
    authorization: SDKAuthorization,
    signature: Hex
) {
    const auth = KeyAuthorization.from({
        address: authorization.address,
        chainId: authorization.chainId ? BigInt(authorization.chainId) : undefined,
        type: authorization.type,
        expiry: authorization.expiry ? Number(authorization.expiry) : undefined,
        limits: authorization.limits && authorization.limits.length > 0
            ? authorization.limits.map(l => ({
                token: l.token,
                limit: BigInt(l.limit),
            }))
            : undefined,
    });

    return KeyAuthorization.from(auth, {
        signature: SignatureEnvelope.from(signature as Hex),
    });
}
