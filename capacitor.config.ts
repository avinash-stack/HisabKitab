import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.avinash.hisabkitab',
  appName: 'HisabKitab',
  webDir: 'dist',
  server: {
    url: "https://hisabkitab-omega.vercel.app/",
    cleartext: true
  }
};

export default config;
