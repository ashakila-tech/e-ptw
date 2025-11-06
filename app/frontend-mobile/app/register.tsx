import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("contractor"); // or "approver"
  const [companyId] = useState(1); // example default company
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        company_id: companyId,
        name,
        email,
        user_type: userType,
        password,
      });

      Alert.alert("Success", "Account created successfully. Please log in.");
      router.replace("/login");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 py-8">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold mb-8 text-primary text-center">
          Create an Account
        </Text>

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Optionally let user pick role */}
        {/* You can replace this with a dropdown later */}
        <Pressable
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
          onPress={() =>
            setUserType(userType === "contractor" ? "approver" : "contractor")
          }
        >
          <Text className="text-base text-gray-700 text-center">
            Role: {userType === "contractor" ? "Contractor" : "Approver"} (tap to change)
          </Text>
        </Pressable>

        <Pressable
          className={`w-full py-3 rounded-xl mb-4 ${
            loading ? "bg-gray-400" : "bg-primary"
          }`}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Registering..." : "Register"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/login")}>
          <Text className="text-primary text-center text-base">
            Already have an account? Log in
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}