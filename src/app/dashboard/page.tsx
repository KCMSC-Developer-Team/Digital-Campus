import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Activity, ArrowUpRight, BookOpen, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, LogOut, ShieldCheck, Users, UserRoundCog, FileClock, Bell, Settings2 } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logoutAction } from '@/app/actions/auth';

const nav = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { label: 'Admissions', href: '/dashboard/admissions', icon: ClipboardCheck, permission: 'admission.read' },
  { label: 'Students', href: '/dashboard/students', icon: GraduationCap, permission: 'student.read' },
  { label: 'Staff', href: '/dashboard/staff', icon: Users, permission: 'staff.read' },
  { label: 'Academics', href: '/dashboard/academics', icon: BookOpen, permission: 'academic.read' },
  { label: 'Timetables', href: '/dashboard/timetables', icon: CalendarDays, permission: 'timetable.read' },
  { label: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck, permission: 'attendance.read' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: ShieldCheck, permission: 'approval.read' },
  { label: 'Audit history', href: '/dashboard/audit', icon: FileClock, permission: 'audit.read' },
];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const permissionSet = new Set(user.roles.flatMap((r) => r.permissions));
  const hasGlobalScope = user.roles.some((role) => role.scopeType === 'GLOBAL' && role.scopeId === '*');
  const governingRoles = new Set(['CHAIRMAN', 'VICE_CHAIRMAN', 'TRUSTEE_BOARD_MEMBER']);
  const canReadGlobalAudit = user.roles.some((role) => governingRoles.has(role.key) && role.permissions.includes('audit.read') && role.scopeType === 'GLOBAL' && role.scopeId === '*');
  const visibleNav = nav.filter((item) => (!item.permission || permissionSet.has(item.permission)) && (item.href !== '/dashboard/audit' || canReadGlobalAudit));
  const [studentCount, staffCount, pendingApprovals, activeYears, unreadNotifications] = await Promise.all([
    permissionSet.has('student.read') && hasGlobalScope ? prisma.student.count({ where: { status: { in: ['ADMITTED', 'ENROLLED'] } } }) : Promise.resolve(null),
    permissionSet.has('staff.read') && hasGlobalScope ? prisma.staffProfile.count({ where: { active: true } }) : Promise.resolve(null),
    permissionSet.has('approval.read') && hasGlobalScope ? prisma.approvalRequest.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }) : Promise.resolve(null),
    prisma.academicYear.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true }, orderBy: { startsOn: 'desc' }, take: 2 }),
    prisma.notification.count({ where: { recipientId: user.id, readAt: null } }),
  ]);
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup sidebar-brand" href="/dashboard"><span className="brand-mark">KC</span><span><strong>K C Model School &amp; College</strong><small>Digital Campus</small></span></Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="side-nav">{visibleNav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${href === '/dashboard' ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
        <div className="sidebar-bottom"><div className="privacy-label"><ShieldCheck size={16} /> Permission-controlled access</div><form action={logoutAction}><button className="logout-button" type="submit"><LogOut size={17} /> Sign out</button></form></div>
      </aside>
      <section className="workspace">
        <header className="topbar"><div><div className="breadcrumb">KCMSC <span>/</span> Workspace</div><h1>Institutional overview</h1></div><div className="topbar-user"><span className="notification-indicator"><Bell size={18}/>{unreadNotifications > 0 && <i />}</span><span className="avatar">{user.displayName.trim().split(/\s+/).slice(0,2).map((x) => x[0]).join('').toUpperCase()}</span><span className="user-copy"><strong>{user.displayName}</strong><small>{user.roles.map((r) => r.name).join(' · ') || 'No role assigned'}</small></span></div></header>
        {params.error === 'forbidden' && <div className="form-alert">You do not have permission to access that area.</div>}
        <section className="welcome-row"><div><p className="eyebrow">YOUR CAMPUS, AT A GLANCE</p><h2>Welcome back, {user.displayName.split(' ')[0]}.</h2><p>Here are the records and actions available to your assigned responsibilities.</p></div><div className="academic-chip"><CalendarDays size={17}/><span>{activeYears[0]?.name ?? 'No active academic year'}</span></div></section>
        <section className="metrics-grid" aria-label="Operational counts">
          {studentCount !== null && <Metric icon={<GraduationCap />} label="Active students" value={studentCount.toLocaleString()} note="Admitted or enrolled" />}
          {staffCount !== null && <Metric icon={<Users />} label="Active staff" value={staffCount.toLocaleString()} note="Current staff profiles" />}
          {pendingApprovals !== null && <Metric icon={<ClipboardCheck />} label="Pending approvals" value={pendingApprovals.toLocaleString()} note="Submitted or under review" />}
          <Metric icon={<Bell />} label="Unread notifications" value={unreadNotifications.toLocaleString()} note="Assigned to your account" />
        </section>
        <section className="dashboard-columns"><div className="section-panel"><div className="panel-heading"><div><h3>Your workspace</h3><p>Only areas granted to your account are shown.</p></div><Settings2 size={19}/></div><div className="module-list">{visibleNav.filter((item) => item.href !== '/dashboard').map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="module-row"><span className="module-icon"><Icon size={19}/></span><span className="module-copy"><strong>{label}</strong><small>Open {label.toLowerCase()} workspace</small></span><ArrowUpRight size={17} className="module-arrow"/></Link>)}{visibleNav.length === 1 && <p className="empty-state">No operational modules have been assigned to this account yet. Ask an authorized administrator to review your role assignments.</p>}</div></div>
          <div className="section-panel activity-panel"><div className="panel-heading"><div><h3>Account &amp; security</h3><p>Current access context</p></div><ShieldCheck size={19}/></div><div className="security-summary"><div><span className="status-dot"/><strong>Authenticated session</strong></div><p>Your session is stored server-side. Role and permission data are loaded from the database, not from browser-submitted role claims.</p></div><div className="roles-heading">ASSIGNED ROLES</div>{user.roles.length ? user.roles.map((role) => <div className="role-pill-row" key={`${role.key}:${role.scopeId}`}><span>{role.name}</span><small>{role.scopeType && role.scopeId ? `${role.scopeType}: ${role.scopeId}` : 'Scope not assigned'}</small></div>) : <p className="empty-state">No active role assignment. Access to operational records is unavailable.</p>}<div className="activity-foot"><Activity size={16}/><span>Important operations are intended to be recorded in audit history.</span></div></div></section>
        <footer className="workspace-footer">K C Model School &amp; College · Private institutional system · Asia/Dhaka</footer>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <article className="metric"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span></div><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></article>;
}
