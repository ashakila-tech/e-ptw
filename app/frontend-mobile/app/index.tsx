import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AppStrings } from "../../shared/constants/AppStrings";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            setIsAuthenticated(true);
            router.replace("/home");
            return;
          } else {
            await AsyncStorage.removeItem("access_token");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-700 text-lg font-medium">
          Loading App...
        </Text>
      </View>
    );
  }

return (
  <View className="flex-1 bg-white">
    {/* Top third */}
    <View className="flex-1" />

    {/* Middle third: title */}
    <View className="flex-1 justify-center items-center">
      <Text className="text-center text-5xl font-bold text-primary">
        {AppStrings.companyName}
      </Text>
    </View>

    {/* Bottom third: button container */}
    <View className="flex-1 bg-bg1 shadow-lg rounded-t-xl p-6 pt-12 justify-start">
      <Pressable
        onPress={() => router.push("/login")}
        className="bg-bg1 border border-white py-3 rounded w-full"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Sign in
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push("/register")}>
        <Text className="text-white text-center text-base mt-8">
          Don't have an account? <Text className="font-bold">Register</Text>
        </Text>
      </Pressable>
    </View>
  </View>
);

}