export default () => ({
  expo: {
    name: "Pantry AI",
    slug: "pantry-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/new_icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/new_icon.png",
      resizeMode: "contain",
      backgroundColor: "#2b2433"
    },
    ios: {
      infoPlist: {
        NSCameraUsageDescription: "This app requires access to the camera."
      },
      supportsTablet: true,
      bundleIdentifier: "com.pantryai.app",
    },
    android: {
      permissions: [
        "android.permission.CAMERA"
      ],
      package: "com.pantryai.app",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera"
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "d9bd963e-0a6a-4214-a8b6-4daf920a70d3"
      },
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      }
    },
    owner: "pantry-ai"
  }
});
