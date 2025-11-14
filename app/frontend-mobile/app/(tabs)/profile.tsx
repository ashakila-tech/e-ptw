import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProfileTab() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, loading, error } = useProfile();

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) {
    return <LoadingScreen message="Fetching profile data..." />;
  }

  return (
    <View className="flex-1 bg-secondary px-6 py-10">
      {/* Header */}
      <Text className="text-white text-3xl font-bold mb-6">Profile</Text>

      {/* Error */}
      {!loading && error && (
        <Text className="text-red-400 text-center">{error}</Text>
      )}

      {/* Profile Info */}
      {!loading && profile && (
        <View className="bg-bg1 p-5 rounded-xl mb-10">
          <Text className="text-white text-lg font-semibold">
            {profile.name}
          </Text>
          <Text className="text-gray-300 mt-1">
            {profile.email}
          </Text>
          <Text className="text-gray-300 mt-1">
            {profile.id}
          </Text>
          <Text className="text-gray-300 mt-1">
            {profile.groups[0].name}
          </Text>

          {profile.company && (
            <Text className="text-gray-400 mt-3">
              Company: {profile.company.name}
            </Text>
          )}

          <Text className="text-gray-400 mt-1">
            Role: {profile.user_type}
          </Text>
        </View>
      )}

      {/* Sign Out */}
      <Pressable
        onPress={handleSignOut}
        className="bg-rejected px-6 py-3 rounded-xl items-center mt-auto mb-10"
      >
        <Text className="text-white font-semibold text-lg">Sign Out</Text>
      </Pressable>
    </View>
  );
}