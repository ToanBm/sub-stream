import { P256, Address, type Hex } from 'ox';
import { KeyAuthorization } from 'ox/tempo';

export { KeyAuthorization };

// Browser-friendly P256 Key Generation
export function generateEphemeralKeyPair() {
    const keyPair = P256.createKeyPair();
    const address = Address.fromPublicKey(keyPair.publicKey);

    return {
        privateKey: keyPair.privateKey as Hex.Hex,
        publicKey: keyPair.publicKey,
        address: address,
    };
}

export function computeAuthorizationDigest(authorization: KeyAuthorization.KeyAuthorization): Hex.Hex {
    return KeyAuthorization.getSignPayload(authorization);
}
