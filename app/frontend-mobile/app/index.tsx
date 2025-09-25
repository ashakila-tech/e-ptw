import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function Landing() {
  const router = useRouter();
  const { setUserId } = useUser();

  const handleSignIn = () => {
    // Hardcode sign-in as user id 1
    setUserId(1);
    router.replace("/home"); // go to home after "sign in"
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold mb-6">Welcome to Permit App</Text>
      <Pressable
        className="bg-primary px-6 py-3 rounded-xl"
        onPress={handleSignIn}
      >
        <Text className="text-white font-semibold text-lg">Sign In</Text>
      </Pressable>
    </View>
  );
}