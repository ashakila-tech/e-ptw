import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold mb-8 text-primary">
        Permit App Login
      </Text>

      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        className={`w-full py-3 rounded-xl mb-4 ${
          loading ? "bg-gray-400" : "bg-primary"
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/register")}>
        <Text className="text-primary text-base">
          Don’t have an account? Register
        </Text>
      </Pressable>
    </View>
  );
}