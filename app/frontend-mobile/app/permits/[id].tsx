import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { API_BASE_URL } from "@env";
import dayjs from "dayjs";

export default function PermitDetails() {
  const { id } = useLocalSearchParams();
  const [permit, setPermit] = useState<PermitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermit() {
      try {
        const res = await fetch(`${API_BASE_URL}api/applications/${id}`);
        const permitData = await res.json();

        // Fetch related entities
        const [docRes, locRes, typeRes, workflowRes] = await Promise.all([
          fetch(`${API_BASE_URL}api/documents/${permitData.document_id}`),
          fetch(`${API_BASE_URL}api/locations/${permitData.location_id}`),
          fetch(`${API_BASE_URL}api/permit-types/${permitData.permit_type_id}`),
          fetch(`${API_BASE_URL}api/workflow-data/${permitData.workflow_data_id}`),
        ]);

        const [document, location, permitType, workflowData] = await Promise.all([
          docRes.json(),
          locRes.json(),
          typeRes.json(),
          workflowRes.json(),
        ]);

        setPermit({
          ...permitData,
          document: document.name || document.title || "",
          location: location.name || location.title || "",
          permitType: permitType.name || permitType.title || "",
          workflowData: workflowData.status || "",
          createdTime: permitData.created_time,
          workStartTime: permitData.work_start_time,
        });
      } catch (error) {
        console.error("Error fetching permit details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPermit();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  if (!permit) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No permit found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Stack.Screen
        options={{
          title: permit?.name || `Permit #${id}`,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      />

      <Text className="text-gray-700 mb-2">Status: {permit.status}</Text>
      <Text className="text-gray-700 mb-2">Permit Type: {permit.permitType}</Text>
      <Text className="text-gray-700 mb-2">Location: {permit.location}</Text>
      <Text className="text-gray-700 mb-2">Document: {permit.document}</Text>
      <Text className="text-gray-700 mb-2">Workflow: {permit.workflowData}</Text>
      <Text className="text-gray-700 mb-2">
        Created: {permit.createdTime ? dayjs(permit.createdTime).format("DD-MM-YYYY HH:mm") : "-"}
      </Text>
      <Text className="text-gray-700 mb-2">
        Work Start: {permit.workStartTime ? dayjs(permit.workStartTime).format("DD-MM-YYYY HH:mm") : "-"}
      </Text>
    </ScrollView>
  );
}
