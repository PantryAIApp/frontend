import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Center } from "@/components/ui/center"
import { Text } from "@/components/ui/text"
import React from 'react';
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

const recipesExample = [
  { id: 1, name: 'asd', ingredients: ['2 apples', '3 pomengrantes'], instructions: ['cut apples', 'slice pomegranites'], summary: 'This is a summary of Recipe 1' },
  { id: 2, name: 'Beef Stroganoff', ingredients: ['1 lb beef', '2 cups mushrooms'], instructions: ['brown beef', 'add mushrooms', 'simmer'], summary: 'Beef Stroganoff is a classic Russian dish that combines tender beef with mushrooms in a creamy sauce, served over egg noodles or rice.' },
  { id: 3, name: 'Macaroni and Cheese', ingredients: ['2 cups macaroni', '1 cup cheese'], instructions: ['boil macaroni', 'add cheese', 'bake'], summary: 'Macaroni and Cheese is a comfort food favorite, featuring pasta mixed with a creamy cheese sauce, often baked to perfection.' },
  { id: 4, name: 'Pizza', ingredients: ['1 pizza crust', '1 cup cheese'], instructions: ['preheat oven', 'add toppings', 'bake'], summary: 'Pizza is a beloved dish originating from Italy, consisting of a round base topped with sauce, cheese, and various toppings, baked until golden.' },
  { id: 5, name: 'Caesar Salad', ingredients: ['1 head romaine lettuce', '1/2 cup Caesar dressing'], instructions: ['chop lettuce', 'add dressing', 'toss'], summary: 'Caesar Salad is a classic salad made with romaine lettuce, croutons, and a creamy Caesar dressing, often topped with Parmesan cheese.' },
  { id: 6, name: 'Chocolate Chip Cookies', ingredients: ['2 cups flour', '1 cup chocolate chips'], instructions: ['mix ingredients', 'bake at 350°F for 10 minutes'], summary: 'Chocolate Chip Cookies are a classic American treat, made with a dough that includes chocolate chips, baked until golden brown.' },
];

const auth = getAuth();
//          <TouchableOpacity onPress={() => signOut(auth)}><Text>xHello!</Text></TouchableOpacity>
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1">
      {/* <Center className="flex-1">
        <TouchableOpacity onPress={() => signOut(auth)}><Text>xHello!</Text></TouchableOpacity>
        <Avatar size="md">
          <AvatarFallbackText>Pantry AI</AvatarFallbackText>
          <AvatarImage
            source={require('@/assets/images/PantryAiProfilePic.png')}
          />
          <AvatarBadge /> 
        </Avatar>
      </Center> */}
      <VStack className="flex-1" space={"md"}>
        <HStack className="w-full" space={"md"} reversed={true}>
          <Menu
            placement="bottom left"
            offset={5}
            trigger={({ ...triggerProps }) => {
              return (
                <TouchableOpacity {...triggerProps} className="flex-row items-center mr-5">
                  <Avatar size="md" className="">
                    {/* <AvatarFallbackText>Pantry AI</AvatarFallbackText> */}
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
          </Menu>
        </HStack>
        {/* <Box className="w-full h-md">
        </Box> */}
        <Center className='w-full'>
          <Heading size="2xl" className="text-center text-blue-600 font-bold">Recipes</Heading>
        </Center>

        {/* <Center className='w-full'>
          <Button size="md" variant="solid" action="primary">
            <Text>Mine</Text>
          </Button>
        </Center> */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}>
          {recipesExample.map((recipe) => (
            <Box key={recipe.id} className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
              <VStack space="md" className="mb-8">
                <Text className="text-lg font-bold">{recipe.name}</Text>
                <Text className="text-gray-600">Summary:</Text>
                <Text className="text-gray-800">{recipe.summary}</Text>
              </VStack>
            </Box>
          ))}
        </ScrollView>
      </VStack>
      <Fab
        size="md"
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
      >
        <FabIcon as={AddIcon} />
        <FabLabel>Add Recipe</FabLabel>
      </Fab>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
