export type QuestionTenantContext = {
  schoolId: string;
  workspaceId: string;
  actorId: string;
};

export const demoTenantContext = {
  schoolId: "school-riverside",
  workspaceId: "workspace-academic-coordination",
  actorId: "user-maya",
} satisfies QuestionTenantContext;
