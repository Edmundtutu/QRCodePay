import { NavigationProp } from '@/types/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { getProductBySerial } from '../services/api';
import { parseQRContent } from '../utils/qrDataParser';
import { ResultDisplay } from './ResultDisplay';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface QRScannerProps {
  onScan?: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan = () => {} }) => {
  const navigation = useNavigation<NavigationProp>();
  const { items, addItem } = useCart() || { items: [], addItem: () => {} };
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  
  // Animation for scan feedback
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#ffffff" />
          {items.length > 0 && (
            <View style={styles.cartBadge}>
              <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, items.length]);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermissions();
    
    // Start scanning line animation
    startScanLineAnimation();
  }, []);

  const startScanLineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const provideFeedback = async () => {
    // Visual feedback
    Animated.sequence([
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scanAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Vibration.vibrate(100);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!data) return;
    
    // Prevent multiple rapid scans
    if (scanCooldown || !isScanning || scannedData) {
      return;
    }

    // Data validation - ensure it's not empty or just whitespace
    if (!data || data.trim().length === 0) {
      return;
    }

    // Set cooldown to prevent rapid scanning
    setScanCooldown(true);
    setIsScanning(false);
    
    // Provide immediate feedback
    await provideFeedback();
    
    // Store the scanned data
    setScannedData(data);
    
    // Reset cooldown after a short delay
    setTimeout(() => {
      setScanCooldown(false);
    }, 1000);

    // If it's a product QR code, try to add it to cart
    const product = getProductBySerial(data);
    if (product) {
      addItem(product);
    }
  };

  const handleConfirm = () => {
    if (scannedData) {
      onScan(scannedData);
      resetScanner();
    }
  };

  const handleRescan = () => {
    resetScanner();
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsScanning(true);
    setScanCooldown(false);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No access to camera</ThemedText>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashMode}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ 
          barcodeTypes: ['qr', 'ean13', 'code128', 'code39', 'pdf417'] 
        }}
      />
      
      {/* Flash toggle button */}
      <TouchableOpacity
        style={styles.flashButton}
        onPress={toggleFlash}
      >
        <ThemedText style={styles.flashButtonText}>
          {flashMode === 'off' ? '🔦' : '💡'}
        </ThemedText>
      </TouchableOpacity>

      {/* Overlay container */}
      <View style={styles.overlay}>
        {/* Scanning area with corners */}
        <View style={styles.scanAreaContainer}>
          <Animated.View 
            style={[
              styles.scanArea,
              {
                opacity: scanAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
                borderColor: scannedData ? '#4CAF50' : '#fff',
              }
            ]}
          >
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Animated scan line */}
            {isScanning && !scannedData && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-125, 125],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <ThemedText style={styles.instructionText}>
            {scannedData 
              ? 'Code scanned successfully!' 
              : isScanning 
              ? 'Position the code within the frame'
              : 'Processing...'
            }
          </ThemedText>
        </View>
      </View>

      {/* Result display overlay */}
      {scannedData && (
        <Animated.View 
          style={[
            styles.overlayPanel,
            {
              opacity: scanAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.8],
              }),
            }
          ]}
        >
          <ResultDisplay 
            data={parseQRContent(scannedData)} 
            onScanAgain={handleRescan}
          />
        </Animated.View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  flashButtonText: {
    fontSize: 20,
  },
  scanAreaContainer: {
    width: '80%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    paddingHorizontal: 20,
  },
  instructionText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  overlayPanel: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  cartIcon: {
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#4CAF50',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});