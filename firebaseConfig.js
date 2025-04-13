// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//@ts-ignore
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
// Optionally import the services that you want to use
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


import Constants from 'expo-constants';


const firebaseConfig = Constants.expoConfig.extra.firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
