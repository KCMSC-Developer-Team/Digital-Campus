'use client';

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';

const primaryNavigation = [
  { label: 'Overview', icon: LayoutDashboard, href: '#overview', active: true },
  { label: 'Admissions', icon: UserRoundPlus, href: '#admissions' },
  { label: 'Students', icon: GraduationCap, href: '#students' },
  { label: 'Staff', icon: Users, href: '#staff' },
  { label: 'Academics', icon: BookOpen, href: '#academics' },
  { label: 'Timetable', icon: CalendarDays, href: '#timetable' },
  { label: 'Attendance', icon: UserRoundCheck, href: '#attendance' },
  { label: 'Examinations & results', icon: ClipboardCheck, href: '#examinations' },
];

const administrationNavigation = [
  { label: 'Governance & approvals', icon: ShieldCheck, href: '#governance' },
  { label: 'Reports', icon: Activity, href: '#reports' },
  { label: 'Audit history', icon: LibraryBig, href: '#audit' },
  { label: 'Settings', icon: Settings2, href: '#settings' },
];

const quickActions = [
  { title: 'Review admissions', description: 'Review and process new applications.', icon: UserRoundPlus, href: '#admissions' },
  { title: 'Manage student records', description: 'Student profiles, guardians and enrollment.', icon: GraduationCap, href: '#students' },
  { title: 'Plan academic schedules', description: 'Classes, sections and teacher routines.', icon: CalendarDays, href: '#timetable' },
  { title: 'Review pending approvals', description: 'Decisions waiting for authorized review.', icon: ClipboardCheck, href: '#governance' },
];

const modules = [
  { id: 'admissions', name: 'Admissions', detail: 'Applications, review and enrollment', icon: UserRoundPlus },
  { id: 'students', name: 'Student records', detail: 'Profiles, guardians and class placement', icon: GraduationCap },
  { id: 'staff', name: 'Staff directory', detail: 'Staff profiles and assignments', icon: Users },
  { id: 'academics', name: 'Academic management', detail: 'Academic years, classes and syllabus', icon: BookOpen },
  { id: 'timetable', name: 'Timetable', detail: 'Class routines and teacher schedules', icon: CalendarDays },
  { id: 'attendance', name: 'Attendance', detail: 'Daily registers and corrections', icon: UserRoundCheck },
  { id: 'examinations', name: 'Examinations & results', detail: 'Assessments, marks and publication', icon: ClipboardCheck },
  { id: 'governance', name: 'Governance & approvals', detail: 'Requests, decisions and accountability', icon: ShieldCheck },
  { id: 'reports', name: 'Reports', detail: 'Institutional reporting and exports', icon: Activity },
  { id: 'audit', name: 'Audit history', detail: 'Restricted, traceable activity records', icon: LibraryBig },
  { id: 'settings', name: 'System settings', detail: 'Configuration and access policies', icon: Settings2 },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nav-section-label">{children}</p>;
}

function SidebarLink({ item }: { item: (typeof primaryNavigation)[number] | (typeof administrationNavigation)[number] }) {
  const Icon = item.icon;
  return (
    <a className={`sidebar-link${'active' in item && item.active ? ' active' : ''}`} href={item.href}>
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      <span>{item.label}</span>
    </a>
  );
}

