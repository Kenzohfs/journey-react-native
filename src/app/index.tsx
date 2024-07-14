import { useI18n } from "@/hooks/useI18n";
import {
  ArrowRight,
  Calendar as IconCalendar,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { Image, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { colors } from "@/styles/colors";
import { useState } from "react";

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export default function Index() {
  const { t, keys } = useI18n();

  const [stepForm, setStepForm] = useState<StepForm>(StepForm.TRIP_DETAILS);

  const handleNextStepForm = () => {
    if (stepForm === StepForm.TRIP_DETAILS) {
      setStepForm(StepForm.ADD_EMAIL);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        className="h-8"
        resizeMode="contain"
      />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        {t(keys.INVITE_FRIENDS_PLAN_TRIP)}
      </Text>

      <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
        <Input>
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder={t(keys.TO_WHERE_QUESTION)}
            editable={stepForm === StepForm.TRIP_DETAILS}
          ></Input.Field>
        </Input>

        <Input>
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder={t(keys.WHEN_QUESTION)}
            editable={stepForm === StepForm.TRIP_DETAILS}
          ></Input.Field>
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(StepForm.TRIP_DETAILS)}
              >
                <Button.Title>{t(keys.UPDATE_LOCAL_DATE)}</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder={t(keys.WHO_IS_GOING_QUESTION)}
              ></Input.Field>
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm}>
          {stepForm === StepForm.TRIP_DETAILS ? (
            <Button.Title>{t(keys.CONTINUE)}</Button.Title>
          ) : (
            <Button.Title>{t(keys.CONFIRM_TRIP)}</Button.Title>
          )}
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        {t(keys.ACCEPT_PRIVACY_AND_POLICY_TERMS)}{" "}
        <Text className="text-zinc-300 underline">
          {t(keys.USE_TERMS_AND_PRIVACY_POLICY)}
        </Text>
      </Text>
    </View>
  );
}
