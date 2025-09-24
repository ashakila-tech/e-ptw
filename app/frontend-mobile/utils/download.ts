// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import { Alert, Platform } from "react-native";

// export async function downloadAndShareDocument(
//   documentId: number,
//   documentName: string,
//   apiBaseUrl: string
// ) {
//   try {
//     if (!documentId) {
//       Alert.alert("Error", "Document not found.");
//       return;
//     }

//     const downloadUrl = `${apiBaseUrl}api/documents/${documentId}/download`;

//     if (Platform.OS === "web") {
//       // ✅ On web, just open in new tab
//       window.open(downloadUrl, "_blank");
//       return;
//     }

//     const fileUri = FileSystem.documentDirectory + documentName;

//     // ✅ Download file on device
//     const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);

//     // ✅ Share file (if available)
//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(downloadRes.uri);
//     } else {
//       Alert.alert("Downloaded", `File saved at ${downloadRes.uri}`);
//     }
//   } catch (err: any) {
//     console.error("Download error:", err);
//     Alert.alert("Error", "Failed to download document.");
//   }
// }