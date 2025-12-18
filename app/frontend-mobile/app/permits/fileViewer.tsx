import React from "react";
import { SafeAreaView, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import FileViewer from "@/components/FileViewer";

export default function FileViewerScreen() {
  const router = useRouter();
  const { fileUrl, fileName, fileType } = useLocalSearchParams<{
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomHeader
        title={fileName || "File Viewer"}
        onBack={() => router.back()}
      />
      {fileUrl && <FileViewer fileUrl={fileUrl} fileType={fileType} />}
    </SafeAreaView>
  );
}