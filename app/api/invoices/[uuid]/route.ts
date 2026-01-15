import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getInvoiceByUuid } from "@/lib/services/invoice";
import { getCurrentUser } from "@/lib/server/session";
import { RBACError } from "@/lib/server/rbac";

export async function GET(_req: Request, { params }: { params: { uuid: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const invoice = await getInvoiceByUuid(params.uuid);
    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }
    if (user.role !== Role.SUPER_ADMIN && user.branchId !== invoice.branchId) {
      throw new RBACError("Branch mismatch");
    }
    return NextResponse.json(invoice);
  } catch (err) {
    if (err instanceof RBACError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    throw err;
  }
}
