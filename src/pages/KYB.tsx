import { useState, useEffect } from 'react';
import {
  Shield,
  Upload,
  CheckCircle,
  Building2,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Zap,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { cn } from '@/utils/cn';

export function KYB() {
  const { account } = useWallet();
  const [activeTab, setActiveTab] = useState<'status' | 'submit'>('status');
  const [kybStatus, setKybStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      const saved = localStorage.getItem(`kyb_status_${account}`);
      if (saved) {
        setKybStatus(saved as any);
      } else {
        setKybStatus('none');
      }
    }
  }, [account]);

  const handleVerify = () => {
    setIsSubmitting(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsSubmitting(false);
      setKybStatus('verified');
      if (account) localStorage.setItem(`kyb_status_${account}`, 'verified');
      setActiveTab('status');
    }, 2000);
  };

  const steps = [
    { id: 1, title: 'Business Information', icon: Building2 },
    { id: 2, title: 'Legal Documents', icon: FileText },
    { id: 3, title: 'Owner Verification', icon: User },
    { id: 4, title: 'Final Review', icon: Shield },
  ];

  if (!account) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Connect Wallet</h2>
        <p className="text-[hsl(var(--muted-foreground))]">Please connect your wallet to access KYB Verification.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">KYB Verification</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Know Your Business - Verify your business identity</p>
      </div>

      {kybStatus === 'verified' ? (
        <>
          {/* Verification Status Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 lg:p-8 text-white animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Business is Verified</h3>
                  <p className="text-emerald-100">KYB Status: VERIFIED</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Business Name</p>
                  <p className="font-medium text-sm">Vendor {account.slice(0, 6)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm">{account.slice(0, 10)}...</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Credit Score</p>
                  <p className="font-bold text-xl">785</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Verification Date</p>
                  <p className="font-bold text-sm">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Full Access</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Mint invoices without limits and access all platform features
              </p>
            </div>
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Lower Interest Rates</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Verified businesses get more competitive funding rates
              </p>
            </div>
            <div className="bg-[hsl(var(--card))] rounded-xl p-5 border border-[hsl(var(--border))]">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Investor Trust</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Verified badge increases investor confidence in your business
              </p>
            </div>
          </div>
        </>

      ) : (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 animate-slide-in">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Start Verification</h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
              Complete the verification process to unlock full platform features and get funded.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Simplified Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Business Name</label>
                <input type="text" placeholder="My Business Co." className="w-full mt-1 p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">Registration Number</label>
                <input type="text" placeholder="REG-123456" className="w-full mt-1 p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {isSubmitting ? 'Verifying...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
