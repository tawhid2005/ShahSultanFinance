import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import prisma from "@/lib/db/prisma";
import { getDhakaNow, toDhakaRange } from "@/lib/server/dates";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const getPartnerMonthlySummary = async (partnerId: string, month?: string) => {
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: {
      partnerBranches: {
        include: { branch: true },
      },
    },
  });
  if (!partner) return null;

  const targetMonth = month ? dayjs(month).tz("Asia/Dhaka") : getDhakaNow();
  const { start, end } = toDhakaRange(targetMonth.startOf("month"), targetMonth.endOf("month"));

  const branchRecord = partner.partnerBranches.find((pb) => {
    const join = dayjs(pb.joinDate).tz("Asia/Dhaka");
    const exit = pb.exitDate ? dayjs(pb.exitDate).tz("Asia/Dhaka") : null;
    return join.isSameOrBefore(targetMonth, "month") && (!exit || exit.isSameOrAfter(targetMonth, "month"));
  });
  if (!branchRecord) return null;

  const branchId = branchRecord.branchId;
  const [invoiceAgg, expenseAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        branchId,
        voided: false,
        issuedAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: {
        branchId,
        voided: false,
        expenseDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
  ]);

  const income = Number(invoiceAgg._sum.total ?? 0);
  const expense = Number(expenseAgg._sum.amount ?? 0);
  const netProfit = income - expense;
  let share = 0;
  if (branchRecord.shareType === "PERCENTAGE") {
    share = (netProfit * Number(branchRecord.shareValue)) / 100;
  } else {
    share = Number(branchRecord.shareValue);
  }

  const settlements = await prisma.partnerSettlement.findMany({
    where: { partnerBranchId: branchRecord.id },
    orderBy: { month: "desc" },
  });

  return {
    partner: {
      id: partner.id,
      name: partner.name,
      email: partner.email,
    },
    branch: {
      id: branchId,
      name: branchRecord.branch.name,
      code: branchRecord.branch.code,
    },
    range: { start, end },
    income,
    expense,
    netProfit,
    share,
    shareType: branchRecord.shareType,
    shareValue: Number(branchRecord.shareValue),
    settlements,
  };
};
