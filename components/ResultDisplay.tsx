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

import { NavigationProp } from '@/types/navigation';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { getProductBySerial } from '../services/api';
import { ParsedQRData } from '../utils/qrDataParser';
import { APKHandler } from './APKHandler';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ResultDisplayProps {
  data: ParsedQRData;
  onScanAgain: () => void;
  style?: ViewStyle;
}

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

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onScanAgain, style }) => {
  const navigation = useNavigation<NavigationProp>();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (data.type === 'product' && data.metadata) {
      const product = getProductBySerial(data.content);
      if (product) {
        addItem(product);
      }
    }
  };

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
      case 'product':
        const product = getProductBySerial(data.content);
        if (product) {
          return (
            <View style={styles.contentSection}>
              <View style={styles.iconTextContainer}>
                <MaterialIcons name="shopping-cart" size={20} color="#ffffff" />
                <ThemedText style={styles.titleText}>Product Found</ThemedText>
              </View>
              <ThemedText style={styles.contentText}>{product.name}</ThemedText>
              <ThemedText style={styles.contentText}>Price: ${product.price.toFixed(2)}</ThemedText>
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
              </TouchableOpacity>
            </View>
          );
        }
        return null;
        
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
        if (!data.metadata) return null;
        return (
          <View style={styles.contentSection}>
            <View style={styles.iconTextContainer}>
              <MaterialIcons name="settings" size={20} color="#ffffff" />
              <ThemedText style={styles.titleText}>Service Code</ThemedText>
            </View>
            <ThemedText style={styles.contentText}>Type: {data.metadata.serviceType}</ThemedText>
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
          <MaterialIcons name="qr-code-scanner" size={20} color="#007AFF" />
          <ThemedText style={styles.scanButtonText}>Scan Again</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    elevation: 5,
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
    color: '#ffffff',
  },
  contentContainer: {
    padding: 20,
  },
  contentSection: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  contentText: {
    fontSize: 14,
    color: '#e0e0e0', 
    marginBottom: 5,
    lineHeight: 20,
  },
  metadataText: {
    color: '#b0b0b0',
    fontSize: 14,
    marginBottom: 5,
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
    padding: 15,
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
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Removed duplicate and unused styles
});

export default ResultDisplay;