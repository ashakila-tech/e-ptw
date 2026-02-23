import React, { useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePermitTab } from "@/hooks/usePermitTab";
import { useUser } from "@/contexts/UserContext";
import PermitCard from "@/components/PermitCard";
import LoadingScreen from "@/components/LoadingScreen";
import { PermitStatus } from "@/constants/Status";

export default function MyPermitTab() {
  const router = useRouter();
  const { isApproval, isSecurity } = useUser();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSearch = () => {
    setSearchQuery(search);
  };

  const { permits, loading, refetch, loadMore, hasMore, isFetchingMore } = usePermitTab(searchQuery);

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
    // { key: PermitStatus.DRAFT, label: "Draft" },
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
    { key: PermitStatus.EXIT_PENDING, label: "Exit Pending" },
  ];

  // Select which tab list to show based on role
  const tabs = isSecurity
    ? securityTabs
    : isApproval
    ? approverTabs
    : applicantTabs;

  // Filter + sort (Search is now handled by backend via usePermitTab)
  const filteredPermits = useMemo(() => {
    let list = permits;

    if (activeTab !== "all") {
      if (isApproval) {
        list = list.filter((p) => p.approvalStatus === activeTab);
      } else {
        list = list.filter((p) => p.status === activeTab);
      }
    }

    if (sortOrder === "desc") list = [...list].reverse();

    // console.log(list[0]);
    return list;
  }, [permits, activeTab, sortOrder]); // Removed 'search' dependency

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
        <View className="flex-1 flex-row mr-2">
          <TextInput
            placeholder="Search permits..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 bg-secondary p-2 rounded-l-lg text-primary"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} className="bg-primary px-3 justify-center rounded-r-lg">
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
      <FlatList
        data={filteredPermits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-4">
            <PermitCard
              {...item}
              status={isApproval ? item.approvalStatus : item.status}
              isApproval={isApproval}
              onEdit={() =>
                router.push({
                  pathname: "/permits/form",
                  params: { application: JSON.stringify(item) },
                })
              }
              onDeleted={refetch}
            />
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-primary text-base">
              {isApproval ? "No approvals found" : "No permits found"}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="py-4 items-center">
            {hasMore && (
              <TouchableOpacity
                onPress={loadMore}
                disabled={isFetchingMore}
                className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
              >
                {isFetchingMore && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
                <Text className="text-white font-semibold">
                  {isFetchingMore ? "Loading..." : "Load More"}
                </Text>
              </TouchableOpacity>
            )}
            {!hasMore && filteredPermits.length > 0 && (
              <Text className="text-gray-500 mt-2">No more permits</Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}