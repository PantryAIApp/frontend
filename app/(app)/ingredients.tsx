import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import Loader from '@/components/Loader';
import { Plus, Trash } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView className="flex-1 bg-background">
      <VStack className="flex-1 bg-background">
        {/* <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-4 left-4 z-10 flex flex-row items-center"
        >
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
          <Text className="text-blue-600 font-medium ml-1">Back</Text>
        </TouchableOpacity>
        <Center className="w-full mb-4 relative">
          <HStack>
            <Heading size="2xl" className="text-blue-600 font-bold">
              Ingredients
            </Heading>
          </HStack>
        </Center> */}
        <HStack className='w-full items-center'>
          <View className='flex-1 max-w-[25%]'>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex flex-row items-center pl-1"
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              <Text className="text-blue-600 font-medium ml-1">Back</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center justify-center">
            <Heading size="2xl" className="text-blue-600 font-bold">
              Ingredients
            </Heading>
          </View>
          <View className="flex-1 max-w-[25%]" />
        </HStack>

        {/* Top-right blue text link */}
        {/* <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.google.com/maps/search/grocery+store+near+me')
          }
        >
          <Text className="text-blue-500 underline">Find Grocery Store</Text>
        </TouchableOpacity> */}
        {/* </Center> */}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 10,
            paddingLeft: 20,
            paddingRight: 20,
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
              <Plus color="white" size={20} />
            </TouchableOpacity>
          </View>
          {ingredientList.length > 0 ? (
            ingredientList.map((item, index) => (
              <Box key={index} className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
                <HStack className='w-full justify-between items-center'>
                  <Text className="text-gray-800 flex-1">{item}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteIngredient(index)}
                    className=""
                  >
                    <Trash color="red" size={20} />
                  </TouchableOpacity>
                </HStack>
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
    </SafeAreaView>
  );
}
