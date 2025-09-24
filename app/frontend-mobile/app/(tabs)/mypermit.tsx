import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import PermitCard from "@/components/PermitCard";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function MyPermitTab() {
  const router = useRouter();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded for testing
  const currentUserId = 1;   // change this to simulate different users
  const isApproval = false;   // true = show approvals, false = show applicant's permits

  useEffect(() => {
    async function fetchPermits() {
      setLoading(true);
      try {
        let permitsData: PermitAPI[] = [];

        if (!isApproval) {
          // Applicant view
          const res = await fetch(`${API_BASE_URL}api/applications/`);
          const allPermits: PermitAPI[] = await res.json();
          permitsData = allPermits.filter(p => p.applicant_id === currentUserId);
        } else {
          // Approval view
          const approvalsRes = await fetch(`${API_BASE_URL}api/approval-data/`);
          const allApprovals: ApprovalItem[] = await approvalsRes.json();
          const assignedWorkflowIds = allApprovals
            .filter(a => a.approver_id === currentUserId && a.status === "SUBMITTED")
            .map(a => a.workflow_data_id);

          const applicationsRes = await fetch(`${API_BASE_URL}api/applications/`);
          const allPermits: PermitAPI[] = await applicationsRes.json();
          permitsData = allPermits.filter(p => assignedWorkflowIds.includes(p.workflow_data_id));
        }

        // Enrich permits
        const enrichedPermits: PermitData[] = await Promise.all(
          permitsData.map(async (p) => {
            const [docRes, locRes, typeRes, applicantRes, workflowRes] = await Promise.all([
              p.document_id ? fetch(`${API_BASE_URL}api/documents/${p.document_id}`) : null,
              p.location_id ? fetch(`${API_BASE_URL}api/locations/${p.location_id}`) : null,
              p.permit_type_id ? fetch(`${API_BASE_URL}api/permit-types/${p.permit_type_id}`) : null,
              p.applicant_id ? fetch(`${API_BASE_URL}api/users/${p.applicant_id}`) : null,
              p.workflow_data_id ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`) : null,
            ]);

            const document = docRes ? await docRes.json() : null;
            const location = locRes ? await locRes.json() : null;
            const permitType = typeRes ? await typeRes.json() : null;
            const applicant = applicantRes ? await applicantRes.json() : null;
            const workflowData = workflowRes ? await workflowRes.json() : null;

            return {
              id: p.id,
              name: p.name,
              status: p.status,
              location: location?.name || "-",
              document: document?.name || "-",
              permitType: permitType?.name || "-",
              workflowData: workflowData?.name || "-",
              createdBy: p.created_by || applicant?.name || "Unknown",
              createdTime: p.created_time,
              workStartTime: workflowData?.start_time || undefined,
              workEndTime: workflowData?.end_time || undefined,
              applicantId: p.applicant_id,
              documentId: p.document_id || undefined,
              locationId: p.location_id || undefined,
              permitTypeId: p.permit_type_id || undefined,
              workflowDataId: p.workflow_data_id || undefined,
            };
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
        <Text className="text-gray-600">
          {isApproval ? "No approvals found" : "No permits found"}
        </Text>
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