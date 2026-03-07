import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  Coins,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Workflow,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const tickerItems = [
  { label: 'Mint Confirmation', value: '< 30 sec', icon: Zap },
  { label: 'Average Yield', value: '8.7% APY', icon: TrendingUp },
  { label: 'Pool Liquidity', value: '$5.2M', icon: Coins },
  { label: 'Verified Vendors', value: '240+', icon: ShieldCheck },
  { label: 'Wallet Compatible', value: 'EVM Native', icon: Wallet },
  { label: 'Flow Automation', value: 'On-Chain', icon: Workflow },
];

const flowSteps = [
  {
    title: 'Mint Invoice to RWA',
    description: 'Vendor menerbitkan invoice menjadi token ERC-721 agar bisa dilacak on-chain secara transparan.',
    icon: CircuitBoard,
  },
  {
    title: 'Funding Flow Starts',
    description: 'Investor atau liquidity pool mendanai invoice dengan stablecoin dalam alur terukur dan cepat.',
    icon: Coins,
  },
  {
    title: 'Repayment + Yield',
    description: 'Saat invoice lunas, hasil terdistribusi otomatis dan riwayat kredit vendor ikut terbarui.',
    icon: TrendingUp,
  },
];

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const runningTicker = useMemo(() => [...tickerItems, ...tickerItems], []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * 12;
    const rotateY = (px - 0.5) * 14;
    setTilt({ x: rotateX, y: rotateY });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090014] text-white selection:bg-purple-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-28 left-[12%] h-[30rem] w-[30rem] rounded-full bg-purple-500/25 blur-[130px] animate-drift" />
        <div className="absolute -bottom-40 right-[8%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/25 blur-[130px] animate-drift" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[140px] animate-drift" style={{ animationDelay: '4s' }} />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold tracking-wide text-white/90">CrediProcure</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Web3 RWA Engine</p>
          </div>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur">
          Creditcoin Network
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12">
        <section className="grid items-center gap-10 pt-4 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-purple-200 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              Invoice Finance Reimagined
            </div>

            <div className="space-y-4">
              <h1 className="animate-fade-in-up text-4xl font-bold leading-tight md:text-6xl" style={{ animationDelay: '80ms' }}>
                Satu Platform untuk
                <span className="animate-gradient-shift block bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                  Mint, Fund, and Scale
                </span>
              </h1>
              <p className="max-w-xl animate-fade-in-up text-base leading-relaxed text-purple-100/70 md:text-lg" style={{ animationDelay: '140ms' }}>
                CrediProcure mengubah invoice bisnis jadi aset on-chain yang bisa didanai cepat, dipantau real-time, dan menghasilkan yield stabil untuk investor.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
              <button
                onClick={onEnterApp}
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
              >
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10">
                Explore Smart Contracts
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
              {[
                { label: 'TVL', value: '$5.2M' },
                { label: 'Funded Invoices', value: '1,280+' },
                { label: 'Settlement Ratio', value: '98.4%' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">{item.label}</p>
                  <p className="mt-1 text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl [perspective:1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[13rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            {[0, 1, 2].map((index) => (
              <div key={index} className="pointer-events-none absolute left-1/2 top-1/2">
                <div className="animate-orbit" style={{ animationDelay: `${index * 1.8}s` }}>
                  <div className="h-3 w-3 rounded-full bg-purple-300 shadow-[0_0_24px_rgba(216,180,254,0.7)]" />
                </div>
              </div>
            ))}

            <div
              className="relative animate-float-slow rounded-[1.8rem] border border-white/15 bg-[#0d0714]/85 p-5 shadow-[0_24px_70px_rgba(68,11,145,0.45)]"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${pressed ? 1.01 : 1})`,
                transformStyle: 'preserve-3d',
                transition: 'transform 150ms ease-out',
              }}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
            >
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-purple-500/35 via-fuchsia-500/30 to-indigo-500/35 blur-xl" />

              <div className="relative rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500" />
                    <div>
                      <p className="text-xs text-white/65">CrediProcure Engine</p>
                      <p className="text-sm font-semibold">Live Funding Pipeline</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-purple-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-pulse-glow" />
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/55">Invoice #2145</p>
                    <p className="mt-1 text-lg font-bold">$120,000</p>
                    <p className="text-xs text-purple-200/80">Yield 9.2%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/55">Liquidity Depth</p>
                    <p className="mt-1 text-lg font-bold">$5.2M</p>
                    <p className="text-xs text-indigo-200/90">Healthy Coverage</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/55">Funding Flow</p>
                    <p className="text-xs text-white/70">34 tx/min</p>
                  </div>
                  <div className="h-24 rounded-lg bg-[linear-gradient(180deg,rgba(167,139,250,0.16),rgba(167,139,250,0.02))] p-2">
                    <div className="flex h-full items-end gap-1.5">
                      {[30, 48, 38, 56, 44, 60, 52, 69, 58, 74, 64, 82].map((height, index) => (
                        <div
                          key={`${height}-${index}`}
                          className="w-full rounded-sm bg-gradient-to-t from-purple-500/85 to-indigo-400/80"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] py-3 backdrop-blur">
          <div className="flex w-max items-center gap-3 px-3 animate-marquee">
            {runningTicker.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <item.icon className="h-4 w-4 text-purple-300" />
                <span className="text-xs text-white/65">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-[#120a20]/65 p-6 backdrop-blur lg:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Funding Flow in Motion</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/65 md:text-base">
              Rangkaian lengkap dari invoice creation sampai repayment dibuat untuk eksekusi cepat, auditable, dan ramah investor.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-200">
                    0{index + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full animate-flow bg-[linear-gradient(90deg,transparent,rgba(192,132,252,1),transparent)] bg-[length:180px_100%]" />
                </div>

                {index < flowSteps.length - 1 && (
                  <div className="absolute -right-5 top-1/2 hidden w-10 -translate-y-1/2 items-center lg:flex">
                    <div className="h-[2px] w-full bg-gradient-to-r from-purple-400/80 to-transparent" />
                    <div className="absolute right-5 h-2.5 w-2.5 rounded-full bg-purple-300 animate-pulse-glow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-indigo-500/10 p-6 text-center">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-purple-300" />
            <h3 className="text-2xl font-bold">Ready to Run CrediProcure?</h3>
            <p className="text-sm text-white/70 md:text-base">
              Masuk ke dashboard untuk mulai mint invoice, kelola liquidity, dan monitor credit performance secara real-time.
            </p>
            <button
              onClick={onEnterApp}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
            >
              Enter Application
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
