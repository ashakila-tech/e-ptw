import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useUser } from "@/contexts/UserContext";
import PermitData from "@/interfaces/interfaces";
import * as api from "../../shared/services/api";
import { PermitStatus } from "@/constants/Status";

const PAGE_SIZE = 20; // adjust as needed

export function usePermitTab(searchQuery: string = "") {
  const { userId, isApproval, isSecurity, profile } = useUser();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPermits = useCallback(async (reset = true) => {
    if (!userId) {
      setPermits([]);
      setLoading(false);
      return;
    }

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
      let permitsData: any[] = [];

      if (isSecurity) {
        // Fetch latest permits for security using backend filter
        const filterParams: any = {
          skip: currentSkip,
          limit: PAGE_SIZE,
        };

        // Include search query if present
        if (searchQuery) filterParams.q = searchQuery;

        const allFilteredPermits = await api.fetchFilteredApplications(filterParams);

        // Only show relevant statuses
        permitsData = allFilteredPermits.filter((p: any) =>
          [PermitStatus.APPROVED, PermitStatus.ACTIVE, PermitStatus.COMPLETED, PermitStatus.EXIT_PENDING].includes(p.status)
        );
      } else if (isApproval) {
        // Approvers
        permitsData = await api.fetchApplicationsForApprover(numericUserId, currentSkip, PAGE_SIZE, searchQuery);
      } else {
        // Applicant
        permitsData = await api.fetchApplicationsByApplicant(numericUserId, currentSkip, PAGE_SIZE, searchQuery);
      }

      // Enrich permit data
      const enrichedPermits: PermitData[] = permitsData.map((p) => {
        const document = p.document;
        const location = p.location;
        const permitType = p.permit_type;
        const applicant = p.applicant;
        const workflowData = p.workflow_data;
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
              if (userApprovalDataItems.some((ad: any) => ad.status === "PENDING")) userApprovalStatus = "PENDING";
              else if (userApprovalDataItems.some((ad: any) => ad.status === "WAITING")) userApprovalStatus = "WAITING";
              else userApprovalStatus = userApprovalDataItems[0].status;
            }
          }
        }

        let latestApprovalStatus = "-";
        if (approvalRows.some((ad: any) => ad.status === "REJECTED")) latestApprovalStatus = "REJECTED";
        else if (approvalRows.some((ad: any) => ad.status === "PENDING")) latestApprovalStatus = "PENDING";
        else if (approvalRows.length > 0 && approvalRows.every((ad: any) => ad.status === "APPROVED")) latestApprovalStatus = "APPROVED";
        else if (approvalRows.some((ad: any) => ad.status === "WAITING")) latestApprovalStatus = "WAITING";

        return {
          id: p.id,
          name: p.name?.trim() || "-",
          status: p.status,
          approvalStatus: userApprovalStatus,
          latestApprovalStatus,
          location: location?.name || "-",
          document: document?.name || "-",
          permitType: permitType?.name || "-",
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

      let finalPermits = enrichedPermits;
      if (isApproval) finalPermits = enrichedPermits.filter((p) => p.approvalStatus !== "-");

      if (reset) setPermits(finalPermits);
      else setPermits((prev) => [...prev, ...finalPermits]);

      if (permitsData.length < PAGE_SIZE) setHasMore(false);
      else setPage((prev) => (reset ? 1 : prev + 1));
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
  }, [userId, isApproval, isSecurity, profile, searchQuery]);

  const loadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      fetchPermits(false);
    }
  };

  return { permits, loading, isFetchingMore, refetch: () => fetchPermits(true), loadMore, hasMore };
}