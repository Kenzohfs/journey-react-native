import {
  ArrowRight,
  Calendar as IconCalendar,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Keyboard, Text, View } from "react-native";
import { DateData } from "react-native-calendars";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { DatesSelected, useCalendar } from "@/hooks/useCalendar";
import { useI18n } from "@/hooks/useI18n";
import { colors } from "@/styles/colors";
import dayjs from "dayjs";

enum STEP_FORM {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Index() {
  const { t, keys } = useI18n();
  const { orderStartsAtAndEndsAt } = useCalendar();

  const [stepForm, setStepForm] = useState<STEP_FORM>(STEP_FORM.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [selectedDates, setSelectedDates] = useState<DatesSelected>(
    {} as DatesSelected
  );
  const [destination, setDestination] = useState<string>("");

  const handleNextStepForm = () => {
    debugger;
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        t(keys.TRIP_DETAILS),
        t(keys.INPUT_ALL_INFO_TO_CONTINUE)
      );
    }

    if (destination.trim().length < 4) {
      return Alert.alert(
        t(keys.TRIP_DETAILS),
        t(keys.DESTINATION) + " " + t(keys.ERROR_AT_LEAST_4_CHAR)
      );
    }

    if (stepForm === STEP_FORM.TRIP_DETAILS) {
      setStepForm(STEP_FORM.ADD_EMAIL);
    }
  };

  const handleSelectDate = (selectedDay: DateData) => {
    const dates = orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
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
            editable={stepForm === STEP_FORM.TRIP_DETAILS}
            onChangeText={setDestination}
            value={destination}
          ></Input.Field>
        </Input>

        <Input>
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder={t(keys.WHEN_QUESTION)}
            editable={stepForm === STEP_FORM.TRIP_DETAILS}
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPressIn={() =>
              stepForm === STEP_FORM.TRIP_DETAILS &&
              setShowModal(MODAL.CALENDAR)
            }
            value={selectedDates.formatDatesInText}
          ></Input.Field>
        </Input>

        {stepForm === STEP_FORM.ADD_EMAIL && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(STEP_FORM.TRIP_DETAILS)}
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
          {stepForm === STEP_FORM.TRIP_DETAILS ? (
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

      <Modal
        title={t(keys.SELECT_DATE)}
        subtitle={t(keys.SELECT_DATES_INFO)}
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />

          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>{t(keys.CONFIRM)}</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
