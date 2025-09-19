import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@env";
import PermitCard from "@/components/PermitCard";

export default function MyPermitTab() {
  const router = useRouter();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermits() {
      try {
        const res = await fetch(`${API_BASE_URL}api/applications/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch permits (${res.status})`);
        }
        const data: PermitAPI[] = await res.json();

        // Enrich permits with related data
        const enrichedPermits: PermitData[] = await Promise.all(
          data.map(async (p) => {
            try {
              const [docRes, locRes, typeRes, applicantRes] = await Promise.all([
                p.document_id
                  ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`)
                  : null,
                p.location_id
                  ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`)
                  : null,
                p.permit_type_id
                  ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`)
                  : null,
                p.applicant_id
                  ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`)
                  : null,
              ]);

              const document = docRes ? await docRes.json() : null;
              const location = locRes ? await locRes.json() : null;
              const permitType = typeRes ? await typeRes.json() : null;
              const applicant = applicantRes ? await applicantRes.json() : null;

              return {
                id: p.id,
                name: p.name,
                status: p.status,
                location: location?.name || "-",
                document: document?.name || "-",
                permitType: permitType?.name || "-",
                workflowData: undefined,
                createdBy: p.created_by || applicant?.name || "Unknown",
                createdTime: p.created_time,
                workStartTime: p.work_start_time || undefined,
                applicantId: p.applicant_id,
                documentId: p.document_id || undefined,
                locationId: p.location_id || undefined,
                permitTypeId: p.permit_type_id || undefined,
                workflowDataId: p.workflow_data_id || undefined,
              };
            } catch (err) {
              console.error(`Error enriching permit ${p.id}:`, err);
              return {
                ...p,
                location: "-",
                document: "-",
                permitType: "-",
                createdBy: p.created_by || "Unknown",
                createdTime: p.created_time,
                applicantId: p.applicant_id,
              } as PermitData;
            }
          })
        );

        setPermits(enrichedPermits);
      } catch (err: any) {
        console.error("Error fetching permits:", err);
        Alert.alert("Error", err.message || "Failed to load permits");
      } finally {
        setLoading(false);
      }
    }

    fetchPermits();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-700 mt-3">Loading permits...</Text>
      </View>
    );
  }

  if (permits.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">No permits found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {permits.map((permit) => (
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
  );
}