import { useEffect, useState, useCallback } from "react";
import * as api from "@/services/api";
import Constants from "expo-constants";

export function useWorkerDetails(id?: string) {
  const [worker, setWorker] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorker = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const workerData = await api.fetchWorkerById(Number(id));

      // Fetch company name if company_id exists
      const company = workerData.company_id
        ? await api.fetchCompanyById(workerData.company_id)
        : null;

      // Construct full picture URL if picture path exists

      const pictureUrl = workerData.picture
        ? `${Constants.expoConfig?.extra?.API_BASE_URL}api/workers/${workerData.id}/picture?timestamp=${new Date().getTime()}`
        : null;

      console.log(pictureUrl);

      setWorker({
        ...workerData,
        company_name: company?.name || "-",
        picture_url: pictureUrl,
      });
    } catch (err: any) {
      console.error("Error fetching worker details:", err);
      setError(err.message || "Failed to fetch worker details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  return { worker, loading, error, refetch: fetchWorker };
}