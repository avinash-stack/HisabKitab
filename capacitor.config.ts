import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.avinash.hisabkitab',
  appName: 'HisabKitab',
  webDir: 'dist',
  server: {
    url: "https://hisabkitab-omega.vercel.app",
    cleartext: true
  },
  plugins: {
    App: {
      // Handles deep link return after Google login
      launchUrl: 'com.avinash.hisabkitab://login-callback'
    }
  }
};

export default config;