import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import PermitData from "@/interfaces/interfaces";
import * as api from "../../shared/services/api";
import { PermitStatus } from "@/constants/Status";

const PLACEHOLDER_THRESHOLD = 3;
const PAGE_SIZE = 10;

export function usePermitTab(searchQuery: string = "") {
  const { userId, isApproval, isSecurity, profile } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPermits = useCallback(async (reset = true) => {
    // Don't fetch if there's no user ID.
    if (!userId) {
      // If there's no user, we are not loading, and there are no permits.
      setPermits([]);
      setLoading(false);
      return;
    }

    // If user is an approver but profile is not loaded yet, wait.
    if (isApproval && !profile) {
      setLoading(true);
      return;
    }

    if (reset) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      setIsFetchingMore(true);
    }
  
    try {
      const numericUserId = Number(userId);
      const currentSkip = reset ? 0 : page * PAGE_SIZE;

      // Fetch permits based on user type
      let permitsData: any[] = [];
      if (isSecurity) {
        // Security still fetches all for now as filtering is complex, 
        // but could be optimized similarly if backend supports status filtering
        const allPermits = await api.fetchAllApplications();
        permitsData = allPermits.filter((p: any) =>
          [
            PermitStatus.APPROVED, PermitStatus.ACTIVE, PermitStatus.COMPLETED, PermitStatus.EXIT_PENDING
          ].includes(p.status)
        );

        // Client-side search for security (since we fetch all)
        if (searchQuery) {
          permitsData = permitsData.filter((p: any) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
      } else if (isApproval) {
        // For approvers, use the new dedicated endpoint.
        permitsData = await api.fetchApplicationsForApprover(numericUserId, currentSkip, PAGE_SIZE, searchQuery);
      } else {
        // Default to fetching by applicant
        permitsData = await api.fetchApplicationsByApplicant(numericUserId, currentSkip, PAGE_SIZE, searchQuery);
      }

      // Enrich permit data
      const enrichedPermits: PermitData[] = permitsData.map((p) => {
          // Use nested data directly from the application response
          const document = p.document;
          const location = p.location;
          const permitType = p.permit_type;
          const applicant = p.applicant;
          const workflowData = p.workflow_data;

          // Use nested approval_data if available
          // Based on new schema, approval_data is at the root
          const approvalRows = p.approval_data || [];
          const approvalDefs = p.approvals || [];

          let userApprovalStatus = "-";
          if (isApproval && userId) {
            const userApprovalDefinitions = approvalDefs.filter(
              (a: any) => a.user_id === Number(userId)
            );

            if (userApprovalDefinitions.length > 0) {
              const userApprovalDataItems = approvalRows.filter((ad: any) =>
                userApprovalDefinitions.some((def: any) => def.id === ad.approval_id)
              );

              if (userApprovalDataItems.length > 0) {
                if (userApprovalDataItems.some((ad: any) => ad.status === "PENDING")) {
                  userApprovalStatus = "PENDING";
                } else if (userApprovalDataItems.some((ad: any) => ad.status === "WAITING")) {
                  userApprovalStatus = "WAITING";
                } else {
                  userApprovalStatus = userApprovalDataItems[0].status;
                }
              }
            }
          }

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
          } else if (approvalRows.some((ad: any) => ad.status === "WAITING")) {
            latestApprovalStatus = "WAITING";
          }

          return {
            id: p.id,
            name: p.name?.trim() || "-",
            status: p.status,
            approvalStatus: userApprovalStatus,
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
            allApprovalStatuses: approvalRows,
          };
        });

      // Filter for approvers: only show permits where they have a status (not "-")
      let finalPermits = enrichedPermits;
      if (isApproval) {
        finalPermits = enrichedPermits.filter(p => p.approvalStatus !== "-");
      }

      // Backend now handles sorting by created_time desc

      if (reset) {
        setPermits(finalPermits);
      } else {
        setPermits((prev) => [...prev, ...finalPermits]);
      }

      // If we got fewer than PAGE_SIZE, we've reached the end
      if (permitsData.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setPage((prev) => (reset ? 1 : prev + 1));
      }
    } catch (err: any) {
      console.error("Error fetching permits:", err);
      Alert.alert("Error", err.message || "Failed to load permits");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [userId, isApproval, isSecurity, profile, page, searchQuery]);

  useEffect(() => {
    fetchPermits(true);
  }, [userId, isApproval, isSecurity, profile, searchQuery]); // Re-fetch on search change

  const loadMore = () => {
    if (!loading && !isFetchingMore && hasMore && !isSecurity) {
      fetchPermits(false);
    }
  };

  return { permits, loading, isFetchingMore, refetch: () => fetchPermits(true), loadMore, hasMore };
}