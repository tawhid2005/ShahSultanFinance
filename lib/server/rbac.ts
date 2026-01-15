import { Role } from "@prisma/client";

export class RBACError extends Error {}

export const assertRole = (user: { role: Role } | null, allowed: Role[]) => {
  if (!user || !allowed.includes(user.role)) {
    throw new RBACError("Unauthorized role");
  }
};

export const enforceBranchScope = (
  user: { branchId: string | null } | null,
  branchId: string,
) => {
  if (!user || !user.branchId) {
    throw new RBACError("Branch scope missing");
  }
  if (user.branchId !== branchId) {
    throw new RBACError("Branch mismatch");
  }
};
