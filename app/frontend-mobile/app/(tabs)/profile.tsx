import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function ProfileTab() {
  const router = useRouter();
  const { setUserId, setIsApproval } = useUser();

  const handleSignOut = () => {
    setUserId(null);
    setIsApproval(false);
    router.replace("/"); // navigate back to landing page
  };

  return (
    <View className="flex-1 justify-center items-center bg-secondary">
      <Pressable
        onPress={handleSignOut}
        className="bg-rejected px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </Pressable>
    </View>
  );
}