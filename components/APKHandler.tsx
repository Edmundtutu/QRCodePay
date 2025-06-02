/**
 * APKHandler Component
 * 
 * This component handles the download and installation of APK files from QR codes.
 * It provides a user interface for downloading APKs and shows installation guidance.
 * 
 * Key Features:
 * - APK download handling
 * - Installation guide display
 * - Platform-specific checks
 * - Download progress feedback
 * - Error handling
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ParsedQRData} props.data - Parsed QR code data containing APK information
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { ParsedQRData } from '../utils/qrDataParser';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface APKHandlerProps {
  data: ParsedQRData;
}

export const APKHandler: React.FC<APKHandlerProps> = ({ data }) => {
  // State to track download progress
  const [downloading, setDownloading] = useState(false);

  // Display installation guide with step-by-step instructions
  const showInstallGuide = () => {
    Alert.alert(
      'Installation Guide',
      'To install this APK:\n\n' +
        '1. Enable "Install from Unknown Sources" in your device settings\n' +
        '2. Download the APK file\n' +
        '3. Open the downloaded file\n' +
        '4. Follow the installation prompts\n\n' +
        'Note: Installing apps from unknown sources may pose security risks. Only install from trusted sources.',
      [{ text: 'OK' }]
    );
  };

  // Handle APK download process
  const handleDownload = async () => {
    // Check if running on Android
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'APK installation is only supported on Android devices.');
      return;
    }

    try {
      setDownloading(true);
      // Extract filename from URL or use default
      const fileName = data.content.split('/').pop() || 'app.apk';
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Download the APK file
      const downloadResult = await FileSystem.downloadAsync(data.content, fileUri);
      
      if (downloadResult.status === 200) {
        // Show success dialog with options
        Alert.alert(
          'Download Complete',
          'Would you like to install the APK now?',
          [
            {
              text: 'Show Guide',
              onPress: showInstallGuide,
            },
            {
              text: 'Install',
              onPress: () => Sharing.shareAsync(fileUri),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download the APK. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">APK Download</ThemedText>
      <ThemedText>Source: {data.metadata?.domain}</ThemedText>
      
      {/* Download button with loading state */}
      <TouchableOpacity
        style={[styles.button, downloading && styles.buttonDisabled]}
        onPress={handleDownload}
        disabled={downloading}>
        <ThemedText>
          {downloading ? 'Downloading...' : 'Download APK'}
        </ThemedText>
      </TouchableOpacity>

      {/* Installation guide button */}
      <TouchableOpacity
        style={styles.guideButton}
        onPress={showInstallGuide}>
        <ThemedText>View Installation Guide</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  guideButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
}); 