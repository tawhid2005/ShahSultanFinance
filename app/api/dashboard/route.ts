import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getDashboardMetrics } from "@/lib/services/dashboard";
import { dashboardFilterSchema } from "@/lib/validators/dashboard";
import { getCurrentUser } from "@/lib/server/session";
import { assertRole } from "@/lib/server/rbac";

const toParams = (searchParams: URLSearchParams) => {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  assertRole(user, [Role.SUPER_ADMIN, Role.BRANCH_MANAGER]);
  const filters = dashboardFilterSchema.parse(toParams(req.nextUrl.searchParams));
  const branchId =
    user?.role === Role.BRANCH_MANAGER
      ? user.branchId ?? undefined
      : filters.branchId ?? undefined;
  const data = await getDashboardMetrics(filters, branchId);
  return NextResponse.json(data);
}
