import { Redirect, router, Stack, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import "../../firebaseConfig";

import { User, getAuth, onAuthStateChanged } from "firebase/auth";



export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const auth = getAuth();
  useEffect(() => {
    // onAuthStateChanged(auth, setUser);
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        // console.log("HERE!");
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    // Optionally, return a loading indicator here
    return null;
  }

  return (
    <>
      {
        user ? (
          < Stack >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="camera" options={{ headerShown: false }} />
            <Stack.Screen name="recipepage" options={{ headerShown: false }} />
          </Stack >
        ) :
          (<Redirect href="/signin" />)
      }
    </>

  );
}
