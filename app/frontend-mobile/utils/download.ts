import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export const downloadDocument = async (url: string, fileName: string) => {
  try {
    console.log("Download URL:", url);
    console.log("Sanitized Filename:", fileName);

    // Local file path
    // The directory from expo-file-system does not have a trailing slash, so we add one.
    const fileUri = `${FileSystem.cacheDirectory}/${fileName}`;

    console.log("Constructed File URI:", fileUri);

    // Download file
    const { uri } = await FileSystem.downloadAsync(url, fileUri);

    console.log("Download successful. Saved to:", uri);

    // For Android, share via native share
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Download', `File saved to: ${uri}`);
    }
  } catch (err: any) {
    console.error('Download failed', err);
    Alert.alert('Error', err.message || 'Failed to download document');
  }
};