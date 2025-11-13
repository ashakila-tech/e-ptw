import React, { useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
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

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Tabs for applicant vs approver
  const applicantTabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.COMPLETED, label: "Completed" },
    { key: PermitStatus.ACTIVE, label: "Active" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.REJECTED, label: "Rejected" },
    { key: PermitStatus.SUBMITTED, label: "Submitted" },
    { key: PermitStatus.DRAFT, label: "Draft" },
  ];

  const approverTabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.WAITING, label: "Waiting" },
    { key: PermitStatus.PENDING, label: "Pending" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.REJECTED, label: "Rejected" },
  ];

  const securityTabs = [
    { key: "all", label: "All" },
    { key: PermitStatus.APPROVED, label: "Approved" },
    { key: PermitStatus.ACTIVE, label: "Active" },
    { key: PermitStatus.COMPLETED, label: "Completed" },
  ];

  // Select which tab list to show based on role
  const tabs = isSecurity
    ? securityTabs
    : isApproval
    ? approverTabs
    : applicantTabs;

  // Filter + search + sort
  const filteredPermits = useMemo(() => {
    let list = permits;

    if (activeTab !== "all") {
      if (isApproval) {
        list = list.filter((p) => p.approvalStatus === activeTab);
      } else {
        list = list.filter((p) => p.status === activeTab);
      }
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(term));
    }

    if (sortOrder === "desc") list = [...list].reverse();

    return list;
  }, [permits, activeTab, search, sortOrder]);

  if (loading) {
    return <LoadingScreen message="Fetching permits..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      {/* Tabs */}
      <View className="bg-bg1 pt-3 pb-2 justify-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 4 }}
          className="py-2"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="mx-1 px-3 items-center"
              >
                <Text
                  className={`text-center text-sm text-white ${
                    isActive ? "font-bold" : "font-normal"
                  }`}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="h-1 w-full bg-white mt-1 rounded-full" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Search + Sort Controls */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <TextInput
          placeholder="Search permits..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-secondary p-2 rounded-lg mr-2 text-primary"
        />
        <Pressable
          onPress={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="bg-accent1 px-3 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </Text>
        </Pressable>
      </View>

      {/* Scrollable Permit List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
      >
        {filteredPermits.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-primary text-base">
              {isApproval ? "No approvals found" : "No permits found"}
            </Text>
          </View>
        ) : (
          filteredPermits.map((permit) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}