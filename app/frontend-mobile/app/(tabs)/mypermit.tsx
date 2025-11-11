import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { usePermitTab } from "@/hooks/usePermitTab";
import { useUser } from "@/contexts/UserContext";
import PermitCard from "@/components/PermitCard";
import LoadingScreen from "@/components/LoadingScreen";
import { PermitStatus } from "@/constants/Status";

export default function MyPermitTab() {
  const router = useRouter();
  const { isApproval, isSecurity } = useUser();
  const { permits, loading, refetch } = usePermitTab();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const tabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.ACTIVE, label: "Active" },
    { key: PermitStatus.COMPLETED, label: "Completed" },
  ];

  // Filter + search + sort
  const filteredPermits = useMemo(() => {
    let list: typeof permits = [];

    if (isSecurity) {
      // Security sees only APPROVED, ACTIVE, COMPLETED
      list = permits.filter(p =>
        ["APPROVED", "ACTIVE", "COMPLETED"].includes(p.status)
      );
    } else if (isApproval) {
      // Approvers see all
      list = permits;
    } else {
      // Applicants see all their own
      list = permits;
    }

    // Filter by active tab
    if (activeTab !== "all") {
      list = list.filter(p => p.status === activeTab);
    }

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(p => (p.name || "").toLowerCase().includes(term));
    }

    // Sort
    if (sortOrder === "desc") list = [...list].reverse();

    return list;
  }, [permits, activeTab, search, sortOrder, isApproval, isSecurity]);

  if (loading) {
    return <LoadingScreen message="Fetching permits..." />;
  }

  return (
    <View className="flex-1 bg-secondary">
      {/* Tabs */}
      <View className="flex-row justify-start p-2 bg-white flex-wrap-0">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`mx-1 px-4 py-2 rounded-lg ${isActive ? "bg-primary" : "bg-gray-300"}`}
              style={{ maxWidth: 100 }} // limit tab width
            >
              <Text
                className={`text-center ${isActive ? "text-white" : "text-primary"}`}
                numberOfLines={1} // prevent wrapping
                ellipsizeMode="tail" // show "..." if text is too long
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search + Sort Controls */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white">
        <TextInput
          placeholder="Search permits..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-gray-100 p-2 rounded-lg mr-2 text-primary"
        />
        <Pressable
          onPress={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="bg-primary px-3 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </Text>
        </Pressable>
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
          contentContainerStyle={{ padding: 16, gap: 16 }} // Use this padding otherwise ScrollView gets cut off
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredPermits.map((permit) => (
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
          ))}
        </ScrollView>
      )}
    </View>
  );
}