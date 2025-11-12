import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const { userId, userName } = useUser();

  return (
    <View className="flex-1 bg-white">
      {/* Top section */}
      <View className="flex-1 bg-bg1 justify-center items-center px-6">
        <Text className="text-center text-4xl font-bold text-white mb-8">
          Senior Aerospace{"\n"}Upeca Aerotech
        </Text>

        <Text className="text-lg text-white mb-2">
          Name: {userName || "User"}
        </Text>

        <Text className="text-lg text-white mb-8">
          ID No: {userId}
        </Text>
      </View>

      {/* Bottom section */}
      <View className="flex-1 bg-white justify-center items-center px-6">
        <Link href="/permits/form" asChild>
          <Pressable className="bg-bg1 w-full py-4 rounded">
            <Text className="text-white text-center font-semibold text-lg">
              Apply Permit
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}