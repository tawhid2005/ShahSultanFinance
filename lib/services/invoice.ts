import prisma from "@/lib/db/prisma";

export const getInvoiceByUuid = async (uuid: string) => {
  return prisma.invoice.findUnique({
    where: { uuid },
    include: {
      items: true,
      payments: true,
      branch: true,
      student: true,
    },
  });
};

export const searchInvoices = async (term: string) => {
  return prisma.invoice.findMany({
    where: {
      invoiceNumber: {
        contains: term,
        mode: "insensitive",
      },
    },
    orderBy: { issuedAt: "desc" },
    take: 20,
  });
};
