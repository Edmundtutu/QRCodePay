/**
 * ResultDisplay Component
 * 
 * This component displays the parsed QR code data and provides appropriate actions
 * based on the content type. It handles different types of QR code content including
 * URLs, email addresses, phone numbers, WiFi credentials, contact information, and APK links.
 * 
 * Key Features:
 * - Content type-specific display with modern styling
 * - Action handling for different content types with icon buttons
 * - Integration with APKHandler for APK links
 * - Scan again functionality with improved UX
 * - High contrast colors for better accessibility
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ParsedQRData} props.data - Parsed QR code data to display
 * @param {Function} props.onScanAgain - Callback function to start a new scan
 */

import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ParsedQRData } from '../utils/qrDataParser';
import { APKHandler } from './APKHandler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

// Icon components using vector icons
const OpenIcon = () => (
  <MaterialIcons name="open-in-new" size={20} color="#ffffff" />
);

const EmailIcon = () => (
  <MaterialIcons name="email" size={20} color="#ffffff" />
);

const PhoneIcon = () => (
  <MaterialIcons name="phone" size={20} color="#ffffff" />
);

const ScanIcon = () => (
  <MaterialIcons name="refresh" size={20} color="#007AFF" />
);

interface ResultDisplayProps {
  data: ParsedQRData;
  onScanAgain: () => void;
  style?: any;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onScanAgain, style }) => {
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

  // Get appropriate icon and button text based on content type
  const getActionButtonConfig = () => {
    switch (data.type) {
      case 'url':
        return { icon: <OpenIcon />, text: 'Open Link', color: '#4CAF50' };
      case 'email':
        return { icon: <EmailIcon />, text: 'Send Email', color: '#2196F3' };
      case 'phone':
        return { icon: <PhoneIcon />, text: 'Call Number', color: '#FF9800' };
      default:
        return null;
    }
  };

  // Render content based on QR code type
  const renderContent = () => {
    switch (data.type) {
      case 'apk':
        return <APKHandler data={data} />;
      
      case 'url':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialIcons name="link" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>URL Detected</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>{data.content}</ThemedText>
            {data.metadata?.domain && (
              <ThemedText style={styles.metadataText}>Domain: {data.metadata.domain}</ThemedText>
            )}
          </View>
        );
      
      case 'email':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialIcons name="email" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>Email Address</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>{data.content}</ThemedText>
          </View>
        );
      
      case 'phone':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialIcons name="phone" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>Phone Number</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>{data.content}</ThemedText>
          </View>
        );
      
      case 'wifi':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialCommunityIcons name="wifi" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>WiFi Network</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>SSID: {data.metadata?.ssid}</ThemedText>
            {data.metadata?.password && (
              <ThemedText style={styles.contentText}>Password: {data.metadata.password}</ThemedText>
            )}
          </View>
        );
      
      case 'contact':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialCommunityIcons name="account-details" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>Contact Information</ThemedText>
        </View>
            {data.metadata?.name && (
              <ThemedText style={styles.contentText}>Name: {data.metadata.name}</ThemedText>
            )}
            {data.metadata?.email && (
              <ThemedText style={styles.contentText}>Email: {data.metadata.email}</ThemedText>
            )}
            {data.metadata?.phone && (
              <ThemedText style={styles.contentText}>Phone: {data.metadata.phone}</ThemedText>
            )}
          </View>
        );

      case 'service':
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialIcons name="settings" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>Service Code</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>Type: {data.metadata?.serviceType}</ThemedText>
            <ThemedText style={styles.contentText}>Content: {data.content}</ThemedText>
          </View>
        );
      
      default:
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
          <MaterialIcons name="description" size={20} color="#ffffff" />
          <ThemedText style={styles.titleText}>Text Content</ThemedText>
        </View>
            <ThemedText style={styles.contentText}>{data.content}</ThemedText>
          </View>
        );
    }
  };

  const actionConfig = getActionButtonConfig();

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Header with scan indicator */}
      <View style={styles.header}>
        <View style={styles.scanIndicator} />
        <ThemedText style={styles.headerText}>QR Code Scanned</ThemedText>
      </View>

      {/* Display parsed content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      {/* Action buttons container */}
      <View style={styles.buttonContainer}>
        {/* Show action button for interactive content types */}
        {actionConfig && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: actionConfig.color }]} 
            onPress={handleAction}
            activeOpacity={0.8}
          >
            {actionConfig.icon}
            <ThemedText style={styles.actionButtonText}>
              {actionConfig.text}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Scan again button */}
        <TouchableOpacity 
          style={styles.scanAgainButton} 
          onPress={onScanAgain}
          activeOpacity={0.8}
        >
          <ScanIcon />
          <ThemedText style={styles.scanButtonText}>Scan Again</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

// Enhanced styles with modern design principles
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a', // Dark background for high contrast
    borderRadius: 16,
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  scanIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },

  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // High contrast white text
  },

  contentContainer: {
    padding: 20,
  },

  contentSection: {
    marginBottom: 8,
  },

  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#e0e0e0', // Slightly muted but still high contrast
    marginBottom: 6,
    lineHeight: 20,
  },

  metadataText: {
    fontSize: 14,
    color: '#b0b0b0', // Secondary text color
    fontStyle: 'italic',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    minHeight: 48,
  },

  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    flex: 1,
    minHeight: 48,
  },

  scanButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Icon styles (simple geometric icons)
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 16,
    height: 16,
  },

  openIcon: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 3,
    backgroundColor: 'transparent',
  },

  emailIcon: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
  },

  phoneIcon: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  scanIcon: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});