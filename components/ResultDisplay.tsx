/**
 * ResultDisplay Component
 * 
 * This component displays the parsed QR code data and provides appropriate actions
 * based on the content type. It handles different types of QR code content including
 * URLs, email addresses, phone numbers, WiFi credentials, contact information, and APK links.
 * 
 * Key Features:
 * - Content type-specific display
 * - Action handling for different content types
 * - Integration with APKHandler for APK links
 * - Scan again functionality
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ParsedQRData} props.data - Parsed QR code data to display
 * @param {Function} props.onScanAgain - Callback function to start a new scan
 */

import React from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { ParsedQRData } from '../utils/qrDataParser';
import { APKHandler } from './APKHandler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ResultDisplayProps {
  data: ParsedQRData;
  onScanAgain: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onScanAgain }) => {
  // Handle actions based on content type
  const handleAction = async () => {
    switch (data.type) {
      case 'url':
        await Linking.openURL(data.content);
        break;
      case 'email':
        await Linking.openURL(`mailto:${data.content}`);
        break;
      case 'phone':
        await Linking.openURL(`tel:${data.content}`);
        break;
      case 'wifi':
        // Handle WiFi connection (platform specific)
        break;
      default:
        break;
    }
  };

  // Render content based on QR code type
  const renderContent = () => {
    switch (data.type) {
      case 'apk':
        return <APKHandler data={data} />;
      
      case 'url':
        return (
          <>
            <ThemedText type="subtitle">URL Detected</ThemedText>
            <ThemedText>{data.content}</ThemedText>
            <ThemedText>Domain: {data.metadata?.domain}</ThemedText>
          </>
        );
      
      case 'email':
        return (
          <>
            <ThemedText type="subtitle">Email Address</ThemedText>
            <ThemedText>{data.content}</ThemedText>
          </>
        );
      
      case 'phone':
        return (
          <>
            <ThemedText type="subtitle">Phone Number</ThemedText>
            <ThemedText>{data.content}</ThemedText>
          </>
        );
      
      case 'wifi':
        return (
          <>
            <ThemedText type="subtitle">WiFi Network</ThemedText>
            <ThemedText>SSID: {data.metadata?.ssid}</ThemedText>
            <ThemedText>Password: {data.metadata?.password}</ThemedText>
          </>
        );
      
      case 'contact':
        return (
          <>
            <ThemedText type="subtitle">Contact Information</ThemedText>
            <ThemedText>Name: {data.metadata?.name}</ThemedText>
            <ThemedText>Email: {data.metadata?.email}</ThemedText>
            <ThemedText>Phone: {data.metadata?.phone}</ThemedText>
          </>
        );
      
      default:
        return (
          <>
            <ThemedText type="subtitle">Text Content</ThemedText>
            <ThemedText>{data.content}</ThemedText>
          </>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Display parsed content */}
      {renderContent()}
      
      {/* Show action button for interactive content types */}
      {(data.type === 'url' || data.type === 'email' || data.type === 'phone') && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
          <ThemedText>
            {data.type === 'url' ? 'Open Link' :
             data.type === 'email' ? 'Send Email' :
             'Call Number'}
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Scan again button */}
      <TouchableOpacity style={styles.scanAgainButton} onPress={onScanAgain}>
        <ThemedText>Scan Again</ThemedText>
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
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
}); 