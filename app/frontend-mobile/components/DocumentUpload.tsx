import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface DocumentUploadProps {
  uploading: boolean;
  documentId?: number | null;
  documentName?: string | null;
  onUploadPress: () => void;
  onDownloadPress: () => void;
}

export default function DocumentUpload({ uploading, documentId, documentName, onUploadPress, onDownloadPress }: DocumentUploadProps) {
  return (
    <View className="mb-1">
      <View className="flex-row items-center justify-between">
        {/* </Text> */}
        <View className="flex-1">
          <Text className="text-gray-800">
            {documentName ? documentName : "No document uploaded"}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, DOCX, XLSX, CSV, PPTX, JPG, PNG, GIF, BMP, TXT, RTF
          </Text>
        </View>

        {/* Upload / Change button */}
        <TouchableOpacity
          onPress={onUploadPress}
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
        {documentId && (
          <TouchableOpacity
            onPress={onDownloadPress}
            className="bg-green-600 rounded-2xl py-2 px-4 ml-2"
          >
            <Text className="text-white text-xs">Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
