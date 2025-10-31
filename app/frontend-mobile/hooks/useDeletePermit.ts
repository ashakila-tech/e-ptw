import Constants from "expo-constants";
import { Alert } from "react-native";
import { router } from "expo-router";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export function useDeletePermit(onDeleted?: () => void) {
  async function deletePermit(id?: number, status?: string) {
    if (!id) {
      Alert.alert("Error", "Invalid permit ID.");
      return;
    }

    if (status !== "DRAFT") {
      Alert.alert("Not Allowed", "Only draft permits can be deleted.");
      return;
    }

    Alert.alert(
      "Delete Draft Permit",
      "Are you sure you want to delete this draft permit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}api/applications/${id}`, {
                method: "DELETE",
              });

              if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to delete permit");
              }

              Alert.alert("Success", "Draft permit deleted successfully!");

              // Refresh list or navigate away
              if (onDeleted) {
                onDeleted(); // parent screen refresh callback
              } else {
                router.back(); // default fallback
              }
            } catch (err: any) {
              console.error("Delete failed:", err);
              Alert.alert("Error", err.message || "Failed to delete permit");
            }
          },
        },
      ]
    );
  }

  return { deletePermit };
}