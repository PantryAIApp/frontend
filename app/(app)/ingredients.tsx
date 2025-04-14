import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, TextInput, TouchableOpacity, Linking, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import Loader from '@/components/Loader';

const auth = getAuth();
const db = getFirestore();

const apiUrl = process.env.EXPO_PUBLIC_API_URL;


export default function Ingredients() {
  const { ingredients } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);


  let parsedIngredients: string[] = [];

  try {
    parsedIngredients = ingredients ? JSON.parse(ingredients as string) : [];
  } catch (err) {
    console.warn("Failed to parse ingredients:", err);
  }

  const [ingredientList, setIngredientList] = useState<string[]>(parsedIngredients);
  const [newIngredient, setNewIngredient] = useState('');

  const getRecipeAndId = async (ingredients: string[]) => {

    if (!auth.currentUser) {
      alert("Please sign in again to use this feature.");
      return;
    }
    setLoading(true);
    let res: AxiosResponse;
    try {
      res = await axios.post(`${apiUrl}/generate-recipe`, {
        ingredients: ingredients,
      },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          }
        });
    } catch (err: any) {
      alert("Server error: " + err.message + ". Please try again.");
      console.log(err.cause, err.message, err.response?.data);
      setLoading(false);
      return;
    }
    console.log("Success!", res.data);
    if (!('ingredients' in res.data) || !('steps' in res.data) || !('summary' in res.data) || !('name' in res.data)) {
      alert("Please try again. No recipe found.");
      setLoading(false);
      return;
    }
    const out = await addDoc(collection(db, "recipes"), {
      "ingredients": res.data.ingredients,
      "steps": res.data.steps,
      "summary": res.data.summary,
      "name": res.data.name,
      "user": auth.currentUser!.uid,
    })
      .catch(err => {
        alert("Error saving recipe. Please try again.");
        console.log(err.message);
        setLoading(false);
        return;
      });
    if (!out) {
      alert("Error saving recipe. Please try again.");
      setLoading(false);
      return;
    }
    console.log("Recipe saved to database!", out, out.id);
    setLoading(false);
    router.push({
      pathname: '/recipepage',
      params: { recipeId: out.id },
    });
    // go to next screen
    // router.push({
    //     pathname: '/recipe',
    //     params: { recipeId: res.data.recipeId, recipeName: res.data.recipeName },
    // });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredientList(prev => [newIngredient.trim(), ...prev]);
      setNewIngredient('');
    }
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredientList(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    // console.log('Confirmed Ingredients:', ingredientList);
    getRecipeAndId(ingredientList);
    // Add navigation or API logic here
  };

  return (
    <VStack className="flex-1 bg-background">
      <Center className="w-full mt-8 mb-4 relative">
        <Heading size="2xl" className="text-blue-600 font-bold">
          Ingredients
        </Heading>

        {/* Top-right blue text link */}
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.google.com/maps/search/grocery+store+near+me')
          }
        >
          <Text className="text-blue-500 underline">Find Grocery Store</Text>
        </TouchableOpacity>
      </Center>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100, // leave space for floating button
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Input field and Add button in the same row */}
        <View className="flex-row w-full items-center gap-2 mb-4">
          <TextInput
            value={newIngredient}
            onChangeText={setNewIngredient}
            placeholder="Enter ingredient name"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 bg-white"
          />

          <TouchableOpacity
            onPress={handleAddIngredient}
            className="bg-blue-600 px-6 py-2 rounded-md min-w-[90px] items-center"
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>
        {ingredientList.length > 0 ? (
          ingredientList.map((item, index) => (
            <Box
              key={index}
              className="w-full bg-white rounded-lg shadow-md p-4 mb-4"
            >
              <VStack space="sm">
                <Text className="text-lg font-semibold">
                  Ingredient {index + 1}
                </Text>
                <Text className="text-gray-800">{item}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteIngredient(index)}
                  className="self-end mt-2 bg-red-500 px-4 py-2 rounded-md"
                >
                  <Text className="text-white">Delete</Text>
                </TouchableOpacity>
              </VStack>
            </Box>
          ))
        ) : (
          <Text className="text-center text-gray-500 mb-4">No ingredients found.</Text>
        )}
      </ScrollView>

      {/* Floating Confirm Button */}
      <TouchableOpacity
        onPress={handleConfirm}
        className="absolute bottom-6 right-6 bg-black px-6 py-4 rounded-full shadow-lg"
      >
        <Text className="text-white font-semibold">Confirm Ingredients</Text>
      </TouchableOpacity>
      <Loader visible={loading} />
    </VStack>
  );
}
