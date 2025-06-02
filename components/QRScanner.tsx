/**
 * QRScanner Component
 * 
 * This component handles QR code scanning functionality using the device's camera.
 * It manages camera permissions and provides a user interface for scanning QR codes.
 * 
 * Key Features:
 * - Camera permission handling
 * - Live camera preview with scanning overlay
 * - QR code detection and processing
 * - User feedback for scanning status
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onScan - Callback function when a QR code is scanned
 */

import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  // State for camera permission status
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // State to track if a QR code has been scanned
  const [scanned, setScanned] = useState(false);

  // Request camera permissions when component mounts
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Handle QR code scanning
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan(data);
  };

  // Show loading state while requesting permissions
  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  // Show permission denied state
  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No access to camera</ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}>
          <ThemedText>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Main camera view with scanning overlay
  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}>
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </CameraView>
      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}>
          <ThemedText>Tap to Scan Again</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
}); 