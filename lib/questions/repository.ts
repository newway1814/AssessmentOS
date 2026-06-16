import { getCurrentWorkspaceContext } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { createDrizzleQuestionRepository } from "@/lib/questions/drizzle-question-repository";

export async function getQuestionRepository() {
  return createDrizzleQuestionRepository(
    db,
    await getCurrentWorkspaceContext(),
  );
}
