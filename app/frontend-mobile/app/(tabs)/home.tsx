import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const { userId } = useUser();

  return (
    <View className="flex-1 items-center justify-center bg-secondary">
      <Text className="text-lg font-bold mb-6 text-primary">
        Logged in as User ID: {userId}
      </Text>

      <Link href="/permits/form" asChild>
        <Pressable className="bg-approved px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Apply Permit</Text>
        </Pressable>
      </Link>
    </View>
  );
}