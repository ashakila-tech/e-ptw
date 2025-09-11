import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold mb-4">Home</Text>

      {/* Option 1: Link */}
      <Link href="/permits/form" asChild>
        <Pressable className="bg-black px-6 py-3 rounded-2xl">
          <Text className="text-white font-semibold">Apply Permit</Text>
        </Pressable>
      </Link>

      {/* Option 2: useRouter.push */}
      {/* 
      <Pressable
        className="bg-blue-600 px-6 py-3 rounded-2xl"
        onPress={() => router.push("/application-form")}
      >
        <Text className="text-white font-semibold">New Application</Text>
      </Pressable>
      */}
    </View>
  );
}
