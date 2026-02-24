import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import * as api from "../../shared/services/api";

export const downloadDocument = async (documentId: number, fileName: string) => {
  let loadingAlertDisplayed = false;
  try {
    // For Android, we'll try to save directly to the Downloads folder.
    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        // Show a loading alert as this can take a moment
        Alert.alert('Downloading', 'Your file is being downloaded...');
        loadingAlertDisplayed = true;

        const blob = await api.downloadDocumentById(documentId);
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
        });

        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const mimeType = blob.type || 'application/octet-stream';

        const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, sanitizedFileName, mimeType);
        await FileSystem.writeAsStringAsync(uri, base64Data, { encoding: FileSystem.EncodingType.Base64 });

        Alert.alert('Download Complete', `File saved to your Downloads folder: ${sanitizedFileName}`);
        return; // Exit the function after successful Android download
      }
    }

    // Fallback for iOS or if Android permissions are denied
    Alert.alert('Downloading', 'Preparing your file for sharing...');
    loadingAlertDisplayed = true;

    const blob = await api.downloadDocumentById(documentId);
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

    const fileUri = FileSystem.cacheDirectory + fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { dialogTitle: 'Save or share your document' });
    } else {
      Alert.alert('Sharing Not Available', 'Could not open the share dialog.');
    }
  } catch (err: any) {
    console.error('Download failed', err);
    // Only show error alert if we haven't already shown a downloading alert that we can't dismiss
    if (!loadingAlertDisplayed) {
      Alert.alert('Error', err.message || 'Failed to download document');
    }
  }
};