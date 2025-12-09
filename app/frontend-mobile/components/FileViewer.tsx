import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import LoadingScreen from "./LoadingScreen";

interface FileViewerProps {
  fileUrl: string;
  fileType?: string; // e.g., 'image/png', 'application/pdf'
}

export default function FileViewer({ fileUrl, fileType }: FileViewerProps) {
  const isImage = fileType?.startsWith("image/");

  // For non-image files, use Google Docs viewer
  const webViewUrl = isImage ? fileUrl : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;

  if (isImage) {
    return <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" />;
  }

  return (
    <WebView
      source={{ uri: webViewUrl }}
      startInLoadingState={true}
      renderLoading={() => <LoadingScreen message="Loading document..." />}
    />
  );
}

const styles = StyleSheet.create({
  image: { flex: 1, width: "100%", height: "100%" },
});