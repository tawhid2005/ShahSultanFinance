import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import prisma from "@/lib/db/prisma";
import { CounterScope } from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);

type CounterKey = {
  branchId: string;
  scope: CounterScope;
  metadata: string;
};

const dhakaNow = () => dayjs().tz("Asia/Dhaka");

const nextCounterValue = async (key: CounterKey) => {
  const { branchId, scope, metadata } = key;
  const counter = await prisma.counter.upsert({
    where: {
      branchId_scope_metadata: { branchId, scope, metadata },
    },
    create: {
      branchId,
      scope,
      metadata,
      value: 1,
    },
    update: {
      value: { increment: 1 },
    },
  });
  return counter.value;
};

export const generateStudentId = async (branchId: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true },
  });
  if (!branch) throw new Error("Branch not found");
  const now = dhakaNow();
  const yearDigits = now.format("YY");
  const datePart = now.format("YYYYMMDD");
  const serial = await nextCounterValue({
    branchId,
    scope: CounterScope.STUDENT_SERIAL_YEAR,
    metadata: now.format("YYYY"),
  });
  const padded = serial.toString().padStart(6, "0");
  return `${branch.code}-${yearDigits}-${padded}-${datePart}`;
};

export const generateInvoiceNumber = async (branchId: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true },
  });
  if (!branch) throw new Error("Branch not found");
  const now = dhakaNow();
  const datePart = now.format("YYYYMMDD");
  const serial = await nextCounterValue({
    branchId,
    scope: CounterScope.INVOICE_DAILY,
    metadata: datePart,
  });
  const padded = serial.toString().padStart(5, "0");
  return `INV-${branch.code}-${datePart}-${padded}`;
};

export const dhakaToday = () => dhakaNow().startOf("day").toDate();
export const dhakaMonthStart = () => dhakaNow().startOf("month").toDate();
export const dhakaWeekStart = () => dhakaNow().startOf("week").toDate();
export const dhakaYearStart = () => dhakaNow().startOf("year").toDate();
