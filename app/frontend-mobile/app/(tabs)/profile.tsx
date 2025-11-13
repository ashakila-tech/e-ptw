import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileTab() {
  const router = useRouter();
  const { setUserId, setIsApproval } = useUser();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.replace("/"); // navigate back to landing page
  };

  return (
    <View className="flex-1 justify-center items-center bg-secondary">
      <Pressable
        onPress={handleSignOut}
        className="bg-bg1 px-6 py-3 rounded"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </Pressable>
    </View>
  );
}