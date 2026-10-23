import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const PORTRAITS_DIR = `${FileSystem.documentDirectory || ''}portraits/`;

/**
 * Ensures the local portraits directory exists on native platforms.
 */
export async function ensurePortraitsDirectoryExists(): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(PORTRAITS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PORTRAITS_DIR, { intermediates: true });
    }
  } catch {
    // ignore directory creation errors
  }
}

/**
 * Saves a portrait image (remote HTTP URL or local temporary file)
 * permanently into the app's document sandbox.
 * Returns the permanent local file URI on native, or the original URI on web.
 */
export async function savePortraitToLocalStorage(
  sourceUri: string,
  portraitId: string
): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }

  try {
    await ensurePortraitsDirectoryExists();

    const fileExtension = sourceUri.includes('.png') ? 'png' : 'jpg';
    const destinationPath = `${PORTRAITS_DIR}${portraitId}.${fileExtension}`;

    if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
      // Download remote image to local file
      const downloadResult = await FileSystem.downloadAsync(sourceUri, destinationPath);
      return downloadResult.uri;
    } else if (sourceUri.startsWith('file://') || sourceUri.startsWith('/')) {
      // Copy temporary file to permanent storage
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationPath,
      });
      return destinationPath;
    }

    return sourceUri;
  } catch {
    // If local saving fails, fallback to the original URI
    return sourceUri;
  }
}

/**
 * Deletes a stored local portrait from the device filesystem.
 */
export async function deleteLocalPortrait(fileUri: string): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;

  try {
    if (fileUri.startsWith(PORTRAITS_DIR)) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch {
    // ignore deletion errors
  }
}
