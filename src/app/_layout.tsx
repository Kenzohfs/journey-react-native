import "@/styles/global.css";
import "@/utils/dayjsLocaleConfig";

import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";

import { Loading } from "@/components/loading";

import { CalendarProvider } from "@/hooks/useCalendar";
import { I18nProvider } from "@/hooks/useI18n";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return <Loading />;

  return (
    <I18nProvider>
      <CalendarProvider>
        <View className="flex-1 bg-zinc-950">
          <StatusBar
            barStyle={"light-content"}
            backgroundColor={"transparent"}
            translucent
          />
          <Slot />
        </View>
      </CalendarProvider>
    </I18nProvider>
  );
}
