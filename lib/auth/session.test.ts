import { describe, expect, it } from "vitest";

import {
  canCreateExports,
  canManageImports,
  canManagePapers,
  canManageQuestions,
  canManageTemplates,
  canViewAuditLogs,
  getPermissions,
  requirePermission,
  workspaceContextFromSession,
  type AuthSession,
} from "@/lib/auth/session";

describe("auth session permissions", () => {
  it("grants admins every workspace permission", () => {
    expect(Object.values(getPermissions("ADMIN")).every(Boolean)).toBe(true);
  });

  it("keeps teacher permissions focused on classroom workflows", () => {
    expect(canManageQuestions("TEACHER")).toBe(true);
    expect(canManageImports("TEACHER")).toBe(true);
    expect(canManagePapers("TEACHER")).toBe(true);
    expect(canCreateExports("TEACHER")).toBe(true);
    expect(canManageTemplates("TEACHER")).toBe(false);
    expect(canViewAuditLogs("TEACHER")).toBe(false);
  });

  it("allows reviewers to review content without export or template control", () => {
    expect(canManageQuestions("REVIEWER")).toBe(true);
    expect(canManageImports("REVIEWER")).toBe(true);
    expect(canManagePapers("REVIEWER")).toBe(false);
    expect(canManageTemplates("REVIEWER")).toBe(false);
    expect(canCreateExports("REVIEWER")).toBe(false);
  });

  it("throws when a role lacks a required permission", () => {
    expect(() => requirePermission("TEACHER", "canManageTemplates")).toThrow(
      /TEACHER/,
    );
  });

  it("derives workspace context from the current session shape", () => {
    expect(workspaceContextFromSession(makeSession())).toEqual({
      schoolId: "school-1",
      workspaceId: "workspace-1",
      actorId: "user-1",
      role: "ACADEMIC_COORDINATOR",
    });
  });
});

function makeSession(): AuthSession {
  return {
    userId: "user-1",
    userName: "Coordinator",
    email: "coordinator@example.test",
    role: "ACADEMIC_COORDINATOR",
    schoolId: "school-1",
    schoolName: "Test School",
    workspaceId: "workspace-1",
    workspaceName: "Assessment workspace",
    isDemoMode: true,
  };
}
