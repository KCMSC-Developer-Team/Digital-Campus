/** Central permission vocabulary. Never trust role or scope claims supplied by a browser. */
export const PERMISSIONS = [
  'student.read', 'student.create', 'student.update', 'student.transfer',
  'staff.assign', 'timetable.create', 'timetable.publish',
  'syllabus.submit', 'syllabus.approve', 'diary.publish',
  'attendance.correct', 'marks.enter', 'results.publish',
  'governance.approve', 'audit.read', 'audit.export', 'roles.assign',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type RoleAssignment = {
  role: string;
  permissions: readonly Permission[];
  /** Scope values must come from persisted server-side assignments. */
  scopes: readonly string[];
  active: boolean;
};

export type AuthorizationContext = {
  userId: string;
  assignments: readonly RoleAssignment[];
};

export type AuthorizationRequest = {
  permission: Permission;
  requiredScope?: string;
};

/** Pure policy function; callers must construct context from trusted server-side data. */
export function isAuthorized(
  context: AuthorizationContext | null | undefined,
  request: AuthorizationRequest,
): boolean {
  if (!context?.userId) return false;
  return context.assignments.some((assignment) => {
    if (!assignment.active || !assignment.permissions.includes(request.permission)) return false;
    if (!request.requiredScope) return true;
    return assignment.scopes.includes('*') || assignment.scopes.includes(request.requiredScope);
  });
}

/** Global audit is a separately granted permission, never implied by an operational role. */
export function canReadGlobalAudit(context: AuthorizationContext | null | undefined): boolean {
  const governingRoles = new Set(['CHAIRMAN', 'VICE_CHAIRMAN', 'TRUSTEE_BOARD_MEMBER']);
  if (!context?.userId) return false;
  return context.assignments.some((assignment) => assignment.active
    && governingRoles.has(assignment.role)
    && assignment.permissions.includes('audit.read')
    && assignment.scopes.includes('*'));
}
