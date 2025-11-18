import React, { useCallback, useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView, Alert, RefreshControl, TextInput } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";
import * as api from "@/services/api";

export default function ProfileTab() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, loading, error, workers, refresh: refreshProfile } = useProfile();
    
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Memoized list for searching and sorting workers
  const sortedAndFilteredWorkers = useMemo(() => {
    let list = [...workers];

    // Sort alphabetically by name
    list.sort((a, b) => a.name.localeCompare(b.name));

    // Filter by search term (name, ic/passport, position)
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(worker => (worker.name || '').toLowerCase().includes(term) || (worker.ic_passport || '').toLowerCase().includes(term) || (worker.position || '').toLowerCase().includes(term));
    }

    return list;
  }, [workers, search]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, [refreshProfile]);

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  const handleDeleteWorker = (worker: any) => {
    Alert.alert("Delete Worker", `Are you sure you want to delete ${worker.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.deleteWorker(worker.id);
            Alert.alert("Success", "Worker has been deleted.");
            refreshProfile();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete worker.");
          }
        } 
      },
    ]);
  };

  if (loading || refreshing) {
    return <LoadingScreen message={refreshing ? "Refreshing data..." : "Fetching profile data..."} />;
  }

  return (
    <ScrollView 
      className="flex-1 bg-secondary px-6 py-10"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

          {/* Workers Table */}
          {profile && (
            <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-primary text-lg font-bold">Workers</Text>
                <Pressable onPress={() => router.push("/workers/form")} className="bg-primary px-3 py-1 rounded-lg">
                  <Text className="text-white font-bold">+ Add Worker</Text>
                </Pressable>
              </View>

              {/* Search Bar */}
              <View className="mb-4">
                <TextInput
                  placeholder="Search by name, IC, or position..."
                  value={search}
                  onChangeText={setSearch}
                  className="bg-secondary p-3 rounded-lg text-primary"
                />
              </View>

              {sortedAndFilteredWorkers.length > 0 ? (
                <ScrollView horizontal>
                  <View>
                    {/* Table Header */}
                    <View className="flex-row bg-gray-50 border-b border-gray-200">
                      <Text className="p-3 w-16 font-semibold text-primary">#</Text>
                      <Text className="p-3 w-40 font-semibold text-primary">Name</Text>
                      <Text className="p-3 w-40 font-semibold text-primary">IC/Passport</Text>
                      <Text className="p-3 w-32 font-semibold text-primary">Contact</Text>
                      <Text className="p-3 w-40 font-semibold text-primary">Position</Text>
                      <Text className="p-3 w-32 font-semibold text-primary">Status</Text>
                      <Text className="p-3 w-32 font-semibold text-primary">Type</Text>
                      <Text className="p-3 w-48 font-semibold text-primary text-center">Actions</Text>
                    </View>

                    {/* Table Body */}
                    {sortedAndFilteredWorkers.map((worker: any, index: number) => (
                      <View key={worker.id} className="flex-row border-b border-gray-200 items-center">
                        <Text className="p-3 w-16 text-primary">{index + 1}</Text>
                        <Text className="p-3 w-40 text-primary">{worker.name}</Text>
                        <Text className="p-3 w-40 text-primary">{worker.ic_passport}</Text>
                        <Text className="p-3 w-32 text-primary">{worker.contact}</Text>
                        <Text className="p-3 w-40 text-primary">{worker.position}</Text>
                        <Text className="p-3 w-32 text-primary capitalize">{worker.employment_status?.replace("-", " ")}</Text>
                        <Text className="p-3 w-32 text-primary capitalize">{worker.employment_type?.replace("-", " ")}</Text>
                        <View className="p-3 w-48 flex-row justify-center space-x-2">
                          <Pressable
                            onPress={() => router.push({ pathname: "/workers/form", params: { worker: JSON.stringify(worker) }})}
                            className="bg-pending px-3 py-1 mx-1 rounded-md"
                          >
                            <Text className="text-primary font-bold">Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteWorker(worker)}
                            className="bg-rejected px-3 py-1 mx-1 rounded-md"
                          >
                            <Text className="text-white font-bold">Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text className="text-primary text-center mt-4">No worker added</Text>
              )}
            </View>
          )}


        </>
      )}

      {/* SIGN OUT BUTTON */}
      <Pressable
        onPress={handleSignOut}
        className="bg-rejected px-6 py-4 rounded flex-row justify-center items-center mb-10"
      >
        <Ionicons name="exit-outline" size={18} color="white" />
        <Text className="text-white font-semibold text-lg ml-2">
          Sign Out
        </Text>
      </Pressable>
      <View className="py-5"></View>
    </ScrollView>
  );
}