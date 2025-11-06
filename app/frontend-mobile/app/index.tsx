import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-center text-5xl font-bold text-primary mb-10">
        Senior Aerospace Upeca Aerotech
      </Text>

      <Pressable
        onPress={() => router.push("/login")}
        className="bg-primary w-full py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Sign in
        </Text>
      </Pressable>
    </View>
  );
}