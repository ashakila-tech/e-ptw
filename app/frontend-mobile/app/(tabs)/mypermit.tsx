import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { usePermitTab } from "@/hooks/usePermitTab";
import { useUser } from "@/contexts/UserContext";
import PermitCard from "@/components/PermitCard";
import LoadingScreen from "@/components/LoadingScreen";
import { PermitStatus } from "@/constants/Status";

export default function MyPermitTab() {
  const router = useRouter();
  const { isApproval } = useUser();
  const { permits, loading } = usePermitTab();
  const [activeTab, setActiveTab] = useState("all");

  // Tab setup with global constants
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

  const filteredPermits = permits.filter((p) => {
    if (activeTab === "all") return true;

    if (isApproval) {
      // Approver filters by their approvalData.status
      return p.approvalStatus === activeTab;
    } else {
      // Applicant filters by application.status
      return p.status === activeTab;
    }
  });

  if (loading) return <LoadingScreen message="Fetching data..." />;

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

      {/* Permit list */}
      {filteredPermits.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-primary">
            {isApproval ? "No approvals found" : "No permits found"}
          </Text>
        </View>
      ) : (
        <ScrollView className="p-4">
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
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}