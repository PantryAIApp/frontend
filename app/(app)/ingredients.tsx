import { useLocalSearchParams } from 'expo-router';
import { ScrollView, TextInput, TouchableOpacity, Linking, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Center } from '@/components/ui/center';
import React, { useState } from 'react';

export default function Ingredients() {
  const { ingredients } = useLocalSearchParams();

  let parsedIngredients: string[] = [];

  try {
    parsedIngredients = ingredients ? JSON.parse(ingredients as string) : [];
  } catch (err) {
    console.warn("Failed to parse ingredients:", err);
  }

  const [ingredientList, setIngredientList] = useState<string[]>(parsedIngredients);
  const [newIngredient, setNewIngredient] = useState('');

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
    console.log('Confirmed Ingredients:', ingredientList);
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

    </VStack>
  );
}
