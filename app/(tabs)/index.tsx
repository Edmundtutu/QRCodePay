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
  return (
    <QRScanner onScan={() => {}} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
