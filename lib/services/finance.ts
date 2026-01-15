import { Prisma, InvoiceType, PaymentMethod } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { generateInvoiceNumber } from "@/lib/server/serial";

type InvoiceItemInput = {
  description: string;
  quantity?: number;
  unitPrice: number;
};

export const createInvoiceWithItems = async (params: {
  branchId: string;
  type: InvoiceType;
  studentId?: string;
  items: InvoiceItemInput[];
}) => {
  const total = params.items.reduce((acc, item) => {
    const qty = item.quantity ?? 1;
    return acc + qty * item.unitPrice;
  }, 0);
  const invoiceNumber = await generateInvoiceNumber(params.branchId);
  return prisma.invoice.create({
    data: {
      branchId: params.branchId,
      type: params.type,
      invoiceNumber,
      total: new Prisma.Decimal(total),
      due: new Prisma.Decimal(total),
      status: total === 0 ? "PAID" : "PARTIAL",
      items: {
        create: params.items.map((item) => ({
          description: item.description,
          quantity: item.quantity ?? 1,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          total: new Prisma.Decimal((item.quantity ?? 1) * item.unitPrice),
        })),
      },
      ...(params.studentId ? { studentId: params.studentId } : {}),
    },
  });
};

type PaymentInput = {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  branchId: string;
};

export const recordPayment = async (input: PaymentInput) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      select: { id: true, total: true, paid: true, due: true, branchId: true, voided: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.voided) throw new Error("Cannot pay a void invoice");
    if (invoice.branchId !== input.branchId) throw new Error("Branch mismatch");
    const amountDecimal = new Prisma.Decimal(input.amount);
    const newPaid = new Prisma.Decimal(invoice.paid ?? 0).add(amountDecimal);
    const newDue = new Prisma.Decimal(invoice.total).sub(newPaid);
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paid: newPaid,
        due: newDue.gte(0) ? newDue : new Prisma.Decimal(0),
        status: newDue.lte(0) ? "PAID" : "PARTIAL",
      },
    });
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        branchId: input.branchId,
        amount: amountDecimal,
        method: input.method,
        reference: input.reference,
      },
    });
    return updatedInvoice;
  });
};
