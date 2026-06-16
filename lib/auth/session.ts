export const authRoles = [
  "ADMIN",
  "ACADEMIC_COORDINATOR",
  "REVIEWER",
  "TEACHER",
] as const;

export type AuthRole = (typeof authRoles)[number];

export type AuthSession = {
  userId: string;
  userName: string;
  email: string;
  role: AuthRole;
  schoolId: string;
  schoolName: string;
  workspaceId: string;
  workspaceName: string;
  isDemoMode: boolean;
};

export type WorkspaceContext = {
  schoolId: string;
  workspaceId: string;
  actorId: string;
  role: AuthRole;
};

export type RepositoryWorkspaceContext = Pick<
  WorkspaceContext,
  "schoolId" | "workspaceId" | "actorId"
>;

export type PermissionName =
  | "canManageQuestions"
  | "canManageImports"
  | "canManagePapers"
  | "canManageTemplates"
  | "canCreateExports"
  | "canViewAuditLogs";

export type PermissionSet = Record<PermissionName, boolean>;

const rolePermissions = {
  ADMIN: {
    canManageQuestions: true,
    canManageImports: true,
    canManagePapers: true,
    canManageTemplates: true,
    canCreateExports: true,
    canViewAuditLogs: true,
  },
  ACADEMIC_COORDINATOR: {
    canManageQuestions: true,
    canManageImports: true,
    canManagePapers: true,
    canManageTemplates: true,
    canCreateExports: true,
    canViewAuditLogs: true,
  },
  REVIEWER: {
    canManageQuestions: true,
    canManageImports: true,
    canManagePapers: false,
    canManageTemplates: false,
    canCreateExports: false,
    canViewAuditLogs: false,
  },
  TEACHER: {
    canManageQuestions: true,
    canManageImports: true,
    canManagePapers: true,
    canManageTemplates: false,
    canCreateExports: true,
    canViewAuditLogs: false,
  },
} satisfies Record<AuthRole, PermissionSet>;

const devSession = {
  userId: process.env.ASSESSMENTOS_DEV_USER_ID ?? "user-maya",
  userName: process.env.ASSESSMENTOS_DEV_USER_NAME ?? "Maya Rao",
  email:
    process.env.ASSESSMENTOS_DEV_USER_EMAIL ?? "maya.rao@riverside.example",
  role: parseRole(process.env.ASSESSMENTOS_DEV_ROLE),
  schoolId: process.env.ASSESSMENTOS_DEV_SCHOOL_ID ?? "school-riverside",
  schoolName:
    process.env.ASSESSMENTOS_DEV_SCHOOL_NAME ??
    "Riverside International School",
  workspaceId:
    process.env.ASSESSMENTOS_DEV_WORKSPACE_ID ??
    "workspace-academic-coordination",
  workspaceName:
    process.env.ASSESSMENTOS_DEV_WORKSPACE_NAME ?? "Academic coordination",
  isDemoMode: true,
} satisfies AuthSession;

export async function getCurrentSession(): Promise<AuthSession> {
  // TODO: replace this dev/demo provider with Auth.js, Clerk, or school SSO.
  return devSession;
}

export async function getCurrentWorkspaceContext(): Promise<WorkspaceContext> {
  const session = await getCurrentSession();

  return workspaceContextFromSession(session);
}

export function workspaceContextFromSession(
  session: AuthSession,
): WorkspaceContext {
  return {
    schoolId: session.schoolId,
    workspaceId: session.workspaceId,
    actorId: session.userId,
    role: session.role,
  };
}

export function getPermissions(role: AuthRole): PermissionSet {
  return rolePermissions[role];
}

export function canManageQuestions(role: AuthRole) {
  return getPermissions(role).canManageQuestions;
}

export function canManageImports(role: AuthRole) {
  return getPermissions(role).canManageImports;
}

export function canManagePapers(role: AuthRole) {
  return getPermissions(role).canManagePapers;
}

export function canManageTemplates(role: AuthRole) {
  return getPermissions(role).canManageTemplates;
}

export function canCreateExports(role: AuthRole) {
  return getPermissions(role).canCreateExports;
}

export function canViewAuditLogs(role: AuthRole) {
  return getPermissions(role).canViewAuditLogs;
}

export function requirePermission(role: AuthRole, permission: PermissionName) {
  if (!getPermissions(role)[permission]) {
    throw new Error(`Role ${role} does not have ${permission} permission.`);
  }
}

function parseRole(value?: string): AuthRole {
  return authRoles.find((role) => role === value) ?? "ACADEMIC_COORDINATOR";
}
