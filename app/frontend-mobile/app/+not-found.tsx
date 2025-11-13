import { Stack } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />

      <View
        className="flex-1 justify-center items-center px-6 bg-white"
        style={{ paddingTop: 40 }}
      >
        <Text className="text-3xl font-bold text-primary mb-4 text-center">
          This screen does not exist.
        </Text>

        <Pressable
          onPress={() => router.replace("/")}
          className="bg-bg1 px-6 py-3 rounded mt-4"
        >
          <AntDesign name="home" size={40} color="white"></AntDesign>
        </Pressable>
      </View>
    </>
  );
}