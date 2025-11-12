import Link from 'next/link';
import { cn } from '@/lib/cn';

const nav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/jobs', label: 'Jobs' },
  { href: '/dashboard/compliance', label: 'Compliance' },
  { href: '/dashboard/finance', label: 'Finance' }
];

export function DashboardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">TradeFlow</p>
            <p className="text-lg font-semibold">Field Operations Control Tower</p>
          </div>
          <div className="text-sm text-slate-500">SOC2 • HIPAA • OSHA</div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 pb-4 text-sm text-slate-600">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="font-medium text-slate-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={cn('mx-auto max-w-6xl px-6 py-10', className)}>{children}</main>
    </div>
  );
}
