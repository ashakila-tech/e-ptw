import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { formatDate } from "@/utils/date";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import DatePickerField from "@/components/DatePickerField";
import { useReportList } from "@/hooks/useReportList";

export default function ReportList() {
  const router = useRouter();
  const {
    filteredReports,
    loading,
    refreshing,
    onRefresh,
    search,
    setSearch,
    showFilters,
    setShowFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filterCondition,
    setFilterCondition,
    filterConcern,
    setFilterConcern,
    conditions,
    concerns,
  } = useReportList();

  if (loading && !refreshing) return <LoadingScreen message="Loading reports..." />;

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-primary flex-1 mr-2">
          {item.name}
        </Text>
        <Text className="text-xs text-gray-500">
          {formatDate(item.incident_timestamp)}
        </Text>
      </View>

      <Text className="text-gray-600 mb-1">
        Location:{" "}
        <Text className="font-semibold">
          {item.location?.name || item.location_name || "Unknown"}
        </Text>
      </Text>
      <Text className="text-gray-600 mb-3" numberOfLines={2}>
        {item.description}
      </Text>

      <TouchableOpacity
        onPress={() => router.push(`/reports/${item.id}`)}
        className="bg-gray-100 py-2 rounded-lg items-center"
      >
        <Text className="text-primary font-semibold">View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <CustomHeader title="All Reports" onBack={() => router.back()} />
      
      {/* Search & Filter Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center space-x-2 mb-2">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search reports..."
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-primary"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className={`p-2 ml-4 rounded-lg ${showFilters ? "bg-primary" : "bg-gray-200"}`}
          >
            <Ionicons name="options" size={24} color={showFilters ? "white" : "#666"} />
          </Pressable>
        </View>

        {/* Collapsible Filters */}
        {showFilters && (
          <View className="mt-2">
            {/* Date Filter */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-500 mb-1">DATE RANGE</Text>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 mb-1">FROM</Text>
                  <DatePickerField
                    value={startDate}
                    onChange={(d) => setStartDate(d)}
                    mode="date"
                  />
                </View>
                <View className="w-2" />
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 mb-1">TO</Text>
                  <DatePickerField
                    value={endDate}
                    onChange={(d) => setEndDate(d)}
                    mode="date"
                  />
                </View>
                
                {(startDate || endDate) && (
                  <Pressable onPress={() => { setStartDate(null); setEndDate(null); }} className="ml-2 bg-gray-200 p-2 rounded self-end">
                    <Text className="text-xs">Clear</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Condition Filter */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-gray-500 mb-1">CONDITION</Text>
              <View className="flex-row flex-wrap">
                {conditions.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setFilterCondition(filterCondition === c ? null : c)}
                    className={`mr-2 mb-2 px-3 py-1 rounded-full border ${
                      filterCondition === c ? "bg-primary border-primary" : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={filterCondition === c ? "text-white" : "text-gray-700"}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Concern Filter */}
            <View className="mb-1">
              <Text className="text-xs font-bold text-gray-500 mb-1">CONCERN</Text>
              <View className="flex-row flex-wrap">
                {concerns.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setFilterConcern(filterConcern === c ? null : c)}
                    className={`mr-2 mb-2 px-3 py-1 rounded-full border ${
                      filterConcern === c ? "bg-primary border-primary" : "bg-white border-gray-300"
                    }`}
                  >
                    <Text className={filterConcern === c ? "text-white" : "text-gray-700"}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500">No reports found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}