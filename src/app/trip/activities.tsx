import dayjs from "dayjs";
import { Calendar as CalendarIcon, PlusIcon, Tag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, SectionList, Text, View } from "react-native";

import { Activity, ActivityProps } from "@/components/activity";
import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { activitiesServer } from "@/server/activities-server";
import { colors } from "@/styles/colors";
import { TripData } from "./[id]";

type Props = {
  tripDetails: TripData;
};

type Activities = {
  title: {
    dayNumber: number;
    dayName: string;
  };
  data: ActivityProps[];
};

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

export function Activities({ tripDetails }: Props) {
  const [showModal, setShowModal] = useState<MODAL>(MODAL.NONE);
  const [activityTitle, setActivityTitle] = useState<string>("");
  const [activityDate, setActivityDate] = useState<string>("");
  const [activityHour, setActivityHour] = useState<string>("");
  const [isCreatingActivity, setIsCreatingActivity] = useState<boolean>(false);
  const [isLoadingActivities, setIsLoadingActivities] =
    useState<boolean>(false);
  const [tripActivities, setTripActivities] = useState<Activities[]>([]);

  const handleCreateTripActivity = async () => {
    try {
      if (!activityTitle || !activityDate || !activityHour) {
        Alert.alert("Cadastrar atividade", "Preencha todos os campos!");
      }

      setIsCreatingActivity(true);

      await activitiesServer.create({
        tripId: tripDetails.id,
        occurs_at: dayjs(activityDate)
          .add(Number(activityHour), "h")
          .toString(),
        title: activityTitle,
      });

      Alert.alert("Nova atividade", "Nova atividade cadastrada com sucesso!");

      resetNewActivityForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingActivity(false);
    }
  };

  const resetNewActivityForm = () => {
    setActivityDate("");
    setActivityHour("");
    setActivityTitle("");
    setShowModal(MODAL.NONE);
  };

  const getTripActivities = async () => {
    try {
      const activities = await activitiesServer.getActivitiesByTripId(
        tripDetails.id
      );

      const activitiesToSectionList = activities.map((dayActivity) => ({
        title: {
          dayNumber: dayjs(dayActivity.date).date(),
          dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", ""),
        },
        data: dayActivity.activities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          hour: dayjs(activity.occurs_at).format("HH:mm[h]"),
          isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
        })),
      }));

      setTripActivities(activitiesToSectionList);
      console.log(tripActivities);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    getTripActivities();
  }, []);

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1">
          Atividades
        </Text>

        <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova Atividade</Button.Title>
        </Button>
      </View>

      <SectionList
        sections={tripActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Activity data={item} />}
        renderSectionHeader={({ section }) => (
          <View className="w-full">
            <Text className="text-zinc-50 text-2xl font-semibold py-2">
              Dia {section.title.dayNumber}{" "}
              <Text className="text-zinc-500 text-base font-regular capitalize">
                {section.title.dayName}
              </Text>
            </Text>

            {section.data.length === 0 && (
              <Text className="text-zinc-500 font-regular text-sm mb-8"></Text>
            )}
          </View>
        )}
      />

      <Modal
        visible={showModal === MODAL.NEW_ACTIVITY}
        title="Cadastrar Atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="mt-4 mb-3">
          <Input variant="secondary">
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Qual atividade?"
              onChangeText={setActivityTitle}
              value={activityTitle}
            />
          </Input>

          <View className="w-full mt-2 flex-row gap-2">
            <Input variant="secondary" className="flex-1">
              <Tag color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Data"
                onChangeText={setActivityTitle}
                value={
                  activityDate ? dayjs(activityDate).format("DD [de] MMMM") : ""
                }
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
              />
            </Input>

            <Input variant="secondary" className="flex-1">
              <CalendarIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Horário?"
                onChangeText={(text) =>
                  setActivityHour(text.replace(",", "").replace(".", ""))
                }
                value={activityHour}
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
        </View>

        <Button
          onPress={handleCreateTripActivity}
          isLoading={isCreatingActivity}
        >
          <Button.Title>Salvar atividade</Button.Title>
        </Button>
      </Modal>

      <Modal
        title="Selecionar data"
        subtitle="Selecione a data da atividade"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            onDayPress={(day) => setActivityDate(day.dateString)}
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={tripDetails.starts_at.toString()}
            minDate={tripDetails.starts_at.toString()}
            maxDate={tripDetails.ends_at.toString()}
          />

          <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
