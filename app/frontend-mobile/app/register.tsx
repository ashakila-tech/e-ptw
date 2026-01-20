import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react-native";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import { fetchCompanies } from "../../shared/services/api";
import DropdownField from "@/components/DropdownField";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyItems, setCompanyItems] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        setCompanyItems(data.map((c: any) => ({ label: c.name, value: c.id })));
      })
      .catch((err) => console.error("Failed to fetch companies", err));
  }, []);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(text) ? "" : "Please insert a proper email address");
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);

    if (password && text !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !companyId) {
      crossPlatformAlert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      crossPlatformAlert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        company_id: companyId!,
        name,
        email,
        user_type: 1,
        password,
      });

      crossPlatformAlert("Success", "Account created successfully. Please log in.");
      router.replace("/login");
    } catch (err: any) {
      crossPlatformAlert("Registration failed", err.message || "Something went wrong.");
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

        {/* Company Dropdown */}
        <Text className="text-primary font-semibold px-4 py-3">Company</Text>
        <View className="px-4 mb-4 z-50">
          <DropdownField
            open={companyOpen}
            value={companyId}
            items={companyItems}
            setOpen={setCompanyOpen}
            setValue={setCompanyId}
            setItems={setCompanyItems}
            placeholder="Select Company"
            zIndex={3000}
          />
        </View>

        {/* Name */}
        <Text className="text-primary font-semibold px-4 py-3">Full name</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
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

        {/* Password Field */}
        <Text className="text-primary font-semibold px-4 py-3">Password</Text>
        <View className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 flex-row items-center">
          <TextInput
            className="flex-1 text-base py-0"
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);

              // Recheck confirm password in case user edits original password
              if (confirmPassword && text !== confirmPassword) {
                setConfirmPasswordError("Passwords do not match");
              } else {
                setConfirmPasswordError("");
              }
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={22} color="#6b7280" /> : <Eye size={22} color="#6b7280" />}
          </TouchableOpacity>
        </View>

        {/* Confirm Password Field */}
        <View className="mb-6 mt-2">
          <View className="flex-row justify-between items-center px-4 py-1">
            <Text className="text-primary font-semibold">Confirm Password</Text>
            {confirmPasswordError ? (
              <Text className="text-red-500 text-sm">{confirmPasswordError}</Text>
            ) : null}
          </View>

          <View className="w-full border border-gray-300 rounded-xl px-4 py-3 flex-row items-center">
            <TextInput
              className="flex-1 text-base py-0"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={22} color="#6b7280" /> : <Eye size={22} color="#6b7280" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <Pressable
          className={`w-full py-3 rounded mb-4 ${
            loading ? "bg-gray-400" : "bg-bg1"
          }`}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Registering..." : "Register"}
          </Text>
        </Pressable>

        {/* Go to Login */}
        <Pressable onPress={() => router.push("/login")}>
          <Text className="text-primary text-center text-base">
            Already have an account? <Text className="font-bold">Log in</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}