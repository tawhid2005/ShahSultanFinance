import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { searchInvoices } from "@/lib/services/invoice";
import { getCurrentUser } from "@/lib/server/session";

const allowedRoles: Role[] = [
  Role.SUPER_ADMIN,
  Role.BRANCH_MANAGER,
  Role.ACCOUNTANT,
  Role.RECEPTION,
];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const term = req.nextUrl.searchParams.get("q") ?? "";
  const invoices = await searchInvoices(term);
  return NextResponse.json(invoices);
}
