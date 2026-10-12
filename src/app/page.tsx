import { ShieldCheck, Workflow, History } from 'lucide-react';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Access by responsibility',
    description: 'Private records and actions are available only through explicitly granted permissions.',
  },
  {
    icon: Workflow,
    title: 'Clear operational workflows',
    description: 'Admissions, academic work, and approvals follow validated steps instead of informal shortcuts.',
  },
  {
    icon: History,
    title: 'Accountable records',
    description: 'Important changes are designed to preserve history and record who did what and when.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-16 sm:px-8">
      <header className="mb-16">
        <div className="mb-8 flex items-center gap-3">
          <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-bold text-white">KC</div>
          <div>
            <p className="text-sm font-semibold tracking-tight">K C Model School &amp; College</p>
            <p className="text-xs text-[var(--muted)]">Digital Campus</p>
          </div>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Institutional operations</p>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">One dependable workspace for the school community.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">KCMSC Digital Campus is the private operating platform for academic administration, student records, institutional workflows, and accountable decisions.</p>
        <p className="mt-6 inline-flex items-center rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted)]">Sign-in is not enabled in this foundation build.</p>
      </header>
      <section aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="mb-5 text-sm font-semibold">Built around three principles</h2>
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-[var(--surface)]">
          {principles.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 px-4 py-5 sm:px-5">
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.8} />
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="mt-10 text-xs text-[var(--muted)]">Private institutional application · Asia/Dhaka</footer>
    </main>
  );
}
