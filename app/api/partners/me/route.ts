import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getPartnerMonthlySummary } from "@/lib/services/partner";
import { getCurrentUser } from "@/lib/server/session";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.PARTNER || !user.partnerId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const month = req.nextUrl.searchParams.get("month") ?? undefined;
  const summary = await getPartnerMonthlySummary(user.partnerId, month ?? undefined);
  if (!summary) {
    return NextResponse.json({ message: "Partner summary not found" }, { status: 404 });
  }
  return NextResponse.json(summary);
}
