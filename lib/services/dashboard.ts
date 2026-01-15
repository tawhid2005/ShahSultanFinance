import { buildRange } from "@/lib/server/dates";
import prisma from "@/lib/db/prisma";

export type FilterInput = {
  type?: "today" | "week" | "month" | "year" | "date" | "monthSpecific" | "range";
  date?: string;
  month?: string;
  from?: string;
  to?: string;
  branchId?: string;
};

export const getDashboardMetrics = async (filters: FilterInput, branchId?: string) => {
  const { start, end } = buildRange(filters);
  const invoiceWhere: Parameters<typeof prisma.invoice.aggregate>[0]["where"] = {
    voided: false,
    issuedAt: { gte: start, lte: end },
    ...(branchId ? { branchId } : {}),
  };
  const expenseWhere: Parameters<typeof prisma.expense.aggregate>[0]["where"] = {
    voided: false,
    expenseDate: { gte: start, lte: end },
    ...(branchId ? { branchId } : {}),
  };

  const [invoiceSum, expenseSum, invoiceGroups, expenseGroups, branches] = await Promise.all([
    prisma.invoice.aggregate({ where: invoiceWhere, _sum: { total: true } }),
    prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
    prisma.invoice.groupBy({
      by: ["branchId"],
      where: invoiceWhere,
      _sum: { total: true },
    }),
    prisma.expense.groupBy({
      by: ["branchId"],
      where: expenseWhere,
      _sum: { amount: true },
    }),
    prisma.branch.findMany({ select: { id: true, name: true, code: true } }),
  ]);

  const branchMetrics = branches.map((branch) => {
    const incomeEntry = invoiceGroups.find((g) => g.branchId === branch.id);
    const expenseEntry = expenseGroups.find((g) => g.branchId === branch.id);
    const income = Number(incomeEntry?._sum.total ?? 0);
    const expense = Number(expenseEntry?._sum.amount ?? 0);
    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      income,
      expense,
      profit: income - expense,
    };
  });

  const totalIncome = Number(invoiceSum._sum.total ?? 0);
  const totalExpense = Number(expenseSum._sum.amount ?? 0);

  return {
    range: { start, end },
    income: totalIncome,
    expense: totalExpense,
    profit: totalIncome - totalExpense,
    branches: branchMetrics,
  };
};
