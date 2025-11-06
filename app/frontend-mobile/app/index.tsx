import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");

        if (token) {
          // Optional: verify token validity with backend
          const response = await fetch("http://<YOUR_BACKEND_URL>/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            // Token is valid, go to home
            router.replace("/home");
          } else {
            // Invalid or expired token, go to login
            await AsyncStorage.removeItem("access_token");
            router.replace("/login");
          }
        } else {
          // No token found
          router.replace("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-4 text-gray-700 text-lg font-medium">
        Loading Permit App...
      </Text>
    </View>
  );
}


// import { View, Text, Pressable } from "react-native";
// import { useRouter } from "expo-router";
// import { useUser } from "@/contexts/UserContext";

// export default function Landing() {
//   const router = useRouter();
//   const { setUserId, setIsApproval } = useUser();

//   const handleSignInContractor = () => {
//     // Hardcode sign-in user id
//     setUserId(4);
//     setIsApproval(false);
//     router.replace("/home"); // go to home after "sign in"
//   };

//   const handleSignInApprover = () => {
//     // Hardcode sign-in user id
//     setUserId(7);
//     setIsApproval(true);
//     router.replace("/home"); // go to home after "sign in"
//   };

//   return (
//     <View className="flex-1 justify-center items-center bg-white">
//       <Text className="text-2xl font-bold mb-6">Welcome to Permit App</Text>
//       <Pressable
//         className="bg-primary px-6 py-3 m-1 rounded-xl"
//         onPress={handleSignInContractor}
//       >
//         <Text className="text-white font-semibold text-lg">Contractor</Text>
//       </Pressable>
//       <Pressable
//         className="bg-primary px-6 py-3 m-1 rounded-xl"
//         onPress={handleSignInApprover}
//       >
//         <Text className="text-white font-semibold text-lg">Approver</Text>
//       </Pressable>
//     </View>
//   );
// }