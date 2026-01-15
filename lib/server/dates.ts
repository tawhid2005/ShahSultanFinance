import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDhakaNow = () => dayjs().tz("Asia/Dhaka");

export const toDhakaRange = (start: dayjs.Dayjs, end: dayjs.Dayjs) => ({
  start: start.utc().toDate(),
  end: end.utc().toDate(),
});

export const buildRange = (params: {
  type?: "today" | "week" | "month" | "year" | "date" | "monthSpecific" | "range";
  date?: string;
  month?: string;
  from?: string;
  to?: string;
}) => {
  const now = getDhakaNow();
  switch (params.type) {
    case "week":
      return toDhakaRange(now.startOf("week"), now.endOf("week"));
    case "month":
      return toDhakaRange(now.startOf("month"), now.endOf("month"));
    case "year":
      return toDhakaRange(now.startOf("year"), now.endOf("year"));
    case "date":
      if (!params.date) throw new Error("Missing date");
      const date = dayjs(params.date).tz("Asia/Dhaka");
      return toDhakaRange(date.startOf("day"), date.endOf("day"));
    case "monthSpecific":
      if (!params.month) throw new Error("Missing month");
      const month = dayjs(params.month).tz("Asia/Dhaka");
      return toDhakaRange(month.startOf("month"), month.endOf("month"));
    case "range":
      if (!params.from || !params.to) throw new Error("Missing range");
      const from = dayjs(params.from).tz("Asia/Dhaka");
      const to = dayjs(params.to).tz("Asia/Dhaka");
      return toDhakaRange(from.startOf("day"), to.endOf("day"));
    case "today":
    default:
      return toDhakaRange(now.startOf("day"), now.endOf("day"));
  }
};
