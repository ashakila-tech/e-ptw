import { useState, useEffect, useCallback } from "react";
import { fetchReportById, fetchLocationById, fetchDepartments } from "../../shared/services/api";

export function useReportDetails(id: string) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await fetchReportById(Number(id));
      
      // Enrich data with Location Name if only ID is present
      if (data.location_id && !data.location_name) {
         try {
            const loc = await fetchLocationById(data.location_id);
            data.location_name = loc.name;
         } catch (e) { 
            console.warn("Failed to fetch location name"); 
         }
      }
      
      // Enrich data with Department Name if only ID is present
      if (data.department_id && !data.department_name) {
         try {
            const deps = await fetchDepartments();
            const depList = Array.isArray(deps) ? deps : (deps.results || []);
            const found = depList.find((d: any) => d.id === data.department_id);
            if (found) data.department_name = found.name;
         } catch (e) { 
            console.warn("Failed to fetch department name"); 
         }
      }

      setReport(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch report details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { report, loading, error, refetch: fetchData };
}