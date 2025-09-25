import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import PermitCard from "@/components/PermitCard";
import Constants from "expo-constants";
import { useUser } from "@/contexts/UserContext";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

type ApplicantTabKey = "all" | "approved" | "submitted" | "drafts";
type ApproverTabKey = "all" | "pending" | "approved" | "rejected";

export default function MyPermitTab() {
  const router = useRouter();
  const { userId, isApproval } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    ApplicantTabKey | ApproverTabKey
  >(isApproval ? "all" : "all");

  useEffect(() => {
    async function fetchPermits() {
      if (!userId) return;
      setLoading(true);

      try {
        let permitsData: PermitAPI[] = [];

        if (!isApproval) {
          // Applicant view
          const res = await fetch(`${API_BASE_URL}api/applications/`);
          const allPermits: PermitAPI[] = await res.json();
          permitsData = allPermits.filter((p) => p.applicant_id === userId);
        } else {
          // Approval view
          const approvalsRes = await fetch(`${API_BASE_URL}api/approval-data/`);
          const allApprovals: ApprovalItem[] = await approvalsRes.json();
          const assignedWorkflowIds = allApprovals
            .filter((a) => a.approver_id === userId)
            .map((a) => a.workflow_data_id);

          const applicationsRes = await fetch(
            `${API_BASE_URL}api/applications/`
          );
          const allPermits: PermitAPI[] = await applicationsRes.json();
          permitsData = allPermits.filter((p) =>
            assignedWorkflowIds.includes(p.workflow_data_id)
          );
        }

        // Enrich permits
        const enrichedPermits: PermitData[] = await Promise.all(
          permitsData.map(async (p) => {
            const [docRes, locRes, typeRes, applicantRes, workflowRes] =
              await Promise.all([
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
                p.workflow_data_id
                  ? fetch(`${API_BASE_URL}api/workflow-data/${p.workflow_data_id}`)
                  : null,
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

        // Sort by createdTime (latest first)
        enrichedPermits.sort((a, b) => {
          const dateA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
          const dateB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
          return dateB - dateA;
        });

        setPermits(enrichedPermits);
      } catch (err: any) {
        console.error("Error fetching permits:", err);
        Alert.alert("Error", err.message || "Failed to load permits");
      } finally {
        setLoading(false);
      }
    }

    fetchPermits();
  }, [userId]);

  // Tabs for each role
  const applicantTabs: ApplicantTabKey[] = [
    "all",
    "approved",
    "submitted",
    "drafts",
  ];
  const approverTabs: ApproverTabKey[] = [
    "all",
    "pending",
    "approved",
    "rejected",
  ];

  // Filter permits based on tab
  const filteredPermits = permits.filter((p) => {
    if (!isApproval) {
      if (activeTab === "all") return true;
      if (activeTab === "approved") return p.status === "APPROVED";
      if (activeTab === "submitted") return p.status === "SUBMITTED";
      if (activeTab === "drafts") return p.status === "DRAFT";
    } else {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return p.status === "SUBMITTED";
      if (activeTab === "approved") return p.status === "APPROVED";
      if (activeTab === "rejected") return p.status === "REJECTED";
    }
    return true;
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary">
        <ActivityIndicator size="large" color="#535252" />
        <Text className="text-primary mt-3">Loading permits...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary">
      {/* Tabs */}
      <View className="flex-row justify-around p-2 bg-secondary">
        {(isApproval ? approverTabs : applicantTabs).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 mx-1 px-4 py-2 rounded-lg ${
                isActive ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-center ${
                  isActive ? "text-white" : "text-primary"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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