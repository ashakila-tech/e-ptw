import { useState, useCallback, useEffect, useMemo } from "react";
import { fetchReports } from "../../shared/services/api";
import { CONDITION_ITEMS } from "../../shared/constants/Conditions";
import { CONCERN_ITEMS } from "../../shared/constants/Concerns";

export function useReportList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filterCondition, setFilterCondition] = useState<string | null>(null);
  const [filterConcern, setFilterConcern] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  // Extract unique values for filters
  const conditions = useMemo(() => {
    return CONDITION_ITEMS.map((item) => item.value);
  }, []);

  const concerns = useMemo(() => {
    return CONCERN_ITEMS.map((item) => item.value);
  }, []);

  // Filter logic
  const filteredReports = useMemo(() => {
    let result = reports;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(term) ||
          (r.description || "").toLowerCase().includes(term) ||
          (r.location?.name || r.location_name || "").toLowerCase().includes(term)
      );
    }

    if (startDate) {
      // Reset time to start of day for comparison
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => {
        if (!r.incident_timestamp) return false;
        return new Date(r.incident_timestamp) >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => {
        if (!r.incident_timestamp) return false;
        return new Date(r.incident_timestamp) <= end;
      });
    }

    if (filterCondition) {
      result = result.filter((r) => r.condition === filterCondition);
    }

    if (filterConcern) {
      result = result.filter((r) => r.concern === filterConcern);
    }

    return result;
  }, [reports, search, startDate, endDate, filterCondition, filterConcern]);

  return {
    reports,
    filteredReports,
    loading,
    refreshing,
    onRefresh,
    search,
    setSearch,
    showFilters,
    setShowFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filterCondition,
    setFilterCondition,
    filterConcern,
    setFilterConcern,
    conditions,
    concerns,
  };
}