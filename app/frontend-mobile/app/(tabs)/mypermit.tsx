import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { usePermitTab } from "@/hooks/usePermitTab";
import { useUser } from "@/contexts/UserContext";
import PermitCard from "@/components/PermitCard";
import LoadingScreen from "@/components/LoadingScreen";
import { PermitStatus } from "@/constants/Status";

export default function MyPermitTab() {
  const router = useRouter();
  const { isApproval } = useUser();
  const { permits, loading, refetch } = usePermitTab();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Auto-refresh whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Tabs for applicant vs approver
  const applicantTabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.SUBMITTED, label: "Submitted" },
    { key: PermitStatus.DRAFT, label: "Draft" },
  ];

  const approverTabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.PENDING, label: "Pending" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.REJECTED, label: "Rejected" },
  ];

  // Filter permits based on selected tab
  const filteredPermits = permits.filter((p) => {
    if (activeTab === "all") return true;
    if (isApproval) {
      // Approver filters by their approval status
      return p.approvalStatus === activeTab;
    } else {
      // Applicant filters by permit status
      return p.status === activeTab;
    }
  });

  // Show loading screen while fetching data
  if (loading) {
    return <LoadingScreen message="Fetching permits..." />;
  }

  return (
    <View className="flex-1 bg-secondary">
      {/* Tabs */}
      <View className="flex-row justify-around p-2 bg-secondary">
        {(isApproval ? approverTabs : applicantTabs).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 mx-1 px-4 py-2 rounded-lg ${
                isActive ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-center ${
                  isActive ? "text-white" : "text-primary"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Permit List */}
      {filteredPermits.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-primary text-base">
            {isApproval ? "No approvals found" : "No permits found"}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredPermits.map((permit) => (
            <PermitCard
              key={permit.id}
              {...permit}
              onEdit={() =>
                router.push({
                  pathname: "/permits/form",
                  params: { application: JSON.stringify(permit) },
                })
              }
              onDeleted={refetch}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}