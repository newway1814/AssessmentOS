export type DemoTenantContext = {
  schoolId: string;
  workspaceId: string;
  actorId: string;
};

// TODO: replace with auth/workspace resolution once authentication lands.
export const demoTenantContext = {
  schoolId: "school-riverside",
  workspaceId: "workspace-academic-coordination",
  actorId: "user-maya",
} satisfies DemoTenantContext;
