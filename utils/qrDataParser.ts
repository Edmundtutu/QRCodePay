export interface ParsedQRData {
  type: 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'contact' | 'apk';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    domain?: string;
    ssid?: string;
    password?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const parseQRContent = (data: string): ParsedQRData => {
  // Check for APK links
  if (data.includes('.apk') || data.includes('google.drive.myappapk.debug')) {
    return {
      type: 'apk',
      content: data,
      metadata: {
        domain: new URL(data).hostname,
      },
    };
  }

  // Check for URLs
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return {
      type: 'url',
      content: data,
      metadata: {
        domain: new URL(data).hostname,
      },
    };
  }

  // Check for email addresses
  if (data.includes('@') && data.includes('.')) {
    return {
      type: 'email',
      content: data,
      metadata: {
        email: data,
      },
    };
  }

  // Check for phone numbers (simple check for now)
  if (/^\+?[\d\s-]{10,}$/.test(data)) {
    return {
      type: 'phone',
      content: data,
      metadata: {
        phone: data,
      },
    };
  }

  // Check for WiFi credentials (WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;;)
  if (data.startsWith('WIFI:')) {
    const wifiData = data.substring(5).split(';');
    const ssid = wifiData.find(item => item.startsWith('S:'))?.substring(2);
    const password = wifiData.find(item => item.startsWith('P:'))?.substring(2);

    return {
      type: 'wifi',
      content: data,
      metadata: {
        ssid,
        password,
      },
    };
  }

  // Check for vCard contact information
  if (data.startsWith('BEGIN:VCARD')) {
    const lines = data.split('\n');
    const name = lines.find(line => line.startsWith('FN:'))?.substring(3);
    const email = lines.find(line => line.startsWith('EMAIL:'))?.substring(6);
    const phone = lines.find(line => line.startsWith('TEL:'))?.substring(4);

    return {
      type: 'contact',
      content: data,
      metadata: {
        name,
        email,
        phone,
      },
    };
  }

  // Default to plain text
  return {
    type: 'text',
    content: data,
  };
}; 