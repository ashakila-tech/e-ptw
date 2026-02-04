import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView, RefreshControl, TextInput } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";
import WorkerTable from "@/components/WorkerTable";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/contexts/UserContext";
import FeedbackTable from "@/components/FeedbackTable";
import ReportTable from "@/components/ReportTable";
import { fetchFeedbacks, fetchAllApplications } from "../../../shared/services/api";

export default function ProfileTab() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isApproval, isSecurity, userId } = useUser();
  const { profile, loading, error, workers, reports, refresh: refreshProfile, removeWorker } = useProfile();
    
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    fetchFeedbacks(userId ?? undefined)
      .then(setFeedbacks)
      .catch((err) => console.error("Failed to fetch feedbacks", err));

    if (isApproval && profile) {
      fetchAllApplications()
        .then((apps) => {
          if (Array.isArray(apps)) {
            let pending = 0;
            let waiting = 0;

            apps.forEach((app: any) => {
              const approvalData = app.approval_data || [];
              const userApprovals = approvalData.filter((ad: any) => {
                const isUser = ad.approver_name === profile.name;
                const isGroup = profile.groups?.some((g: any) => g.name === ad.role_name);
                return isUser || isGroup;
              });

              userApprovals.forEach((ad: any) => {
                if (ad.status === "PENDING") pending++;
                if (ad.status === "WAITING") waiting++;
              });
            });

            setPendingCount(pending);
            setWaitingCount(waiting);
          }
        })
        .catch((err) => console.error("Failed to fetch applications stats", err));
    }
  }, [isApproval, profile, userId]);

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

  useEffect(() => {
    console.log("Reports in profile", reports);
  },[reports]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises: Promise<any>[] = [
      refreshProfile(),
      fetchFeedbacks(userId ?? undefined).then(setFeedbacks).catch(console.error)
    ];

    if (isApproval && profile) {
      promises.push(
        fetchAllApplications().then((apps) => {
          if (Array.isArray(apps)) {
            let pending = 0;
            let waiting = 0;

            apps.forEach((app: any) => {
              const approvalData = app.approval_data || [];
              const userApprovals = approvalData.filter((ad: any) => {
                const isUser = ad.approver_name === profile.name;
                const isGroup = profile.groups?.some((g: any) => g.name === ad.role_name);
                return isUser || isGroup;
              });

              userApprovals.forEach((ad: any) => {
                if (ad.status === "PENDING") pending++;
                if (ad.status === "WAITING") waiting++;
              });
            });

            setPendingCount(pending);
            setWaitingCount(waiting);
          }
        }).catch(console.error)
      );
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [refreshProfile, isApproval, profile, userId]);

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  const handleDeleteWorker = (worker: any) => {
    crossPlatformAlert("Delete Worker", `Are you sure you want to delete ${worker.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await removeWorker(worker.id);
            crossPlatformAlert("Success", "Worker has been deleted.");
            refreshProfile();
          } catch (err: any) {
            crossPlatformAlert("Error", err.message || "Failed to delete worker.");
          }
        } 
      },
    ]);
  };

  if (loading || refreshing) {
    return <LoadingScreen message={refreshing ? "Refreshing data..." : "Fetching profile data..."} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <ScrollView 
        className=""
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error && <Text className="text-red-400 text-center mb-4">{error}</Text>}

        {profile && (
          <>
            {/* HEADER */}
            <View className="bg-white rounded-xl p-6 shadow mb-6">
              <Text className="text-4xl text-center font-bold text-primary mb-4">
                {profile.name}
              </Text>

              <View className="bg-primary mx-4 px-6 py-1 rounded-full mb-2" style={{ alignSelf: "center" }}>
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
                    {" " + profile.company_name}
                  </Text>
                </Text>
              </View>
            </View>
            
            {/* Locations (GREEN version like permit types) */}
            {profile.locations && profile.locations.length > 0 && (
              <View className="bg-white rounded-xl p-6 shadow mb-6">
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
            {/* Only shows worker table for contractor (not approver nor security) */}
            {profile && !isApproval && !isSecurity && (
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
                  <WorkerTable workers={sortedAndFilteredWorkers} handleDeleteWorker={handleDeleteWorker} isEditable={true} />
                ) : (                
                  <Text className="text-primary text-center mt-4">No worker added</Text>                
                )}
              </View>
            )}

            {/* Approver Stats */}
            {isApproval && (
              <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <Text className="text-primary text-lg font-bold mb-4">Permit Status Overview</Text>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-pending">{pendingCount}</Text>
                    <Text className="text-gray-500 font-medium">PENDING</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-waiting">{waitingCount}</Text>
                    <Text className="text-gray-500 font-medium">WAITING</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Feedbacks Table */}
            <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <Text className="text-primary text-lg font-bold mb-4">My Feedbacks</Text>
              {feedbacks.length > 0 ? (
                <FeedbackTable feedbacks={feedbacks} />
              ) : (
                <Text className="text-primary text-center mt-4">No feedback submitted</Text>
              )}
            </View>

            {/* Reports Table */}
            <View className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <Text className="text-primary text-lg font-bold mb-4">My Near Miss Reports</Text>
              {reports && reports.length > 0 ? (
                <ReportTable reports={reports} />
              ) : (
                <Text className="text-primary text-center mt-4">No reports submitted</Text>
              )}
            </View>

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
    </SafeAreaView>
  );
}