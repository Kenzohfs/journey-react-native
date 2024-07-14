import dayjs, { Dayjs } from "dayjs";
import { createContext, useContext } from "react";
import { DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";

import { useI18n } from "@/hooks/useI18n";

type OrderStartsAtAndEndsAt = {
  startsAt?: DateData;
  endsAt?: DateData;
  selectedDay: DateData;
};

type FormatDatesInText = {
  startsAt: Dayjs;
  endsAt: Dayjs;
};

export type DatesSelected = {
  startsAt: DateData | undefined;
  endsAt: DateData | undefined;
  dates: MarkedDates;
  formatDatesInText: string;
};

type CalendarContextData = {
  getIntervalDates(startsAt: DateData, endsAt: DateData): MarkedDates;
  formatDatesInText({ startsAt, endsAt }: FormatDatesInText): string;
  orderStartsAtAndEndsAt({
    startsAt,
    endsAt,
    selectedDay,
  }: OrderStartsAtAndEndsAt): DatesSelected;
};

const CalendarContext = createContext<CalendarContextData>(
  {} as CalendarContextData
);

interface CalendarProviderProps {
  children: React.ReactNode;
}

const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const { t, keys } = useI18n();

  function orderStartsAtAndEndsAt({
    startsAt,
    endsAt,
    selectedDay,
  }: OrderStartsAtAndEndsAt): DatesSelected {
    if (!startsAt) {
      return {
        startsAt: selectedDay,
        endsAt: undefined,
        formatDatesInText: "",
        dates: getIntervalDates(selectedDay, selectedDay),
      };
    }

    if (startsAt && endsAt) {
      return {
        startsAt: selectedDay,
        endsAt: undefined,
        formatDatesInText: "",
        dates: getIntervalDates(selectedDay, selectedDay),
      };
    }

    if (selectedDay.timestamp <= startsAt.timestamp) {
      return {
        startsAt: selectedDay,
        endsAt: startsAt,
        dates: getIntervalDates(selectedDay, startsAt),
        formatDatesInText: formatDatesInText({
          startsAt: dayjs(selectedDay.dateString),
          endsAt: dayjs(startsAt.dateString),
        }),
      };
    }

    return {
      startsAt: startsAt,
      endsAt: selectedDay,
      dates: getIntervalDates(startsAt, selectedDay),
      formatDatesInText: formatDatesInText({
        startsAt: dayjs(startsAt.dateString),
        endsAt: dayjs(selectedDay.dateString),
      }),
    };
  }

  function formatDatesInText({ startsAt, endsAt }: FormatDatesInText): string {
    const formatted = `${startsAt.date()} ${t(keys.UNTIL)} ${endsAt.date()} ${t(
      keys.OF
    )} ${startsAt.format("MMMM")}`;

    return formatted;
  }

  function getIntervalDates(startsAt: DateData, endsAt: DateData): MarkedDates {
    const start = dayjs(startsAt.dateString);
    const end = dayjs(endsAt.dateString);

    let currentDate = start;
    const datesArray: string[] = [];

    while (currentDate.isBefore(end) || currentDate.isSame(end)) {
      datesArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    let interval: MarkedDates = {};

    datesArray.forEach((date) => {
      interval = {
        ...interval,
        [date]: {
          selected: true,
        },
      };
    });

    return interval;
  }

  return (
    <CalendarContext.Provider
      value={{ formatDatesInText, getIntervalDates, orderStartsAtAndEndsAt }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

const useCalendar = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendar must be used inside an CalendarProvider");
  }

  return context;
};

export { CalendarProvider, useCalendar };

// export const calendarUtils = {
//   orderStartsAtAndEndsAt,
//   formatDatesInText,
//   dateToCalendarDate: CalendarUtils.getCalendarDateString,
// };
