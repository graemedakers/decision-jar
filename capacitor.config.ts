import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datejar.app',
  appName: 'Decision Jar',
  webDir: 'public',
  server: {
    url: 'https://spinthejar.com', // Production domain
    cleartext: true
  }
};

export default config;
