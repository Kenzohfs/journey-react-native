import { useI18n } from "@/hooks/useI18n";
import { Text, View } from "react-native";

export default function Index() {
  const { t, keys } = useI18n();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-zinc-400">{t(keys.INVITE_FRIENDS_PLAN_TRIP)}</Text>
    </View>
  );
}
