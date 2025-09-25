import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { downloadDocument } from "@/utils/download";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

interface DocumentUploadProps {
  uploading: boolean;
  documentId?: number | null;
  documentName?: string | null;
  onPress: () => void;
}

export default function DocumentUpload({
  uploading,
  documentId,
  documentName,
  onPress,
}: DocumentUploadProps) {
  // Construct the download URL if document exists
  const documentUrl = documentId && documentName ? `${API_BASE_URL}uploads/${documentName}` : undefined;

  return (
    <View className="mb-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-800 flex-1">
          {documentName ? `Document: ${documentName}` : "No document uploaded"}
        </Text>

        {/* Upload / Change button */}
        <TouchableOpacity
          onPress={onPress}
          className="bg-primary rounded-2xl py-2 px-4 ml-2"
          disabled={uploading}
        >
          <Text className="text-white text-xs font-semibold">
            {uploading
              ? "Uploading..."
              : documentId
              ? "Change"
              : "Upload"}
          </Text>
        </TouchableOpacity>

        {/* Download button */}
        {documentUrl && (
          <TouchableOpacity
            onPress={() => downloadDocument(documentUrl, documentName!)}
            className="bg-approved rounded-2xl py-2 px-4 ml-2"
          >
            <Text className="text-white text-xs">Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
