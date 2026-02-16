import { useState } from 'react';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Building2,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';
import { mockVendor } from '@/data/mockData';
import { cn } from '@/utils/cn';

export function KYB() {
  const [activeTab, setActiveTab] = useState<'status' | 'submit'>('status');

  const verificationSteps = [
    { id: 1, title: 'Business Information', status: 'completed', icon: Building2 },
    { id: 2, title: 'Legal Documents', status: 'completed', icon: FileText },
    { id: 3, title: 'Owner Verification', status: 'completed', icon: User },
    { id: 4, title: 'Final Review', status: 'completed', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">KYB Verification</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Know Your Business - Verify your business identity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('status')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all",
            activeTab === 'status' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          Verification Status
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium transition-all",
            activeTab === 'submit' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          Submit Documents
        </button>
      </div>

      {activeTab === 'status' && (
        <>
          {/* Verification Status Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 lg:p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Business is Verified</h3>
                  <p className="text-emerald-100">KYB Status: {mockVendor.kybStatus.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Business Name</p>
                  <p className="font-medium text-sm">{mockVendor.businessName}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Email</p>
                  <p className="font-medium text-sm">{mockVendor.email}</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm">{mockVendor.walletAddress.slice(0, 10)}...</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xs text-emerald-100 mb-1">Credit Score</p>
                  <p className="font-bold text-xl">{mockVendor.creditScore}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Verification Progress</h3>
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    step.status === 'completed' ? 'bg-emerald-500/10' : 'bg-[hsl(var(--muted))]'
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <step.icon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      step.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[hsl(var(--muted-foreground))]'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {step.status === 'completed' ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  {index < verificationSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
              ))}
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
      )}

      {activeTab === 'submit' && (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-emerald-500 font-medium">Status: Already Verified</span>
          </div>

          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Required Documents</h3>
          
          <div className="space-y-3">
            {[
              { name: 'Business Registration Number', status: 'uploaded' },
              { name: 'Certificate of Incorporation', status: 'uploaded' },
              { name: 'Company Tax ID', status: 'uploaded' },
              { name: 'Director/Owner ID', status: 'uploaded' },
              { name: 'Proof of Business Address', status: 'uploaded' },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  <span className="font-medium text-[hsl(var(--foreground))]">{doc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {doc.status === 'uploaded' ? (
                    <span className="text-sm text-emerald-500 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">Verification Complete</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  All documents have been verified and your business is now registered on the Creditcoin network.
                </p>
                <button className="mt-3 text-sm font-medium text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5">
                  View on Blockchain <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
