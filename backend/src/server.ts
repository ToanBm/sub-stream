import express from 'express';
import cors from 'cors';
import { createWalletClient, createPublicClient, http, Hex, encodeFunctionData, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { tempoTestnet } from 'viem/chains';
import { Account, Transaction } from 'viem/tempo';
import { signTransaction } from 'viem/actions';
import * as dotenv from 'dotenv';
import { SubscriptionRequest, SubscriptionPlan } from './types';
import { formatKeyAuthorization } from './utils';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

// ------------------------------------------------------------------
// Configuration & Setup
// ------------------------------------------------------------------
dotenv.config();

// Fix JSON BigInt serialization
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();
app.use(cors());
app.use(bodyParser.json());
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 3005;
const TEMPO_TESTNET_RPC = 'https://rpc.moderato.tempo.xyz/';
const ALPHAUSD_ADDRESS = '0x20c0000000000000000000000000000000000001';

// The "Netflix" Server Wallet
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY as Hex || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const serverAccount = privateKeyToAccount(SERVER_PRIVATE_KEY);

// Custom Chain Definition
import { defineChain } from 'viem';
const tempoModerato = defineChain({
    ...tempoTestnet,
    id: 42431,
    name: 'Tempo Moderato',
    rpcUrls: {
        default: { http: [TEMPO_TESTNET_RPC] },
    },
});

const walletClient = createWalletClient({
    chain: tempoModerato,
    transport: http(TEMPO_TESTNET_RPC),
});

const publicClient = createPublicClient({
    chain: tempoModerato,
    transport: http(TEMPO_TESTNET_RPC),
});

// ------------------------------------------------------------------
// Fee Payer Service (JSON-RPC relay for gasless frontend transactions)
// ------------------------------------------------------------------
app.post('/fee-payer', async (req, res) => {
    try {
        const { method, params, id, jsonrpc } = req.body;

        if (method === 'eth_signRawTransaction' || method === 'eth_sendRawTransaction' || method === 'eth_sendRawTransactionSync') {
            const serialized = params[0] as `0x76${string}`;
            const transaction = Transaction.deserialize(serialized);

            const signedTx = await signTransaction(walletClient, {
                ...transaction,
                account: serverAccount,
                feePayer: serverAccount,
            } as any);

            if (method === 'eth_signRawTransaction') {
                return res.json({ jsonrpc, id, result: signedTx });
            }

            // For send methods, broadcast the co-signed transaction
            const result = await walletClient.request({
                method: method as any,
                params: [signedTx],
            });
            return res.json({ jsonrpc, id, result });
        }

        return res.status(400).json({ jsonrpc, id, error: { code: -32601, message: `Method not supported: ${method}` } });
    } catch (err: any) {
        console.error('[FeePayer] Error:', err.message);
        return res.status(500).json({ jsonrpc: '2.0', id: req.body?.id, error: { code: -32603, message: err.message } });
    }
});

// ------------------------------------------------------------------
// Plans Configuration
// ------------------------------------------------------------------
const PLANS: SubscriptionPlan[] = [
    {
        id: 'hourly_rate',
        name: 'Hourly Rate',
        price: 12, // $12 AlphaUSD every 5 minutes ($60/hr)
        currencyAddress: ALPHAUSD_ADDRESS as Hex,
        durationSeconds: 300, // 5 minutes
    },
    {
        id: 'daily_rate',
        name: 'Daily Rate',
        price: 50, // $50 AlphaUSD every hour ($1200/day)
        currencyAddress: ALPHAUSD_ADDRESS as Hex,
        durationSeconds: 3600, // 1 hour
    },
    {
        id: 'monthly_rate',
        name: 'Monthly Rate',
        price: 1000, // $1000 AlphaUSD every day ($30,000/mo)
        currencyAddress: ALPHAUSD_ADDRESS as Hex,
        durationSeconds: 86400, // 1 day
    },
];

// ------------------------------------------------------------------
// Core Logic
// ------------------------------------------------------------------

async function handleSubscribe(req: SubscriptionRequest) {
    console.log(`[Server] Received subscription request from ${req.userAddress}`);

    const plan = PLANS.find(p => p.id === req.planId);
    if (!plan) throw new Error('Invalid Plan ID');

    const signed = req.signedAuthorization as any;
    const rawAuth = signed.authorization;
    if (!rawAuth) throw new Error('Invalid auth payload');

    // Store in Database
    // Set nextPaymentDue to now + interval so the cron doesn't pick it up
    // while the inline first payment is still processing on-chain.
    const newRate = await prisma.subscription.create({
        data: {
            userAddress: req.userAddress.toLowerCase(),
            planId: req.planId,
            status: 'active',
            subscriptionKeyId: (rawAuth.address as Hex).toLowerCase(),
            encryptedPrivateKey: req.subscriptionPrivateKey,
            nextPaymentDue: BigInt(Date.now() + plan.durationSeconds * 1000),
            authPayload: JSON.stringify(rawAuth),
            authSignature: signed.signature,
        }
    });

    console.log(`[Server] Subscription persisted (ID: ${newRate.id}). KeyID: ${newRate.subscriptionKeyId}`);

    // Trigger first payment immediately
    // NOTE: For the FIRST payment (registration), we MIGHT need keyAuthorization if it wasn't added yet?
    // Actually, createCredential logic on client creates the key.
    // The first transaction using it will Add it.
    // So for the FIRST call, we keep keyAuthorization logic?
    // Or we assume client added it?
    // In this flow: Client signs -> Server broadcasts.
    // Let's modify processPayment to accept an optional 'isFirstTime' flag if needed,
    // BUT for now, let's try removing keyAuthorization for ALL calls and see if it works
    // (assuming the key is added implicitly or explicitly elsewhere).
    // actually, the FIRST tx MUST have keyAuth to add the key.
    // Subsequent txs MUST NOT have keyAuth.

    await processPayment(newRate.id, true); // True = First time (Include Auth)
}

async function processPayment(subId: string, isFirstTime: boolean = false) {
    const sub = await prisma.subscription.findUnique({ where: { id: subId } });
    if (!sub || (sub.status !== 'active' && sub.status !== 'past_due')) return;

    console.log(`[Server] Processing payment for ${sub.userAddress}... (First Time: ${isFirstTime})`);
    const plan = PLANS.find(p => p.id === sub.planId);
    if (!plan) return;

    try {
        const rawAuth = JSON.parse(sub.authPayload);
        const accessKeyAccount = Account.fromP256(sub.encryptedPrivateKey as Hex, {
            access: sub.userAddress as Hex,
        });

        const transferCallData = encodeFunctionData({
            abi: [{
                name: 'transfer',
                type: 'function',
                inputs: [{ type: 'address', name: 'to' }, { type: 'uint256', name: 'amount' }],
                outputs: [{ type: 'bool' }]
            }],
            functionName: 'transfer',
            args: [serverAccount.address, BigInt(Math.floor(plan.price * 1_000_000))]
        });

        let keyAuthorization;
        if (isFirstTime) {
            keyAuthorization = formatKeyAuthorization(
                rawAuth,
                sub.authSignature as Hex,
            );
        }

        const hash = await walletClient.sendTransaction({
            account: accessKeyAccount,
            chain: tempoModerato,
            nonceKey: 0n,
            feePayer: serverAccount,
            keyAuthorization: keyAuthorization, // Only included if isFirstTime is true
            calls: [{
                to: plan.currencyAddress,
                value: 0n,
                data: transferCallData
            }]
        });

        console.log(`[Server] Tx Sent: ${hash}. Waiting for confirmation...`);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            console.log(`[Server] Payment Success! Block: ${receipt.blockNumber}`);
            await prisma.paymentHistory.create({
                data: {
                    subscriptionKey: sub.subscriptionKeyId,
                    amount: plan.price.toString(),
                    txHash: hash,
                    status: 'success'
                }
            });

            // For the first (inline) payment, nextPaymentDue was already set
            // to now + interval at creation time, so don't advance it again.
            // For recurring cron payments, advance by one interval.
            const updateData: { status: string; nextPaymentDue?: bigint } = { status: 'active' };
            if (!isFirstTime) {
                updateData.nextPaymentDue = BigInt(Number(sub.nextPaymentDue) + plan.durationSeconds * 1000);
            }
            await prisma.subscription.update({
                where: { id: subId },
                data: updateData,
            });
        } else {
            throw new Error('Transaction Reverted on-chain');
        }

    } catch (err: any) {
        console.error(`[Server] Payment Failed:`, err.message || err);

        // 1. Log failure history
        await prisma.paymentHistory.create({
            data: {
                subscriptionKey: sub.subscriptionKeyId,
                amount: plan.price.toString(),
                txHash: '',
                status: 'failed'
            }
        });

        // 2. Mark subscription as 'past_due' so we stop retrying automatically
        // User must manually fix/retry via UI
        await prisma.subscription.update({
            where: { id: subId },
            data: { status: 'past_due' }
        });
        console.log(`[Server] Subscription ${subId} marked as past_due.`);
    }
}

