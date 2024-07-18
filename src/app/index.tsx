import dayjs from "dayjs";
import { router } from "expo-router";
import {
  ArrowRight,
  AtSign,
  Calendar as IconCalendar,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Keyboard, Text, View } from "react-native";
import { DateData } from "react-native-calendars";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { GuestEmail } from "@/components/email";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Modal } from "@/components/modal";
import { DatesSelected, useCalendar } from "@/hooks/useCalendar";
import { useI18n } from "@/hooks/useI18n";
import { tripServer } from "@/server/trip-server";
import { tripStorage } from "@/storage/trip";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";

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
  const [emailToInvite, setEmailToInvite] = useState<string>("");
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([]);
  const [isCreatingTrip, setIsCreatingTrip] = useState<boolean>(false);
  const [isGettingTrip, setIsGettingTrip] = useState<boolean>(true);

  const handleNextStepForm = () => {
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
      return setStepForm(STEP_FORM.ADD_EMAIL);
    }

    Alert.alert("Nova viagem", "Confirmar viagem?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: createTrip },
    ]);
  };

  const handleSelectDate = (selectedDay: DateData) => {
    const dates = orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemove)
    );
  };

  const handleAddEmail = () => {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido!");
    }

    const emailAlreadyExists = emailsToInvite.find((e) => e === emailToInvite);

    if (emailAlreadyExists) {
      return Alert.alert("Convidado", "E-mail já adicionado!");
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
    setEmailToInvite("");
  };

  const saveTrip = async (tripId: string) => {
    try {
      await tripStorage.save(tripId);
      router.navigate(`trip/${tripId}`);
    } catch (err) {
      Alert.alert(
        "Salvar viagem",
        "Não foi possível salvar o id da viagem no dispositivo!"
      );

      console.log(err);
    }
  };

  const createTrip = async () => {
    try {
      setIsCreatingTrip(true);

      const newTrip = await tripServer.create({
        destination,
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite,
      });

      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        {
          text: "OK. Continuar.",
          onPress: () => saveTrip(newTrip.tripId),
        },
      ]);
    } catch (err) {
      console.log(err);
      setIsCreatingTrip(false);
    }
  };

  const getTrip = async () => {
    try {
      const tripId = await tripStorage.get();

      if (!tripId) {
        return setIsGettingTrip(false);
      }

      const trip = await tripServer.getById(tripId);

      if (trip) {
        console.log(trip);
        return router.navigate(`/trip/${trip.id}`);
      }
    } catch (err) {
      setIsCreatingTrip(false);
      console.log(err);
    }
  };

  useEffect(() => {
    getTrip();
  }, []);

  if (isGettingTrip) {
    return <Loading />;
  }

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
                autoCorrect={false}
                value={
                  emailsToInvite.length > 0
                    ? `${emailsToInvite.length} pessoa(s) convidada(s)`
                    : ""
                }
                onPress={() => {
                  Keyboard.dismiss();
                  setShowModal(MODAL.GUESTS);
                }}
                showSoftInputOnFocus={false}
              ></Input.Field>
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
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

      <Modal
        title={t(keys.SELECT_GUESTS)}
        subtitle={t(keys.GUESTS_INFO)}
        visible={showModal === MODAL.GUESTS}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((e) => (
              <GuestEmail
                key={e}
                email={e}
                onRemove={() => handleRemoveEmail(e)}
              />
            ))
          ) : (
            <Text className="text-zinc-600 text-base font-regular">
              Nenhum e-mail adicionado.
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder={t(keys.TYPE_GUEST_EMAIL)}
              keyboardType="email-address"
              onChangeText={(text) => setEmailToInvite(text.toLowerCase())}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>

          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
