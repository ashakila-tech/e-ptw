import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import PermitData from "@/interfaces/interfaces";
import * as api from "@/services/api";
import { PermitStatus } from "@/constants/Status";

const PLACEHOLDER_THRESHOLD = 3;

export function usePermitTab() {
  const { userId, isApproval, isSecurity } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const numericUserId = Number(userId);

      // Fetch all necessary data
      const [allApprovalData, allApprovals, allWorkflowData] = await Promise.all([
        api.fetchAllApprovalData(),
        api.fetchAllApprovals(),
        api.fetchAllWorkflowData(),
      ]);

      const myApprovals = allApprovals.filter(
        (a: any) => Number(a.user_id) === numericUserId
      );

      const myApprovalIds = myApprovals.map((a: any) => Number(a.id));
      const myWorkflowIds = myApprovals.map((a: any) => Number(a.workflow_id));

      const workflowDataIdsFromApprovalData = Array.from(
        new Set(
          allApprovalData
            .filter((ad: any) => myApprovalIds.includes(Number(ad.approval_id)))
            .map((ad: any) => Number(ad.workflow_data_id))
        )
      );

      const workflowDataIdsFromWorkflows: number[] = [];
      for (const wfId of myWorkflowIds) {
        for (const wd of allWorkflowData) {
          if (Number(wd.workflow_id) === wfId) {
            workflowDataIdsFromWorkflows.push(Number(wd.id));
          }
        }
      }

      const combinedWorkflowDataIds = [
        ...workflowDataIdsFromApprovalData,
        ...workflowDataIdsFromWorkflows,
      ];
      const workflowDataIdsToFetch = new Set(combinedWorkflowDataIds);

      // Fetch permits based on user type
      let permitsData: any[] = [];
      if (isSecurity) {
        const allPermits = await api.fetchAllApplications();
        permitsData = allPermits.filter((p: any) =>
          [PermitStatus.APPROVED, PermitStatus.ACTIVE, PermitStatus.COMPLETED].includes(
            p.status
          )
        );
      } else if (!isApproval) {
        permitsData = await api.fetchApplicationsByApplicant(numericUserId);
      } else {
        const results = await Promise.all(
          Array.from(workflowDataIdsToFetch).map(async (id) => {
            try {
              return await api.fetchApplicationsByWorkflowData(id);
            } catch (e) {
              console.warn("fetchApplicationsByWorkflowData failed:", id, e);
              return [];
            }
          })
        );
        permitsData = results.flat();
      }

      // Enrich permit data
      const enrichedPermits: PermitData[] = await Promise.all(
        permitsData.map(async (p) => {
          const [
            document,
            location,
            permitType,
            applicant,
            workflowData,
          ] = await Promise.all([
            p.document_id ? api.fetchDocumentById(p.document_id) : null,
            p.location_id ? api.fetchLocationById(p.location_id) : null,
            p.permit_type_id ? api.fetchPermitTypeById(p.permit_type_id) : null,
            p.applicant_id ? api.fetchUserById(p.applicant_id) : null,
            p.workflow_data_id ? api.fetchWorkflowDataById(p.workflow_data_id) : null,
          ]);

          const wfId = Number(p.workflow_data_id);
          const approvalRows = allApprovalData.filter(
            (ad: any) => Number(ad.workflow_data_id) === wfId
          );

          const myApprovalRow = approvalRows.find((ad: any) =>
            myApprovalIds.includes(Number(ad.approval_id))
          );
          const approvalStatus = myApprovalRow ? myApprovalRow.status : "-";

          let latestApprovalStatus = "-";
          if (approvalRows.some((ad: any) => ad.status === "REJECTED")) {
            latestApprovalStatus = "REJECTED";
          } else if (approvalRows.some((ad: any) => ad.status === "PENDING")) {
            latestApprovalStatus = "PENDING";
          } else if (
            approvalRows.length > 0 &&
            approvalRows.every((ad: any) => ad.status === "APPROVED")
          ) {
            latestApprovalStatus = "APPROVED";
          }

          return {
            id: p.id,
            name: p.name?.trim() || "-",
            status: p.status,
            approvalStatus,
            latestApprovalStatus,
            location:
              p.location_id && p.location_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : location?.name || "-",
            document:
              p.document_id && p.document_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : document?.name || "-",
            permitType:
              p.permit_type_id && p.permit_type_id <= PLACEHOLDER_THRESHOLD
                ? "-"
                : permitType?.name || "-",
            workflowData: workflowData?.name || "-",
            createdBy: applicant?.name || "-",
            createdTime: p.created_time,
            workStartTime: workflowData?.start_time,
            workEndTime: workflowData?.end_time,
            applicantId: p.applicant_id,
            documentId: p.document_id,
            locationId: p.location_id,
            permitTypeId: p.permit_type_id,
            workflowDataId: p.workflow_data_id,
          };
        })
      );

      // Sort permits by created time descending
      enrichedPermits.sort(
        (a, b) =>
          new Date(b.createdTime ?? 0).getTime() -
          new Date(a.createdTime ?? 0).getTime()
      );

      setPermits(enrichedPermits);
    } catch (err: any) {
      console.error("Error fetching permits:", err);
      Alert.alert("Error", err.message || "Failed to load permits");
    } finally {
      setLoading(false);
    }
  }, [userId, isApproval, isSecurity]);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  return { permits, loading, refetch: fetchPermits };
}