import Link from 'next/link';

const stats = [
  { label: 'Jobs Digitized', value: '1,240' },
  { label: 'Avg. Loan Approval', value: '18 hrs' },
  { label: 'Compliance Coverage', value: '98.4%' }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-24">
        <section className="space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">TradeFlow OS</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Embedded finance + OSHA-grade compliance for field operations teams.
          </h1>
          <p className="text-lg text-slate-200">
            Automate your audit trail, unlock working capital, and stay ahead of regulations in one
            AI-native console built for construction, logistics, and industrial services.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-emerald-400 px-6 py-3 font-medium text-slate-900"
            >
              Launch Control Tower
            </Link>
            <Link href="/docs" className="rounded-full border border-white/30 px-6 py-3">
              View API
            </Link>
          </div>
        </section>
        <section className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
