import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap, Calendar, Check, ArrowLeft, ExternalLink, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import type { Hex } from 'viem';

type SubscribePageProps = {
  address: Hex | null;
  isRegistered: boolean;
  subscribe: (planId: string, amount: number) => Promise<void>;
  subscriptionStatus: string;
  onRegister: () => void;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  chargeAmount: number;
  chargeInterval: string;
  period: string;
  icon: typeof Clock;
  features: string[];
  popular?: boolean;
  accent?: boolean;
};

const plans: Plan[] = [
  {
    id: 'hourly_rate',
    name: 'Hourly',
    price: 60,
    chargeAmount: 12,
    chargeInterval: 'every 5 min',
    period: 'hr',
    icon: Clock,
    features: ['$60 AlphaUSD per hour', '$12 charged every 5 minutes', 'Auto-pay via Tempo', 'Cancel anytime'],
  },
  {
    id: 'daily_rate',
    name: 'Daily',
    price: 1200,
    chargeAmount: 50,
    chargeInterval: 'every hour',
    period: 'day',
    icon: Zap,
    features: ['$1,200 AlphaUSD per day', '$50 charged every hour', 'Auto-pay via Tempo', 'Cancel anytime'],
    popular: true,
    accent: true,
  },
  {
    id: 'monthly_rate',
    name: 'Monthly',
    price: 30000,
    chargeAmount: 1000,
    chargeInterval: 'every day',
    period: 'mo',
    icon: Calendar,
    features: ['$30,000 AlphaUSD per month', '$1,000 charged every day', 'Auto-pay via Tempo', 'Cancel anytime'],
  },
];

