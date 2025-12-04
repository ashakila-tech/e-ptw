import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react-native"; // For clean eye icons
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(text) ? "" : "Please insert a proper email address");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      crossPlatformAlert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      crossPlatformAlert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold mb-8 text-primary text-center">
        Enter Your Credentials
      </Text>

      {/* Email Field */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <Text className="text-primary font-semibold">Email address</Text>
        {emailError ? <Text className="text-red-500 text-sm">{emailError}</Text> : null}
      </View>
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Field with Toggle */}
      <Text className="text-primary font-semibold px-4 py-3">Password</Text>
      <View className="w-full relative mb-6">
        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base pr-12"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-3"
        >
          {showPassword ? (
            <EyeOff size={22} {...{ color: "#6b7280" }} />
          ) : (
            <Eye size={22} {...{ color: "#6b7280" }} />
          )}
        </Pressable>
      </View>

      {/* Login Button */}
      <Pressable
        className={`w-full py-3 rounded mb-4 ${
          loading ? "bg-gray-400" : "bg-bg1"
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      {/* Register Link */}
      <Pressable onPress={() => router.push("/register")}>
        <Text className="text-primary text-center text-base">
          Don't have an account? <Text className="font-bold">Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}