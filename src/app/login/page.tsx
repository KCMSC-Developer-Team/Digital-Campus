import { loginAction } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

const messages: Record<string, string> = {
  invalid: 'We could not sign you in with those details. Check them and try again.',
  limited: 'Too many sign-in attempts. Wait 15 minutes before trying again.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  if (await getCurrentUser()) redirect('/dashboard');
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-heading">
        <div className="brand-lockup"><span className="brand-mark">KC</span><span><strong>K C Model School &amp; College</strong><small>Digital Campus</small></span></div>
        <div className="login-intro"><div className="eyebrow">PRIVATE INSTITUTIONAL WORKSPACE</div><h1 id="login-heading">Sign in to your campus</h1><p>Use the account provided by your institution. Access is based on your assigned responsibilities.</p></div>
        {params.error && <p className="form-alert" role="alert">{messages[params.error] ?? messages.invalid}</p>}
        {params.message === 'signed-out' && <p className="form-success">You have been signed out.</p>}
        <form action={loginAction} className="login-form">
          <label htmlFor="identifier">Username, email, or registered phone</label>
          <input id="identifier" name="identifier" autoComplete="username" required maxLength={254} autoFocus />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} />
          <button className="primary-button" type="submit">Sign in <span aria-hidden="true">→</span></button>
        </form>
        <p className="security-note"><ShieldCheck size={17} aria-hidden="true" /> Protected access. Sign-in attempts are logged.</p>
        <footer>For account access, contact your authorized KCMSC administrator.</footer>
      </section>
    </main>
  );
}
