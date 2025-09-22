// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import { Alert } from "react-native";
// import { API_BASE_URL } from "@env";

// export async function downloadDocument(documentId: number, documentName?: string) {
//   try {
//     const fileUri = FileSystem.documentDirectory + (documentName || `document_${documentId}.pdf`);
//     const url = `${API_BASE_URL}api/documents/${documentId}/download`;

//     const res = await FileSystem.downloadAsync(url, fileUri);

//     if (res.status !== 200) {
//       throw new Error(`Download failed (${res.status})`);
//     }

//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(res.uri);
//     } else {
//       Alert.alert("Downloaded", `File saved to: ${res.uri}`);
//     }
//   } catch (err: any) {
//     console.error("Download error:", err);
//     Alert.alert("Error", err.message || "Failed to download document");
//   }
// }