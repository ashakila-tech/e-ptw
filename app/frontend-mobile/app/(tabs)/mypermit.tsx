import React, { useEffect, useState } from "react";
import PermitCard from "@/components/PermitCard";
import { FlatList } from "react-native";
import { API_BASE_URL } from "@env";

export default function MyPermitTab() {
  const [permitData, setPermitData] = useState<PermitData[]>([]);

  useEffect(() => {
    async function fetchPermits() {
      try {
        // const res = await fetch(`${API_BASE_URL}api/applications`);
        const res = await fetch(`${API_BASE_URL}api/applications/`);
        const permits = await res.json();

        console.log("Fetched permits:", permits);

        const enrichedPermits = await Promise.all(
          permits.map(async (permit: PermitAPI) => {
            const docRes = await fetch(
              `${API_BASE_URL}api/documents/${permit.document_id}`
            );
            const document = await docRes.json();

            const locRes = await fetch(
              `${API_BASE_URL}api/locations/${permit.location_id}`
            );
            const location = await locRes.json();

            const typeRes = await fetch(
              `${API_BASE_URL}api/permit-types/${permit.permit_type_id}`
            );
            const permitType = await typeRes.json();

            const workflowRes = await fetch(
              `${API_BASE_URL}api/workflow-data/${permit.workflow_data_id}`
            );
            const workflowData = await workflowRes.json();

            return {
              ...permit,
              document: document.name || document.title || "",
              location: location.name || location.title || "",
              permitType: permitType.name || permitType.title || "",
              workflowData: workflowData.status || "",
              createdTime: permit.created_time,
              workStartTime: permit.work_start_time,
            };
          })
        );

        setPermitData(enrichedPermits);
      } catch (error) {
        console.error("Error fetching permit data:", error);
      }
    }

    fetchPermits();
  }, []);

  return (
    <FlatList
      data={permitData}
      renderItem={({ item }) => <PermitCard {...item} />}
      scrollEnabled={true}
      className="w-full p-3"
    />
  );
}
