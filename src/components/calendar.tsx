import { enUS, ptBR } from "@/utils/localeCalendarConfig";
import {
  CalendarProps,
  LocaleConfig,
  Calendar as RNCalendar,
} from "react-native-calendars";

import { useI18n } from "@/hooks/useI18n";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/fontFamily";

export function Calendar({ ...rest }: CalendarProps) {
  const { i18n } = useI18n();

  LocaleConfig.locales["pt"] = ptBR;
  LocaleConfig.locales["en"] = enUS;
  LocaleConfig.defaultLocale = i18n.locale;

  return (
    <RNCalendar
      hideExtraDays
      style={{
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
      theme={{
        textMonthFontSize: 18,
        selectedDayBackgroundColor: colors.lime[300],
        selectedDayTextColor: colors.zinc[900],
        textDayFontFamily: fontFamily.regular,
        monthTextColor: colors.zinc[200],
        arrowColor: colors.zinc[400],
        agendaDayNumColor: colors.zinc[200],
        todayTextColor: colors.lime[300],
        textDisabledColor: colors.zinc[500],
        calendarBackground: "transparent",
        textDayStyle: { color: colors.zinc[200] },
      }}
      {...rest}
    />
  );
}
