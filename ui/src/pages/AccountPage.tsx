import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    Download,
    Copy,
    Check,
    Play,
    Clock,
    Zap,
    RefreshCw,
    Calendar,
    ArrowLeft,
    Shield
} from 'lucide-react';
import type { Hex } from 'viem';
import { useToast } from '../hooks/useToast';

type AccountPageProps = {
    address: Hex | null;
    isRegistered: boolean;
};

type Plan = {
    id: string;
    name: string;
    price: number;
    period: string;
    icon: any;
    accent?: boolean;
};

const plans: Plan[] = [
    { id: 'hourly_rate', name: 'Hourly', price: 60, period: 'hr', icon: Clock },
    { id: 'daily_rate', name: 'Daily', price: 1200, period: 'day', icon: Zap, accent: true },
    { id: 'monthly_rate', name: 'Monthly', price: 30000, period: 'mo', icon: Calendar },
];

export function AccountPage({ address, isRegistered }: AccountPageProps) {
    const toast = useToast();
    const [balance, setBalance] = useState<{ usdc: string } | null>(null);
    const [mySub, setMySub] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const refreshBalance = async () => {
        if (!address || refreshing) return;
        setRefreshing(true);
        try {
            const [balData, subData] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/balance/${address}`).then(r => r.json()),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/my-subscription/${address}`).then(r => r.json())
            ]);
            if (balData) setBalance(balData);
            if (subData) setMySub(subData.subscription);
            toast.success('Balance refreshed!');
        } catch (err) {
            console.error('Refresh error:', err);
            toast.error('Failed to refresh balance');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!address) return;

        setLoading(true);
        const timer = setTimeout(() => {
            Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/balance/${address}`).then(r => r.json()),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/my-subscription/${address}`).then(r => r.json())
            ])
                .then(([balData, subData]) => {
                    if (balData) setBalance(balData);
                    if (subData) {
                        setMySub(subData.subscription);
                    }
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    toast.error('Failed to load account data');
                })
                .finally(() => setLoading(false));
        }, 500); // Small delay for smooth feel

        return () => clearTimeout(timer);
    }, [address]);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success('Address copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getActivePlan = () => {
        if (!mySub) return null;
        return plans.find(p => p.id === mySub.planId);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-alt)] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--color-navy)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-alt)] flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <User className="w-12 h-12 text-[var(--color-navy)] mx-auto mb-4 opacity-20" />
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-[var(--color-text)]">Account Protected</h2>
                    <p className="text-[var(--color-text-muted)] mt-2">Please register or sign in to view your account.</p>
                    <Link to="/" className="inline-block mt-6 px-6 py-2 bg-[var(--color-navy)] text-white rounded font-bold uppercase tracking-wide text-sm">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const activePlan = getActivePlan();

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-alt)]">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
                <header className="mb-8 max-w-5xl mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-red)] transition-colors group uppercase tracking-wide"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Browse
                    </Link>
                </header>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
                    {/* LEFT COLUMN: WALLET & HISTORY */}
                    <section className="bg-white rounded shadow-sm border border-[var(--color-border)] overflow-hidden flex flex-col">
                        <div className="p-0.5 bg-[var(--color-navy)]" />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
                                        Wallet & Balance
                                    </h2>
                                    <button
                                        onClick={refreshBalance}
                                        disabled={refreshing}
                                        className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Refresh balance"
                                    >
                                        <RefreshCw className={`w-4 h-4 text-[var(--color-navy)] ${refreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <Zap className="w-5 h-5 text-[var(--color-navy)] opacity-20" />
                            </div>

                            {/* Top Row: Balance & Deposit */}
                            <div className="bg-[var(--color-bg-alt)] rounded p-8 mb-6 border border-[var(--color-border)] flex flex-col justify-center">
                                <div className="flex items-center justify-between text-left gap-2 px-1">
                                    <div className="shrink-0 mr-4">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-none">
                                                {balance ? (BigInt(balance.usdc) / 1000000n).toString() : '0'}
                                            </span>
                                            <span className="text-lg font-bold text-[var(--color-navy)] leading-none tracking-tight">AlphaUSD</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div>
                                            <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Network</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-navy)] opacity-50" />
                                                <p className="text-[10px] font-bold text-[var(--color-navy)] uppercase tracking-wide">Tempo moderato testnet</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="inline-flex items-center justify-center w-full py-3.5 bg-[var(--color-navy)] hover:bg-[var(--color-navy-dark)] text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-md active:scale-95 flex items-center gap-2 mb-6"
                            >
                                <Download className="w-4 h-4" />
                                Deposit
                            </button>

                        </div>

                        <div className="p-4 bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] mt-auto">
                            <div className="flex items-center justify-between px-2 text-[var(--color-text-muted)]">
                                <span className="text-[8px] font-bold uppercase tracking-widest">Secured by Tempo Protocol</span>
                                <Shield className="w-3.5 h-3.5 opacity-20" />
                            </div>
                        </div>
                    </section>

                    {/* RIGHT COLUMN: SUBSCRIPTION */}
                    <section className="bg-white rounded shadow-sm border border-[var(--color-border)] overflow-hidden flex flex-col">
                        <div className="p-0.5 bg-[var(--color-red)]" />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
                                    Subscription Plan
                                </h2>
                                <Play className="w-5 h-5 text-[var(--color-red)] opacity-20" />
                            </div>

                            <div className="bg-[var(--color-bg-alt)] rounded p-8 text-center mb-6 border border-[var(--color-border)] flex flex-col justify-center">
                                {mySub ? (
                                    <div className="flex items-center justify-between text-left gap-2 px-1">
                                        <div className="shrink-0 mr-4">
                                            <h3 className="text-2xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-none">
                                                {activePlan?.name || mySub.planId}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div>
                                                <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Billing Status</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Subscribed</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Next Payment</p>
                                                <p className="text-[10px] font-bold font-mono text-[var(--color-text)] leading-none">{new Date(Number(mySub.nextPaymentDue)).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-[var(--color-text)] uppercase tracking-tight">Not Subscribed</h3>
                                        <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                                            Unlock premium movies and original series.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/subscribe"
                                className="inline-flex items-center justify-center w-full py-3.5 bg-[var(--color-red)] hover:bg-[#C71530] text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-md active:scale-95"
                            >
                                {mySub ? 'Manage Plan' : 'View Plans'}
                            </Link>
                        </div>
                        <div className="p-4 bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] mt-auto">
                            <div className="flex items-center justify-between px-2 text-[var(--color-text-muted)]">
                                <span className="text-[8px] font-bold uppercase tracking-widest">Protected by Tempo Passkey</span>
                                <Shield className="w-3.5 h-3.5 opacity-20" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* DEPOSIT MODAL */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--color-navy-dark)]/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-0.5 bg-[var(--color-gold)]" />
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)] flex items-center gap-2">
                                    <Download className="w-5 h-5 text-[var(--color-gold)]" />
                                    Deposit Funds
                                </h2>
                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="p-2 hover:bg-[var(--color-bg-alt)] rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 rotate-180 text-[var(--color-text-muted)]" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="p-3 bg-white border-2 border-[var(--color-bg-alt)] rounded shadow-inner">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${address}`}
                                        alt="Wallet QR Code"
                                        className="w-[180px] h-[180px]"
                                    />
                                </div>

                                <div className="w-full space-y-4">
                                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-medium text-center">
                                        Scan the QR code or click the address below to copy and deposit AlphaUSD to your wallet.
                                    </p>

                                    <div
                                        onClick={copyAddress}
                                        className="group cursor-pointer flex items-center justify-between p-4 bg-[var(--color-bg-alt)] rounded border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all"
                                    >
                                        <code className="text-[11px] font-mono text-[var(--color-navy)] font-bold truncate pr-4">
                                            {address}
                                        </code>
                                        <div className="shrink-0 p-1.5 bg-white rounded shadow-sm group-hover:bg-[var(--color-gold)] group-hover:text-white transition-colors">
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-50" />}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="w-full mt-4 py-4 bg-[var(--color-navy)] text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-md active:scale-95"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
