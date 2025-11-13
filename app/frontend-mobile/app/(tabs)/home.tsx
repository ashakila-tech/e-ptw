import React, { useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { usePermitTab } from "@/hooks/usePermitTab";
import PermitCard from "@/components/PermitCard";
import LoadingScreen from "@/components/LoadingScreen";
import { PermitStatus } from "@/constants/Status";
import { Entypo } from "@expo/vector-icons";

export default function Home() {
  const { userId, userName, isApproval } = useUser();
  const router = useRouter();
  const { permits, loading, refetch } = usePermitTab();

  const [refreshing, setRefreshing] = useState(false);

  // Filter for ACTIVE permits
  const activePermits = useMemo(
    () => permits.filter((p) => p.status === PermitStatus.ACTIVE),
    [permits]
  );

  // Pull-to-refresh handler (covers entire screen)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Show full-screen overlay while loading OR refreshing
  if (loading || refreshing) {
    return <LoadingScreen message="Refreshing data..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* --- Top Section --- */}
      <View className="bg-bg1 justify-center items-center px-6 py-10">
        <Text className="text-center text-4xl font-bold text-white mt-10 mb-2">
          Senior Aerospace{"\n"}Upeca Aerotech
        </Text>

        <Text className="text-center text-lg text-white">
          Name: {userName || "User"}
        </Text>

        <Text className="text-center text-lg text-white">
          ID No: {userId}
        </Text>
      </View>

        {/* --- Middle Section: Active Permits --- */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-lg font-semibold text-primary mb-3">
            Featured Permits
          </Text>

          {activePermits.length === 0 ? (
            <Text className="text-gray-500">No active permits found.</Text>
          ) : (
            activePermits.map((permit) => (
              <PermitCard
                key={permit.id}
                {...permit}
                isApproval={isApproval}
                onEdit={() =>
                  router.push({
                    pathname: "/permits/form",
                    params: { application: JSON.stringify(permit) },
                  })
                }
                onDeleted={refetch}
              />
            ))
          )}
        </View>

        {/* --- Bottom Section: Apply Button --- */}
        <View className="justify-center items-center px-6 py-6">
          <Link href="/permits/form" asChild>
            <Pressable className="bg-bg1 w-full py-4 rounded">
              <Text className="text-white text-center font-semibold text-lg">
                <Entypo name="squared-plus" size={18}></Entypo> {" "} Apply Permit
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}