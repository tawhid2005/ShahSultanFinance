import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { searchInvoices } from "@/lib/services/invoice";
import { getCurrentUser } from "@/lib/server/session";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (![Role.SUPER_ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.RECEPTION].includes(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const term = req.nextUrl.searchParams.get("q") ?? "";
  const invoices = await searchInvoices(term);
  return NextResponse.json(invoices);
}
