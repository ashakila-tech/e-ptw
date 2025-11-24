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
  const documentUrl = documentId && documentName ? `${API_BASE_URL}api/documents/${documentId}/download` : undefined;

  const handleDownload = async (docId: number | null | undefined, name: string) => {
    if (!docId || !name) return;

    // Sanitize the name to prevent issues with filesystem characters.
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const url = `${API_BASE_URL}api/documents/${docId}/download`;
    await downloadDocument(url, safeName); // The util function handles the rest
  };

  return (
    <View className="mb-1">
      <View className="flex-row items-center justify-between">
        {/* <Text className="text-gray-800 flex-1">
          {documentName ? documentName : "No document uploaded"} */}
        {/* </Text> */}
        <View className="flex-1">
          <Text className="text-gray-800">
            {documentName ? documentName : "No document uploaded"}
          </Text>
          {/* <Text className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOCX, XLSX, CSV, PPTX, JPG, PNG</Text> */}
          <Text className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOCX, XLSX, CSV, PPTX, JPG, PNG, GIF, BMP, TXT, RTF</Text>
        </View>

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
        {documentUrl && documentId && documentName && (
          <TouchableOpacity
            onPress={() => handleDownload(documentId, documentName!)}
            className="bg-approved rounded-2xl py-2 px-4 ml-2"
          >
            <Text className="text-white text-xs">Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
