import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = "https://app.xmasgoat.com/";

const config: CapacitorConfig = {
  appId: "com.xmasgoat.games",
  // Keep the existing Play package ID so the unified product ships as an
  // update to the Game Goat test application rather than a second listing.
  appName: "XmasGoat",
  webDir: "native-shell",
  server: {
    url: productionUrl,
    cleartext: false,
    errorPath: "index.html",
    // Only the app host. The party and games subdomains are retired; any
    // other link (the gift catalogue, a shop) opens in the phone's browser.
    allowNavigation: ["app.xmasgoat.com"],
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "XmasGoat",
  },
  android: {
    allowMixedContent: false,
    adjustMarginsForEdgeToEdge: "auto",
    backgroundColor: "#fffdf7",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#fffdf7",
      overlaysWebView: false,
    },
  },
};

export default config;
