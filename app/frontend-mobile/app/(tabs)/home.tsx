import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const { userId, userName } = useUser();

  return (
    <View className="flex-1 justify-center items-center bg-secondary px-6">
      <Text className="text-center text-5xl font-bold text-primary mb-10">
        Senior Aerospace Upeca Aerotech
      </Text>

      <Text className="text-lg text-gray-700 mb-2">
        Name: {userName || "User"}
      </Text>

      <Text className="text-lg text-gray-700 mb-8">
        ID No: {userId}
      </Text>

      <Link href="/permits/form" asChild>
        <Pressable className="bg-primary w-full py-4 rounded-xl">
          <Text className="text-white text-center font-semibold text-lg">
            Apply Permit
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}