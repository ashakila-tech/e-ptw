import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export const downloadDocument = async (url: string, fileName: string) => {
  try {
    // Local file path
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Download file
    const { uri } = await FileSystem.downloadAsync(url, fileUri);

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