export function SubscribePage({
  address,
  isRegistered,
  subscribe,
  subscriptionStatus,
  onRegister,
}: SubscribePageProps) {
  const toast = useToast();
  const [mySub, setMySub] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState<{ usdc: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setMySub(null);
      setHistory([]);
      setBalance(null);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/my-subscription/${address}`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/balance/${address}`).then((r) => r.json()),
    ])
      .then(([subData, balData]) => {
        if (subData.subscription) {
          setMySub(subData.subscription);
          setHistory(subData.history || []);
        }
        if (balData) setBalance(balData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address, subscriptionStatus]);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const confirmCancel = async () => {
    setShowCancelModal(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: mySub.id }),
      });
      if (res.ok) {
        setMySub(null);
        toast.success('Subscription cancelled successfully.');
      } else {
        toast.error('Failed to cancel subscription.');
      }
    } catch (e) {
      console.error('Cancel error', e);
      toast.error('An error occurred while cancelling.');
    }
  };

  const cancelSubscription = async () => {
    setShowCancelModal(true);
  };

  const retryPayment = async () => {
    setRetryLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/retry-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: mySub.id }),
      });
      if (res.ok) {
        toast.success('Payment retry successful!');
        window.location.reload();
      } else {
        toast.error('Payment retry failed. Check your balance.');
      }
    } catch (e) {
      console.error('Retry error', e);
      toast.error('An error occurred during retry.');
    } finally {
      setRetryLoading(false);
    }
  };

  // Dashboard view for active subscribers
  if (mySub) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-alt)]">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-red)] mb-8 transition-colors group uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Browse
          </Link>

          <div className="rounded-lg bg-white card-shadow overflow-hidden">
            {/* Top accent stripe */}
            <div className="section-divider" />

            {/* Header */}
            <div className="p-8 border-b border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h2
                    className="text-2xl font-bold uppercase tracking-wide text-[var(--color-text)]"
                  >
                    My Subscription
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[var(--color-navy)] font-bold uppercase text-sm tracking-wide">{mySub.planId}</span>
                    {mySub.status === 'active' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                    {mySub.status === 'past_due' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-red)] bg-red-50 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Past Due
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">Next Payment</p>
                  <p className="text-lg font-mono font-bold mt-0.5 text-[var(--color-text)]">
                    {new Date(Number(mySub.nextPaymentDue)).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Balance: {balance ? `${(BigInt(balance.usdc) / 1000000n).toString()} AlphaUSD` : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Past due banner */}
            {mySub.status === 'past_due' && (
              <div className="mx-8 mt-6 p-4 rounded-lg bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[var(--color-red)] text-sm">Payment failed</p>
                  <p className="text-xs text-red-600/70 mt-0.5">
                    Ensure your wallet has sufficient USDC funds.
                  </p>
                </div>
                <button
                  onClick={retryPayment}
                  disabled={retryLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-red)] hover:bg-[#C71530] text-white text-sm font-bold uppercase tracking-wide rounded transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retryLoading ? 'animate-spin' : ''}`} />
                  {retryLoading ? 'Retrying...' : 'Retry Payment'}
                </button>
              </div>
            )}

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Payment History */}
              <div>
                <h4
                  className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4"
                >
                  Payment History
                </h4>
                {history.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">No payments yet.</p>
                ) : (
                  <div className="space-y-0">
                    {history.map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {new Date(h.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-3">
                          {h.status === 'success' ? (
                            <span className="text-sm font-bold text-emerald-600">${h.amount}</span>
                          ) : (
                            <span className="text-sm font-bold text-[var(--color-red)]">Failed</span>
                          )}
                          {h.txHash && (
                            <a
                              href={`https://explore.tempo.xyz/tx/${h.txHash}`}
                              target="_blank"
                              className="text-[var(--color-navy)] hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manage */}
              <div className="rounded-lg p-6 bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                <h4
                  className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4"
                >
                  Manage
                </h4>
                <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  Your subscription is managed via Tempo Access Keys. Cancelling immediately revokes the server's permission to charge your wallet.
                </p>
                {mySub.status !== 'cancelled' && (
                  <button
                    onClick={cancelSubscription}
                    className="w-full py-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-red)] border border-[var(--color-border)] hover:border-[var(--color-red)] hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pricing view for non-subscribers
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-alt)]">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-red)] mb-8 transition-colors group uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Browse
        </Link>

        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="accent-bar mx-auto mb-4" />
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight uppercase text-[var(--color-text)]"
          >
            Choose your <span className="text-[var(--color-red)]">plan</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-4 text-lg max-w-md mx-auto">
            Subscribe with your passkey. No credit cards. Powered by Tempo blockchain.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-navy)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Plans Grid */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg overflow-hidden bg-white card-shadow animate-fade-up ${plan.accent
                    ? 'ring-2 ring-[var(--color-navy)] scale-[1.02] md:scale-105'
                    : ''
                    }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Top accent bar */}
                  <div className={`h-1.5 ${plan.accent ? 'bg-[var(--color-red)]' : 'bg-[var(--color-navy)]'}`} />

                  {plan.popular && (
                    <div className="bg-[var(--color-navy)] text-center py-1.5">
                      <span
                        className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-gold)]"
                      >
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${plan.accent ? 'bg-[var(--color-navy)]/10' : 'bg-[var(--color-bg-alt)]'}`}>
                        <Icon className={`w-5 h-5 ${plan.accent ? 'text-[var(--color-navy)]' : 'text-[var(--color-text-muted)]'}`} />
                      </div>
                      <h3
                        className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)]"
                      >
                        {plan.name}
                      </h3>
                    </div>

                    <div className="mb-1">
                      <span className="text-4xl font-black text-[var(--color-text)]">${plan.price.toLocaleString()}</span>
                      <span className="text-[var(--color-text-muted)] text-sm ml-1 font-medium">/ {plan.period}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">
                      ${plan.chargeAmount.toLocaleString()} charged {plan.chargeInterval}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-[var(--color-border)] mb-6" />

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm">
                          <Check className={`w-4 h-4 shrink-0 ${plan.accent ? 'text-[var(--color-red)]' : 'text-[var(--color-navy)]'}`} />
                          <span className="text-[var(--color-text)]">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() =>
                        isRegistered
                          ? subscribe(plan.id, plan.chargeAmount)
                          : onRegister()
                      }
                      disabled={subscriptionStatus === 'authorizing'}
                      className={`w-full py-3.5 text-sm font-bold uppercase tracking-wide rounded transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-wait ${plan.accent
                        ? 'bg-[var(--color-red)] hover:bg-[#C71530] text-white shadow-lg'
                        : 'bg-[var(--color-navy)] hover:bg-[var(--color-accent-hover)] text-white'
                        }`}
                    >
                      {!isRegistered
                        ? 'Register Passkey First'
                        : subscriptionStatus === 'authorizing'
                          ? 'Confirm Biometric...'
                          : subscriptionStatus === 'success'
                            ? 'Subscribed!'
                            : `Select ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info section */}
        <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="rounded-lg bg-white p-8 max-w-2xl mx-auto card-shadow border-t-[3px] border-[var(--color-navy)]">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[var(--color-navy)]" />
              <h4
                className="font-bold uppercase tracking-wide text-[var(--color-text)]"
              >
                How it works
              </h4>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              SubStream uses Tempo Access Keys for subscriptions. When you subscribe, your passkey authorizes a
              limited spending key that can only charge your specified plan amount. You maintain full control
              and can revoke access at any time. No passwords, no credit cards — just your biometric.
            </p>
          </div>
        </div>
      </div>
      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--color-navy-dark)]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-0.5 bg-[var(--color-red)]" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-[var(--color-red)]" />
              </div>

              <h2 className="text-xl font-bold uppercase tracking-wide text-[var(--color-text)] mb-3">
                Cancel Plan?
              </h2>

              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-8">
                Cancel your subscription? This stops all future payments immediately.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmCancel}
                  className="w-full py-3.5 bg-[var(--color-red)] hover:bg-[#C71530] text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-md active:scale-95"
                >
                  Yes, Cancel Subscription
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-3.5 bg-[var(--color-bg-alt)] hover:bg-[var(--color-border)] text-[var(--color-text)] text-xs font-bold uppercase tracking-widest rounded transition-all active:scale-95"
                >
                  No, Keep My Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
