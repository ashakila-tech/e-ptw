import React, { useEffect } from "react";
import { Image, StyleSheet, Platform, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import LoadingScreen from "./LoadingScreen";
// import * as Linking from "expo-linking";

interface FileViewerProps {
  fileUrl: string;   // <-- /view endpoint
  fileType?: string;
}

export default function FileViewer({ fileUrl, fileType }: FileViewerProps) {
  const isImage = fileType?.startsWith("image/");
  const isPdf = fileType === "application/pdf";

  if (isImage) {
    return <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" />;
  }

  // Web: iframe works fine
  if (Platform.OS === "web") {
    return <iframe src={fileUrl} style={{ width: "100%", height: "100%", border: "none" }} />;
  }

  // Android native PDF app
  // if (isPdf && Platform.OS === "android") {
  //   Linking.openURL(fileUrl);
  //   return null;
  // }

  // Google Docs Viewer (PDF + Office)
  const googleViewerUrl =
    `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;

  return (
    <WebView
      source={{ uri: googleViewerUrl }}
      startInLoadingState
      renderLoading={() => <LoadingScreen message="Loading document..." />}
      style={styles.webview}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webview: {
    flex: 1,
  },
});