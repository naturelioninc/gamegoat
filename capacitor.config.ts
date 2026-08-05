import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = "https://games.xmasgoat.com";

const config: CapacitorConfig = {
  appId: "com.xmasgoat.games",
  appName: "Game Goat",
  webDir: "native-shell",
  server: {
    url: productionUrl,
    cleartext: false,
    allowNavigation: ["games.xmasgoat.com"],
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "GameGoat",
  },
  android: {
    allowMixedContent: false,
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
