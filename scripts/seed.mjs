import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const permissionCatalog = {
  'dashboard.read': 'View the institutional workspace',
  'user.read': 'View account directory', 'roles.assign': 'Assign and revoke role grants',
  'student.read': 'View students within authorized scope', 'student.create': 'Create student records through approved workflows', 'student.update': 'Correct student records with history', 'student.transfer': 'Transfer student enrollment',
  'guardian.read': 'View authorized guardian records', 'staff.read': 'View staff directory', 'staff.assign': 'Manage staff assignments',
  'admission.read': 'View admission applications', 'admission.review': 'Review admission applications', 'admission.approve': 'Approve admissions',
  'academic.read': 'View academic structure', 'academic.manage': 'Manage academic years, grades, sections and subjects',
  'timetable.read': 'View authorized timetables', 'timetable.create': 'Draft timetables', 'timetable.publish': 'Publish approved timetables',
  'syllabus.read': 'View published syllabuses', 'syllabus.submit': 'Submit syllabus changes', 'syllabus.approve': 'Approve syllabuses',
  'diary.read': 'View class diaries', 'diary.publish': 'Publish class diaries', 'attendance.read': 'View authorized attendance', 'attendance.record': 'Record attendance', 'attendance.correct': 'Correct attendance with a reason',
  'assignment.read': 'View assignments', 'assignment.manage': 'Create and manage assignments', 'marks.enter': 'Enter assessment marks', 'results.read': 'View published results', 'results.publish': 'Publish approved results',
  'approval.read': 'View assigned approval requests', 'approval.decide': 'Decide assigned approval requests', 'governance.read': 'View authorized governance records', 'governance.approve': 'Approve governance decisions',
  'audit.read': 'Read institution-wide audit history', 'audit.export': 'Export institution-wide audit history', 'notification.read': 'Read own notifications', 'report.read': 'View authorized reports',
};
const all = Object.keys(permissionCatalog);
const rolePermissions = {
  DEVELOPER: ['dashboard.read'],
  IT_MANAGER: ['dashboard.read', 'user.read', 'roles.assign', 'academic.read', 'academic.manage', 'report.read'],
  CHAIRMAN: ['dashboard.read', 'governance.read', 'governance.approve', 'approval.read', 'approval.decide', 'audit.read', 'audit.export', 'report.read'],
  VICE_CHAIRMAN: ['dashboard.read', 'governance.read', 'governance.approve', 'approval.read', 'approval.decide', 'report.read'],
  TRUSTEE_BOARD_MEMBER: ['dashboard.read', 'governance.read', 'approval.read', 'report.read'],
  ADVISOR: ['dashboard.read', 'governance.read', 'report.read'],
  PRINCIPAL: ['dashboard.read', 'student.read', 'student.update', 'guardian.read', 'staff.read', 'admission.read', 'admission.review', 'admission.approve', 'academic.read', 'academic.manage', 'timetable.read', 'timetable.create', 'timetable.publish', 'syllabus.read', 'syllabus.approve', 'diary.read', 'diary.publish', 'attendance.read', 'attendance.correct', 'results.read', 'results.publish', 'approval.read', 'approval.decide', 'report.read'],
  VICE_PRINCIPAL: ['dashboard.read', 'student.read', 'staff.read', 'admission.read', 'admission.review', 'academic.read', 'timetable.read', 'syllabus.read', 'syllabus.approve', 'diary.read', 'attendance.read', 'results.read', 'approval.read', 'report.read'],
  COORDINATOR: ['dashboard.read', 'student.read', 'academic.read', 'timetable.read', 'timetable.create', 'syllabus.read', 'syllabus.submit', 'diary.read', 'attendance.read', 'results.read', 'report.read'],
  ADMISSION_OFFICER: ['dashboard.read', 'admission.read', 'admission.review', 'student.read', 'student.create', 'guardian.read'],
  TEACHER: ['dashboard.read', 'student.read', 'academic.read', 'timetable.read', 'syllabus.read', 'diary.read', 'attendance.read', 'attendance.record', 'assignment.read', 'assignment.manage', 'marks.enter', 'results.read'],
  FORM_TEACHER: ['dashboard.read', 'student.read', 'guardian.read', 'academic.read', 'timetable.read', 'diary.read', 'attendance.read', 'attendance.record', 'attendance.correct', 'assignment.read', 'marks.enter', 'results.read'],
  CLASS_CAPTAIN: ['dashboard.read', 'academic.read', 'timetable.read', 'syllabus.read', 'diary.read', 'assignment.read'],
  STUDENT: ['dashboard.read', 'academic.read', 'timetable.read', 'syllabus.read', 'diary.read', 'assignment.read', 'results.read', 'notification.read'],
};
const roleNames = {
  DEVELOPER: 'Developer', IT_MANAGER: 'IT Manager', CHAIRMAN: 'Chairman', VICE_CHAIRMAN: 'Vice Chairman',
  TRUSTEE_BOARD_MEMBER: 'Trustee Board Member', ADVISOR: 'Advisor', PRINCIPAL: 'Principal', VICE_PRINCIPAL: 'Vice Principal',
  COORDINATOR: 'Coordinator', ADMISSION_OFFICER: 'Admission Officer', TEACHER: 'Teacher', FORM_TEACHER: 'Form Teacher',
  CLASS_CAPTAIN: 'Class Captain', STUDENT: 'Student',
};

async function main() {
  for (const [key, description] of Object.entries(permissionCatalog)) {
    await prisma.permission.upsert({ where: { key }, update: { description }, create: { key, description } });
  }
  for (const [key, permissions] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({ where: { key }, update: { name: roleNames[key] }, create: { key, name: roleNames[key], description: `KCMSC ${roleNames[key]} role`, isSystem: true } });
    for (const permissionKey of permissions) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key: permissionKey } });
      await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
    }
  }
  for (const key of all) {
    // Keep the catalog in the database even when no role is assigned the permission by default.
    await prisma.permission.findUniqueOrThrow({ where: { key } });
  }
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const displayName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (username || email || password) {
    if (!username || !email || !displayName || !password || password.length < 16) {
      throw new Error('To bootstrap an administrator, set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and a BOOTSTRAP_ADMIN_PASSWORD of at least 16 characters.');
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) throw new Error('Bootstrap account already exists. Refusing to reset or overwrite its credentials.');
    const salt = randomBytes(16);
    const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const passwordHash = `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(key).toString('base64url')}`;
    const user = await prisma.user.create({ data: { username, email, displayName, passwordHash, status: 'ACTIVE' } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: 'IT_MANAGER' } });
    await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: role.id, scopeType: 'GLOBAL', scopeId: '*', reason: 'Initial bootstrap; review and reduce privileges after setup.' } });
    console.log(`Created bootstrap administrator: ${username}. Remove bootstrap variables from the environment after setup.`);
  }
  console.log('KCMSC roles and permissions seeded.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
