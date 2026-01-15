import { z } from "zod";

export const dashboardFilterSchema = z.object({
  type: z.enum(["today", "week", "month", "year", "date", "monthSpecific", "range"]).optional(),
  date: z.string().optional(),
  month: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  branchId: z.string().optional(),
});
