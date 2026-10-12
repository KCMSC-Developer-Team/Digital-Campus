import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, FileClock, GraduationCap, Users, ClipboardCheck, CalendarDays, BookOpen, ShieldCheck, Inbox } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

const modules: Record<string, { title: string; permission: string; description: string }> = {
  admissions: { title: 'Admissions', permission: 'admission.read', description: 'Review admission applications and their current workflow status.' },
  students: { title: 'Students', permission: 'student.read', description: 'Browse student records available to your assigned permissions.' },
  staff: { title: 'Staff', permission: 'staff.read', description: 'Review active staff profiles.' },
  academics: { title: 'Academics', permission: 'academic.read', description: 'Review academic years, grades, and sections.' },
  timetables: { title: 'Timetables', permission: 'timetable.read', description: 'Timetable records will appear here once timetable versioning and publishing are implemented.' },
  attendance: { title: 'Attendance', permission: 'attendance.read', description: 'Attendance records will appear here once attendance workflows are implemented.' },
  approvals: { title: 'Approvals', permission: 'approval.read', description: 'Review requests assigned to your approval responsibilities.' },
  audit: { title: 'Audit history', permission: 'audit.read', description: 'Restricted institution-wide audit history. Every access to this area is itself auditable in the completed audit workflow.' },
};

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const user = await requireUser();
  const { module } = await params;
  const config = modules[module];
  if (!config) notFound();
  const permissions = new Set(user.roles.flatMap((role) => role.permissions));
  if (!permissions.has(config.permission)) redirect('/dashboard?error=forbidden');
  const hasGlobalScope = user.roles.some((role) => role.scopeType === 'GLOBAL' && role.scopeId === '*');
  const hasGlobalAudit = user.roles.some((role) => ['CHAIRMAN', 'VICE_CHAIRMAN', 'TRUSTEE_BOARD_MEMBER'].includes(role.key) && role.permissions.includes('audit.read') && role.scopeType === 'GLOBAL' && role.scopeId === '*');
  if (module === 'audit' && !hasGlobalAudit) redirect('/dashboard?error=forbidden');

  let records: Array<{ primary: string; secondary: string; status: string }> = [];
  let note = 'No records are available yet.';
  if (module === 'students' && hasGlobalScope) {
    const students = await prisma.student.findMany({ select: { studentNumber: true, legalName: true, status: true }, orderBy: { legalName: 'asc' }, take: 100 });
    records = students.map((s) => ({ primary: s.legalName, secondary: s.studentNumber, status: s.status.replaceAll('_', ' ') }));
    note = 'Showing up to 100 records. Section-scoped student directory access is not enabled yet.';
  } else if (module === 'students') {
    note = 'Student records are not shown because this build does not yet implement section-level record filtering. No broad directory access is granted by default.';
  } else if (module === 'staff' && hasGlobalScope) {
    const staff = await prisma.staffProfile.findMany({ where: { active: true }, include: { user: { select: { displayName: true, email: true } } }, orderBy: { user: { displayName: 'asc' } }, take: 100 });
    records = staff.map((s) => ({ primary: s.user.displayName, secondary: [s.employeeNumber, s.jobTitle, s.user.email].filter(Boolean).join(' · ') || 'Staff profile', status: 'ACTIVE' }));
  } else if (module === 'staff') {
    note = 'Staff records require an institution-wide scope in this initial build.';
  } else if (module === 'academics' && hasGlobalScope) {
    const [years, grades, sections] = await Promise.all([
      prisma.academicYear.findMany({ orderBy: { startsOn: 'desc' }, take: 30 }),
      prisma.grade.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' }, take: 30 }),
      prisma.section.findMany({ where: { active: true }, include: { grade: true, academicYear: true }, orderBy: [{ academicYear: { startsOn: 'desc' } }, { grade: { sortOrder: 'asc' } }], take: 50 }),
    ]);
    records = [
      ...years.map((x) => ({ primary: x.name, secondary: `Academic year · ${x.startsOn.toISOString().slice(0,10)} to ${x.endsOn.toISOString().slice(0,10)}`, status: x.status })),
      ...grades.map((x) => ({ primary: x.name, secondary: `Grade ${x.sortOrder}`, status: x.active ? 'ACTIVE' : 'INACTIVE' })),
      ...sections.map((x) => ({ primary: `${x.grade.name} · Section ${x.name}`, secondary: x.academicYear.name, status: x.active ? 'ACTIVE' : 'INACTIVE' })),
    ];
  } else if (module === 'academics') {
    note = 'Academic structure is hidden until record-level academic scope filtering is implemented.';
  } else if (module === 'approvals' && hasGlobalScope) {
    const approvals = await prisma.approvalRequest.findMany({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }, select: { id: true, workflowType: true, resourceType: true, summary: true, status: true, submittedAt: true }, orderBy: { submittedAt: 'asc' }, take: 100 });
    records = approvals.map((x) => ({ primary: x.summary, secondary: `${x.workflowType} · ${x.resourceType} · ${x.submittedAt.toLocaleDateString('en-GB')}`, status: x.status }));
    note = 'This initial view lists pending requests. Decision actions and approver-assignment rules are not implemented yet.';
  } else if (module === 'approvals') {
    note = 'Approval records require an assigned scope; scoped approval filtering is not implemented yet.';
  } else if (module === 'audit') {
    const events = await prisma.auditEvent.findMany({ orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], select: { id: true, occurredAt: true, action: true, resourceType: true, resourceId: true, outcome: true, eventHash: true }, take: 100 });
    records = events.map((x) => ({ primary: x.action, secondary: `${x.resourceType}${x.resourceId ? ` · ${x.resourceId}` : ''} · ${x.occurredAt.toISOString()} · ${x.eventHash.slice(0,12)}…`, status: x.outcome }));
    note = 'Recent event hashes are displayed for review. A transaction-safe global chain writer, verification job, and externally protected checkpoints remain required before production audit guarantees.';
  } else if (module === 'admissions') {
    note = 'The admissions lifecycle and application/document forms are not implemented yet. No sample applications are fabricated.';
  } else if (module === 'timetables') {
    note = 'Master timetable constraints, conflict detection, approval, and publication are not implemented yet.';
  } else if (module === 'attendance') {
    note = 'Attendance entry, corrections, and guardian notifications are not implemented yet.';
  }

  const Icon = module === 'students' ? GraduationCap : module === 'staff' ? Users : module === 'academics' ? BookOpen : module === 'timetables' ? CalendarDays : module === 'approvals' ? ShieldCheck : module === 'audit' ? FileClock : module === 'attendance' ? ClipboardCheck : Inbox;
  return <main className="module-page"><header className="module-top"><Link href="/dashboard" className="back-link"><ArrowLeft size={16}/> Dashboard</Link><span className="module-user">{user.displayName}</span></header><section className="module-content"><div className="module-title-row"><span className="module-title-icon"><Icon size={22}/></span><div><p className="eyebrow">INSTITUTIONAL WORKSPACE</p><h1>{config.title}</h1><p>{config.description}</p></div></div><div className="records-panel"><div className="records-header"><div><h2>{records.length ? 'Records' : 'Workspace status'}</h2><p>{records.length ? `${records.length} record${records.length === 1 ? '' : 's'} shown` : 'No fabricated demo data'}</p></div></div>{records.length ? <div className="record-list">{records.map((r, i) => <div className="record-row" key={`${r.primary}-${i}`}><div><strong>{r.primary}</strong><small>{r.secondary}</small></div><span className="record-status">{r.status}</span></div>)}</div> : <div className="module-empty"><Inbox size={26}/><strong>No records to display</strong><p>{note}</p></div>}{records.length > 0 && <p className="records-note">{note}</p>}</div><p className="module-disclaimer">This page only exposes data-backed read views where available. Workflow actions are not shown until authorization, validation, and audit recording are implemented.</p></section></main>;
}