// ------------------------------------------------------------------
// Cron Job
// ------------------------------------------------------------------
async function runCron() {
    const now = BigInt(Date.now());
    // DEBUG: Checking logic
    const allActive = await prisma.subscription.findMany({ where: { status: 'active' } });
    console.log(`[Cron] Checking ${allActive.length} active subs. Now: ${now}`);
    allActive.forEach(s => {
        console.log(` - Sub ${s.id.slice(0, 8)}... NextDue: ${s.nextPaymentDue} (${Number(s.nextPaymentDue) <= Number(now) ? 'DUE' : 'WAIT'})`);
    });

    // Find due subscriptions
    const dueSubs = await prisma.subscription.findMany({
        where: {
            status: 'active',
            nextPaymentDue: { lte: now }
        }
    });

    if (dueSubs.length > 0) {
        console.log(`[Cron] Found ${dueSubs.length} due subscriptions. Processing...`);
        for (const sub of dueSubs) {
            await processPayment(sub.id, false); // False = Recurring (No Auth needed)
        }
    }
}

// ------------------------------------------------------------------
// Credential Storage (for WebAuthn login)
// ------------------------------------------------------------------
app.post('/credentials', async (req, res) => {
    try {
        const { id, publicKey, address } = req.body;
        if (!id || !publicKey || !address) {
            return res.status(400).json({ error: 'Missing id, publicKey, or address' });
        }
        await prisma.credential.upsert({
            where: { id },
            update: { publicKey, address },
            create: { id, publicKey, address },
        });
        console.log(`[Credentials] Stored credential for ${address}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error('[Credentials] Error:', e.message);
        return res.status(500).json({ error: e.message });
    }
});

app.get('/credentials', async (req, res) => {
    try {
        const id = req.query.id as string | undefined;

        // If no id provided, return all credential IDs (for login flow)
        if (!id) {
            const all = await prisma.credential.findMany({ select: { id: true } });
            return res.json({ credentialIds: all.map(c => c.id) });
        }

        const credential = await prisma.credential.findUnique({
            where: { id },
        });
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }
        return res.json({ publicKey: credential.publicKey, address: credential.address });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

// ------------------------------------------------------------------
// Server API
// ------------------------------------------------------------------
app.post('/subscribe', async (req, res) => {
    try {
        await handleSubscribe(req.body);
        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
});

// GET My Subscription with Debug Logs
app.get('/my-subscription/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        console.log(`[API] Fetching subscription for user: ${address}`);

        const sub = await prisma.subscription.findFirst({
            where: {
                userAddress: address,
                status: { in: ['active', 'past_due'] }
            },
            orderBy: { nextPaymentDue: 'desc' }
        });

        if (sub) {
            console.log(`[API] Found active subscription for ${address}: ${sub.id}`);
        } else {
            console.log(`[API] No active subscription found for ${address}`);
        }

        let history: any[] = [];
        if (sub) {
            history = await prisma.paymentHistory.findMany({
                where: { subscriptionKey: sub.subscriptionKeyId },
                orderBy: { timestamp: 'desc' },
                take: 20
            });
        }

        return res.json({ subscription: sub, history });
    } catch (e: any) {
        console.error(`[API Error]`, e);
        return res.status(500).json({ error: e.message });
    }
});

app.get('/balance/:address', async (req, res) => {
    try {
        const address = req.params.address as Hex;
        const usdcBal = await publicClient.readContract({
            address: ALPHAUSD_ADDRESS,
            abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
            functionName: 'balanceOf',
            args: [address]
        }) as bigint;

        return res.json({
            usdc: usdcBal.toString()
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

app.post('/retry-payment', async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        console.log(`[Server] Manual retry for ${subscriptionId}...`);
        await processPayment(subscriptionId, false);

        const updated = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
        if (updated?.status === 'active') {
            return res.json({ success: true });
        } else {
            // Fetch last history to get error
            const lastHistory = await prisma.paymentHistory.findFirst({
                where: { subscriptionKey: updated?.subscriptionKeyId },
                orderBy: { timestamp: 'desc' }
            });
            return res.status(400).json({ error: `Payment still failing. Check logs.` });
        }
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

app.post('/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'cancelled' }
        });
        console.log(`[Server] Subscription ${subscriptionId} cancelled.`);
        return res.json({ success: true });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

setInterval(runCron, 30000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n================================`);
    console.log(`Netflix Web3 Server Running on Port ${PORT}`);
    console.log(`Using Viem Native Tempo Support (P256) + SQLite Persistence`);
    console.log(`================================\n`);
});
