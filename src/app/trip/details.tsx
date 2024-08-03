import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";

export function Details({ tripId }: { tripId: string }) {
  const [showNewLinkModal, setShowNewLinkModal] = useState<boolean>(false);
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState<boolean>(false);

  const [linkName, setLinkName] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");

  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  const resetNewLinkFields = () => {
    setLinkName("");
    setLinkUrl("");
    setShowNewLinkModal(false);
  };

  const handleCreateLinkTrip = async () => {
    try {
      if (!linkName.trim()) {
        return Alert.alert("Link", "Informe um título para o link.");
      }

      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert("Link", "Link inválido");
      }

      setIsCreatingLinkTrip(true);

      await linksServer.create({ tripId, title: linkName, url: linkUrl });

      Alert.alert("Link", "Link criado com sucesso!");
      resetNewLinkFields();
      await getTripLinks();
    } catch (err) {
      console.log(err);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  };

  const getTripLinks = async () => {
    try {
      const links = await linksServer.getLinksByTripId(tripId);

      setLinks(links);
      console.log(links);
    } catch (err) {
      console.log(err);
    }
  };

  const getTripParticipants = async () => {
    try {
      const participants = await participantsServer.getByTripId(tripId);

      setParticipants(participants);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado.
          </Text>
        )}

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Adicionar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold mb-2 my-6">
          Convidados
        </Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Cadastrar novo link"
        subtitle="Todos os convidados podem visualizar os links importates."
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input>
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkName}
            ></Input.Field>
          </Input>

          <Input>
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkUrl}
            ></Input.Field>
          </Input>

          <Button isLoading={isCreatingLinkTrip} onPress={handleCreateLinkTrip}>
            <Button.Title>Salvar link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
