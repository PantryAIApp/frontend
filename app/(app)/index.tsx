import { Image, StyleSheet, Platform, TouchableOpacity, Linking, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Center } from "@/components/ui/center"
import { Text } from "@/components/ui/text"
import React, { useContext, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { Heading } from '@/components/ui/heading';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from "@/components/ui/icon";
// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { RefreshType } from '@/contexts/refresh_context';

import * as jotaistates from '@/contexts/jotaistates';
import { useAtom } from 'jotai';
import Loader from '@/components/Loader';


interface RecipeToView {
  id: string,
  name: string,
  summary: string,
  user: string
  createdAt: Date
};

const recipesExample = [
  { id: 1, name: 'asd', ingredients: ['2 apples', '3 pomengrantes'], instructions: ['cut apples', 'slice pomegranites'], summary: 'This is a summary of Recipe 1' },
  { id: 2, name: 'Beef Stroganoff', ingredients: ['1 lb beef', '2 cups mushrooms'], instructions: ['brown beef', 'add mushrooms', 'simmer'], summary: 'Beef Stroganoff is a classic Russian dish that combines tender beef with mushrooms in a creamy sauce, served over egg noodles or rice.' },
  { id: 3, name: 'Macaroni and Cheese', ingredients: ['2 cups macaroni', '1 cup cheese'], instructions: ['boil macaroni', 'add cheese', 'bake'], summary: 'Macaroni and Cheese is a comfort food favorite, featuring pasta mixed with a creamy cheese sauce, often baked to perfection.' },
  { id: 4, name: 'Pizza', ingredients: ['1 pizza crust', '1 cup cheese'], instructions: ['preheat oven', 'add toppings', 'bake'], summary: 'Pizza is a beloved dish originating from Italy, consisting of a round base topped with sauce, cheese, and various toppings, baked until golden.' },
  { id: 5, name: 'Caesar Salad', ingredients: ['1 head romaine lettuce', '1/2 cup Caesar dressing'], instructions: ['chop lettuce', 'add dressing', 'toss'], summary: 'Caesar Salad is a classic salad made with romaine lettuce, croutons, and a creamy Caesar dressing, often topped with Parmesan cheese.' },
  { id: 6, name: 'Chocolate Chip Cookies', ingredients: ['2 cups flour', '1 cup chocolate chips'], instructions: ['mix ingredients', 'bake at 350°F for 10 minutes'], summary: 'Chocolate Chip Cookies are a classic American treat, made with a dough that includes chocolate chips, baked until golden brown.' },
];


// maybe can save uid after caching in the onAuthStateChanged and then we have local storage!!
const auth = getAuth();
const db = getFirestore();
const citiesRef = collection(db, "recipes");

export default function HomeScreen() {
  const [recipes, setRecipes] = React.useState<RecipeToView[]>([]);
  const [darkMode, setDarkMode] = useAtom(jotaistates.darkModeAtom);
  const [loading, setLoading] = React.useState(true);
  // const { refresh } = params as { refresh: string | null };

  const refreshContext = useContext(RefreshType);
  if (!refreshContext) throw new Error("RefreshContext must be used within a RefreshProvider");

  const { refresh, setRefresh } = refreshContext;

  const getRecipes = async () => {
    if (!auth.currentUser) {
      console.log("Current user not signed in");
      alert("Current user not signed in");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(citiesRef, where("user", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recipesArray: RecipeToView[] = [];
      if (auth.currentUser == null || auth.currentUser == undefined) {
        console.log("Current user not signed in");
        alert("Current user not signed in");
        setLoading(false);
        return;
      }
      console.log("working to get queries");
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        recipesArray.push({
          user: auth.currentUser!.uid,
          id: doc.id,
          name: doc.data().name || 'Recipe Details',
          summary: doc.data().summary || "",
          createdAt: doc.data().createdAt || new Date(),
        });
      });
      recipesArray.sort((a, b) => {
        if (a.createdAt < b.createdAt) { return 1; }
        else if (a.createdAt == b.createdAt) { return 0; }
        else { return -1; }
      }); // reverse order
      console.log(recipesArray);
      setRecipes(recipesArray);
    }
    catch (error) {
      console.error("Error getting recipes: ", error);
      alert("Error getting recipes: " + error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRecipes();
  }, []);

  useEffect(() => {
    getRecipes();
  }, [refresh, auth.currentUser]);
  // dark mode option
  /*
               <MenuItem key="Change theme" textValue="Change theme" onPress={() => {
              setDarkMode(!darkMode);
              console.log(darkMode, ' is dark mode');
            }}>
              <MenuItemLabel size="sm">Change theme</MenuItemLabel>
            </MenuItem>  // add later once fully supported
  */
  return (
    <SafeAreaView className="flex-1" key={refresh ?? 'default_main_key'}>
      <VStack className="flex-1" space={"md"}>
        {/* <HStack className="w-full" space={"md"} reversed={true}>
          <Menu
            placement="bottom left"
            offset={5}
            trigger={({ ...triggerProps }) => {
              return (
                <TouchableOpacity {...triggerProps} className="flex-row items-center mr-5">
                  <Avatar size="md" className="">
                    <AvatarImage
                      source={require('@/assets/images/new_icon.png')}
                    />
                    <AvatarBadge />
                  </Avatar>
                </TouchableOpacity>
              )
            }}>
            <MenuItem key="Sign out" textValue="Sign out" onPress={() => signOut(auth)}>
              <MenuItemLabel size="sm">Sign out</MenuItemLabel>
            </MenuItem>
            <MenuItem key="tos" textValue="Terms of Service" onPress={() => Linking.openURL('https://www.pantryiq.co/terms')}>
              <MenuItemLabel size="sm">Terms of Service</MenuItemLabel>
            </MenuItem>
            <MenuItem key="privacy" textValue="Privacy Policy" onPress={() => Linking.openURL('https://www.pantryiq.co/privacy')}>
              <MenuItemLabel size="sm">Privacy Policy</MenuItemLabel>
            </MenuItem>
          </Menu>
        </HStack> */}
        <HStack className="w-full items-center">
          <View className="flex-1 max-w-[25%]" />
          <View className='flex-1 justify-center items-center'>
            <Heading size="2xl" className="text-center text-blue-600 font-bold">Recipes</Heading>
          </View>
          <View className="flex-1 max-w-[25%] items-end">
            <Menu
              placement="bottom left"
              offset={5}
              trigger={({ ...triggerProps }) => {
                return (
                  <TouchableOpacity {...triggerProps} className="flex-row items-center mr-5">
                    <Avatar size="md" className="">
                      <AvatarImage
                        source={require('@/assets/images/new_icon.png')}
                      />
                      <AvatarBadge />
                    </Avatar>
                  </TouchableOpacity>
                )
              }}>
              <MenuItem key="Sign out" textValue="Sign out" onPress={() => signOut(auth)}>
                <MenuItemLabel size="sm">Sign out</MenuItemLabel>
              </MenuItem>
              <MenuItem key="tos" textValue="Terms of Service" onPress={() => Linking.openURL('https://www.pantryiq.co/terms')}>
                <MenuItemLabel size="sm">Terms of Service</MenuItemLabel>
              </MenuItem>
              <MenuItem key="privacy" textValue="Privacy Policy" onPress={() => Linking.openURL('https://www.pantryiq.co/privacy')}>
                <MenuItemLabel size="sm">Privacy Policy</MenuItemLabel>
              </MenuItem>
            </Menu>
          </View>
        </HStack>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}>
          {recipes.length > 0 || loading ? recipes.map((recipe) => (
            <TouchableOpacity key={recipe.id} onPress={() => router.push({ pathname: '/recipepage', params: { recipeId: recipe.id } })}>
              <Box className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
                <VStack space="md" className="mb-8">
                  <Text className="text-lg font-bold">{recipe.name}</Text>
                  <Text className="text-gray-600">Summary:</Text>
                  <Text className="text-gray-800">{recipe.summary}</Text>
                </VStack>
              </Box>
            </TouchableOpacity>
          )) : (
            <Center>
              <Text>Add a recipe to get started!</Text>
            </Center>
          )}
        </ScrollView>
      </VStack>
      <Fab
        size="md"
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
        onPress={() => router.push('/camera')}
      >
        <FabIcon as={AddIcon} />
        <FabLabel>Add Recipe</FabLabel>
      </Fab>
      <Loader visible={loading} />
    </SafeAreaView>
  );
}
