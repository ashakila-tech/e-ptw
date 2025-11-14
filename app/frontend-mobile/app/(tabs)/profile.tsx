import { useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";

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
    <ScrollView className="flex-1 bg-secondary px-6 py-10">
      {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}

      {profile && (
        <>
          {/* HEADER */}
          <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <Text className="text-4xl text-center font-bold text-primary mb-4">
              {profile.name}
            </Text>

            <View className="bg-primary mx-4 px-4 py-1 rounded-full mb-2">
              <Text className="text-white text-center font-bold text-lg">
                {profile.groups?.[0]?.name ?? "-"}
              </Text>
            </View>

            <View className="mb-10"></View>

            {/* Id */}
            <View className="mb-2">
              <Text className="text-primary mb-1">ID:
                <Text className="font-bold">{" " + profile.id}</Text>
              </Text>
            </View>

            {/* Email */}
            <View className="mb-2">
              <Text className="text-primary mb-1">Email Address:
                <Text className="font-bold">{" " + profile.email}</Text>
              </Text>
            </View>

            {/* Company */}
            <View className="mb-2">
              <Text className="text-primary mb-1">Company:
                <Text className="font-bold">
                  {" " + (profile.company_name?.name ?? "-")}
                </Text>
              </Text>
            </View>
          </View>
          
          {/* Locations (GREEN version like permit types) */}
          {profile.locations && profile.locations.length > 0 && (
            <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <View className="mb-4">
                <Text className="text-primary mb-2">
                  Responsible for
                  <Text className="font-bold">
                    {" " + profile.locations.length} location(s)
                  </Text>
                </Text>
                {profile.locations.map((loc: any, index: number) => (
                  <View
                    key={loc.id}
                    className="px-3 py-1 inline-flex"
                  >
                    <Text className="text-primary font-semibold">
                      {index + 1}. {loc.location_name ?? `Location ID: ${loc.location_id}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Permit Types */}
          {profile.permit_types && profile.permit_types.length > 0 && (
            <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <View className="mb-4">
                <Text className="text-primary mb-2">
                  Responsible for
                  <Text className="font-bold">
                    {" " + profile.permit_types.length} permit(s)
                  </Text>
                </Text>
                {profile.permit_types.map((pt: any, index: number) => (
                  <View
                    key={pt.id}
                    className="px-3 py-1 inline-flex"
                  >
                    <Text className="text-primary font-semibold">
                      {index + 1}. {pt.permit_type_name ?? `Permit Type ID: ${pt.permit_type_id}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* SIGN OUT BUTTON */}
      <Pressable
        onPress={handleSignOut}
        className="bg-rejected px-6 py-4 rounded flex-row justify-center items-center my-10"
      >
        <Ionicons name="exit-outline" size={18} color="white" />
        <Text className="text-white font-semibold text-lg ml-2">
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}