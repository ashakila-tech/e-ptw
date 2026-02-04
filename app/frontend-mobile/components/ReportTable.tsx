import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";

interface ReportTableProps {
  reports: any[];
}

const ReportTable: React.FC<ReportTableProps> = ({ reports }) => {
  const router = useRouter();
  return (
    <ScrollView horizontal>
      <View>
        {/* Table Header */}
        <View className="flex-row bg-gray-50 border-b border-gray-200">
          <Text className="p-3 w-16 font-semibold text-primary">ID</Text>
          <Text className="p-3 w-40 font-semibold text-primary">Name</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Condition</Text>
          <Text className="p-3 w-32 font-semibold text-primary">Concern</Text>
          <Text className="p-3 w-32 font-semibold text-primary text-center">Actions</Text>
        </View>

        {/* Table Body */}
        {reports.map((report: any) => (
          <View key={report.id} className="flex-row border-b border-gray-200 items-center">
            <Text className="p-3 w-16 text-primary">{report.id}</Text>
            <Text className="p-3 w-40 text-primary">{report.name}</Text>
            <Text className="p-3 w-32 text-primary capitalize">{report.condition || "-"}</Text>
            <Text className="p-3 w-32 text-primary capitalize">{report.concern || "-"}</Text>
            <View className="p-3 w-32 flex-row justify-center">
              <Pressable
                onPress={() => router.push(`/reports/${report.id}`)}
                className="bg-gray-400 px-3 py-1 rounded-md"
              >
                <Text className="text-white font-bold">Details</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ReportTable;