import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";

export default function Landing() {
  const router = useRouter();
  const { setUserId, setIsApproval } = useUser();

  const handleSignInContractor = () => {
    // Hardcode sign-in user id
    setUserId(4);
    setIsApproval(false);
    router.replace("/home"); // go to home after "sign in"
  };

  const handleSignInApprover = () => {
    // Hardcode sign-in user id
    setUserId(5);
    setIsApproval(true);
    router.replace("/home"); // go to home after "sign in"
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold mb-6">Welcome to Permit App</Text>
      <Pressable
        className="bg-primary px-6 py-3 m-1 rounded-xl"
        onPress={handleSignInContractor}
      >
        <Text className="text-white font-semibold text-lg">Contractor</Text>
      </Pressable>
      <Pressable
        className="bg-primary px-6 py-3 m-1 rounded-xl"
        onPress={handleSignInApprover}
      >
        <Text className="text-white font-semibold text-lg">Approver</Text>
      </Pressable>
    </View>
  );
}