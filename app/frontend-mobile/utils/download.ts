import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import * as api from '@/services/api';

export const downloadDocument = async (documentId: number, fileName: string) => {
  try {
    console.log("Downloading document ID:", documentId);

    // 1. Fetch the document as a blob from the API
    const blob = await api.downloadDocumentById(documentId);

    // 2. Convert blob to a base64 string
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        // The result includes the data URL prefix (e.g., "data:application/pdf;base64,"),
        // which needs to be removed for FileSystem.writeAsStringAsync.
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

    // 3. Save the base64 data to a local file
    const fileUri = FileSystem.cacheDirectory + fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Download successful. Saved to:", fileUri);

    // 4. Share the local file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  } catch (err: any) {
    console.error('Download failed', err);
    Alert.alert('Error', err.message || 'Failed to download document');
  }
};