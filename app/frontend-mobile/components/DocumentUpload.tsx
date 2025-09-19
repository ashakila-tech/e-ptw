import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { View } from "react-native";

export default function DocumentUpload({
  uploading,
  documentId,
  documentName,
  onPress,
}: {
  uploading: boolean;
  documentId: number | null;
  documentName: string | null;
  onPress: () => void;
}) {
  return (
    <View className="mb-1">
      <TouchableOpacity
        onPress={onPress}
        className="bg-blue-600 rounded-2xl py-3 px-4 items-center"
        disabled={uploading}
      >
        <Text className="text-white font-semibold">
          {uploading
            ? "Uploading..."
            : documentId
            ? "Change Document"
            : "Upload Document"}
        </Text>
      </TouchableOpacity>

      {/* ✅ Always show document name if uploaded */}
      {documentId && (
        <Text className="text-green-600 mt-2">
          {documentName ? `Uploaded: ${documentName}` : "Document uploaded"}
        </Text>
      )}
    </View>
  );
}
