import { Alert } from "react-native";
import { router } from "expo-router";
import * as api from "@/services/api"; // import your API file

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
              await api.deleteApplication(id);
              Alert.alert("Success", "Draft permit deleted successfully!");

              // Refresh list or navigate away
              if (onDeleted) {
                onDeleted();
              } else {
                router.back();
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