import { QRScanner } from '@/components/QRScanner';
import { ResultDisplay } from '@/components/ResultDisplay';
import { ThemedView } from '@/components/ThemedView';
import { ParsedQRData, parseQRContent } from '@/utils/qrDataParser';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

/**
 * HomeScreen Component
 * 
 * This is the main screen of the QR code scanner app.
 * It manages the scanning state and displays either the scanner
 * or the results view based on whether a QR code has been scanned.
 */
export default function HomeScreen() {
  const [scannedData, setScannedData] = useState<ParsedQRData | null>(null);

  const handleScan = (data: string) => {
    const parsedData = parseQRContent(data);
    setScannedData(parsedData);
  };

  const handleScanAgain = () => {
    setScannedData(null);
  };

  return (
    <ThemedView style={styles.container}>
      {scannedData ? (
        <ResultDisplay data={scannedData} onScanAgain={handleScanAgain} />
      ) : (
        <QRScanner onScan={handleScan} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