export default function HomePage() {
  return (
    <div className="app-shell" id="overview">
      <aside className="sidebar" aria-label="Main navigation">
        <a href="#overview" className="brand-lockup" aria-label="KCMSC Digital Campus home">
          <span className="brand-mark">KC</span>
          <span className="brand-copy"><strong>K C Model School &amp; College</strong><small>Digital Campus</small></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">KC</span>
          <span className="workspace-copy"><strong>KCMSC Campus</strong><small>Institution workspace</small></span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <nav className="sidebar-nav">
          <SectionLabel>Workspace</SectionLabel>
          {primaryNavigation.map((item) => <SidebarLink key={item.label} item={item} />)}
          <SectionLabel>Administration</SectionLabel>
          {administrationNavigation.map((item) => <SidebarLink key={item.label} item={item} />)}
        </nav>

        <div className="sidebar-bottom">
          <div className="access-notice"><ShieldCheck size={17} /><div><strong>Access controls</strong><span>Authentication is not configured yet.</span></div></div>
          <div className="profile-row"><span className="profile-avatar">KC</span><span className="profile-copy"><strong>Local development</strong><small>No signed-in user</small></span><Menu size={16} aria-hidden="true" /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="environment-badge"><span className="status-dot" /> Development</span>
            <button className="icon-button" type="button" aria-label="Notifications are not configured" title="Notifications are not configured"><Bell size={18} /></button>
            <button className="search-button" type="button" onClick={() => document.getElementById('module-search')?.focus()}><Search size={16} /><span>Find a module</span><kbd>/</kbd></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">K C MODEL SCHOOL &amp; COLLEGE</p>
              <h1>Institution overview</h1>
              <p className="page-subtitle">A central workspace for the school’s academic and administrative operations.</p>
            </div>
            <div className="academic-period"><CalendarDays size={16} /><span><small>Academic year</small><strong>Not configured</strong></span><ChevronDown size={15} /></div>
          </section>

          <section className="setup-banner" aria-labelledby="setup-title">
            <div className="setup-icon"><Settings2 size={21} /></div>
            <div className="setup-copy"><h2 id="setup-title">Set up the institution before entering live records</h2><p>This project currently has the application shell and initial data model. Authentication, database-backed workflows and role permissions still need to be connected.</p></div>
            <span className="setup-status">Setup required</span>
          </section>

          <section className="summary-grid" aria-label="System status">
            <article className="summary-card"><div className="summary-card-top"><span>Student records</span><span className="summary-icon"><GraduationCap size={18} /></span></div><div className="summary-value">—</div><div className="summary-foot">Awaiting database connection</div></article>
            <article className="summary-card"><div className="summary-card-top"><span>Staff directory</span><span className="summary-icon"><Users size={18} /></span></div><div className="summary-value">—</div><div className="summary-foot">Awaiting database connection</div></article>
            <article className="summary-card"><div className="summary-card-top"><span>Pending approvals</span><span className="summary-icon"><ClipboardCheck size={18} /></span></div><div className="summary-value">—</div><div className="summary-foot">Workflow not connected</div></article>
            <article className="summary-card"><div className="summary-card-top"><span>Today's attendance</span><span className="summary-icon"><UserRoundCheck size={18} /></span></div><div className="summary-value">—</div><div className="summary-foot">Attendance not connected</div></article>
          </section>

          <div className="content-columns">
            <section className="panel quick-panel" aria-labelledby="quick-actions-title">
              <div className="panel-heading"><div><h2 id="quick-actions-title">Operational shortcuts</h2><p>Jump to a core area of the institution.</p></div><ArrowDownRight size={18} className="heading-icon" /></div>
              <div className="quick-action-list">
                {quickActions.map(({ title, description, icon: Icon, href }) => <a href={href} className="quick-action" key={title}><span className="action-icon"><Icon size={18} /></span><span className="action-copy"><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16} className="action-arrow" /></a>)}
              </div>
            </section>

            <section className="panel readiness-panel" aria-labelledby="readiness-title">
              <div className="panel-heading"><div><h2 id="readiness-title">Platform readiness</h2><p>Current implementation status</p></div></div>
              <div className="readiness-list">
                <div className="readiness-item"><span className="readiness-indicator done"><CheckCircle2 size={16} /></span><span><strong>Application shell</strong><small>Navigation and responsive layout</small></span><span className="readiness-tag done-tag">Ready</span></div>
                <div className="readiness-item"><span className="readiness-indicator done"><CheckCircle2 size={16} /></span><span><strong>Initial data model</strong><small>Prisma schema validates</small></span><span className="readiness-tag done-tag">Ready</span></div>
                <div className="readiness-item"><span className="readiness-indicator pending"><Activity size={16} /></span><span><strong>Authentication</strong><small>Sessions and account activation</small></span><span className="readiness-tag pending-tag">Pending</span></div>
                <div className="readiness-item"><span className="readiness-indicator pending"><Activity size={16} /></span><span><strong>Database workflows</strong><small>Persisted records and approvals</small></span><span className="readiness-tag pending-tag">Pending</span></div>
                <div className="readiness-item"><span className="readiness-indicator pending"><Activity size={16} /></span><span><strong>Audit persistence</strong><small>Transactional, verified event history</small></span><span className="readiness-tag pending-tag">Pending</span></div>
              </div>
            </section>
          </div>

          <section className="modules-section" aria-labelledby="modules-title">
            <div className="modules-heading"><div><h2 id="modules-title">Institutional modules</h2><p>Core areas planned for the KCMSC operating platform.</p></div><label className="module-search"><Search size={16} /><input id="module-search" type="search" placeholder="Filter modules" onChange={(event) => { const query = event.currentTarget.value.toLowerCase(); document.querySelectorAll<HTMLElement>('[data-module]').forEach((element) => { element.hidden = !element.dataset.module?.includes(query); }); }} /></label></div>
            <div className="module-grid">
              {modules.map(({ id, name, detail, icon: Icon }) => <article className="module-card" data-module={`${name} ${detail}`.toLowerCase()} id={id} key={id}><span className="module-icon"><Icon size={19} /></span><div className="module-copy"><h3>{name}</h3><p>{detail}</p></div><span className="module-state">Planned</span></article>)}
            </div>
          </section>

          <footer className="page-footer"><span> K C Model School &amp; College · Digital Campus</span><span>Private institutional application <span className="footer-dot">·</span> Asia/Dhaka</span></footer>
        </div>
      </main>
    </div>
  );
}
