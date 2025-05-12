import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import CustomLoader from "@/components/Loader";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { ArrowLeftIcon } from "@/components/ui/icon";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { HomeIcon, RefreshCcw } from "lucide-react-native";
import { RefreshType } from "@/contexts/refresh_context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipe } from "@/hooks/useRecipe";
import showNewToast from "@/components/ToastWrapper";
import { useToast } from "@/components/ui/toast";

const db = getFirestore();

export default function RecipePage() {
    const params = useLocalSearchParams();
    const { recipeId, ingredientsFromPage } = params as { recipeId: string, ingredientsFromPage?: string };
    const [parsedIngredientsFromPage, setParsedIngredientsFromPage] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [steps, setSteps] = useState<string[]>([]);
    const [summary, setSummary] = useState<string>(""); // may not be needed
    const [name, setName] = useState<string>(""); // may not be needed
    // const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { loading, generateRecipe, setLoading } = useRecipe((message)=>showNewToast(toast,'Error',message,'error'), true);

    const refreshContext = useContext(RefreshType);
    if (!refreshContext) throw new Error("RefreshContext must be used within a RefreshProvider");

    const { refresh, setRefresh } = refreshContext;


    useEffect(() => {
        // Clear previous data when loading a new recipe
        setIngredients([]);
        setSteps([]);
        setSummary("");
        setName("");
        setLoading(true);
        if (recipeId) {
            console.log("Recipe ID:", recipeId);
        } else {
            alert("No recipe ID provided to the recipe page.");
            console.error("No recipe ID provided in the URL.");
            setLoading(false);
        }
        // Fetch recipe details using the recipeId here
        // Example: fetchRecipeDetails(recipeId);
        if (ingredientsFromPage) {
            // console.log("Ingredients from page:", ingredientsFromPage);
            try {
                const parsedIngredients = ingredientsFromPage.split(",").map((ingredient: string) => ingredient.trim());
                setParsedIngredientsFromPage(parsedIngredients);
                console.log("Parsed Ingredients:", parsedIngredients);
            }
            catch (error: any) {
                //console.error("Error parsing ingredients:", error);
            }
        }
        getDoc(doc(db, "recipes", recipeId))
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const recipeData = docSnapshot.data();
                    // console.log("Recipe Data:", recipeData);
                    setIngredients(recipeData.ingredients || []);
                    setSteps(recipeData.steps || []);
                    setSummary(recipeData.summary || ""); // may not be needed
                    setName(recipeData.name || "Recipe Details"); // may not be needed
                } else {
                    console.error("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error fetching recipe:", error);
            })
            .finally(() => {
                // console.log(steps, ingredients, summary);
                setLoading(false);
            });
        // Cleanup function to avoid memory leaks
    }, []);

    useEffect(() => {
        console.log("State updated:", { ingredients, steps, summary, loading });
    }, [ingredients, steps, summary]);

    return (
        <SafeAreaView className="flex-1">
            <VStack className="flex-1" space="md">
                <Center className="w-full px-4 mt-7">
                    <Heading size="xl" className="text-blue-600 font-bold">{name}</Heading>
                    {/* <TouchableOpacity onPress={() => router.back()}>
                        <Box className="p-2 rounded-full bg-blue-100">
                            <ArrowLeftIcon color="blue" />
                        </Box>
                    </TouchableOpacity> */}
                </Center>
                <Fab
                    size="md"
                    placement="bottom right"
                    isHovered={false}
                    isDisabled={false}
                    isPressed={false}
                    onPress={() => {
                        // router.replace('/(app)');
                        setRefresh(Date.now().toString());
                        router.dismissAll();
                        // router.push({ pathname: '/(app)', params: { refresh: Date.now().toString() } });
                    }}
                >
                    <FabIcon as={HomeIcon} />
                </Fab>
                {parsedIngredientsFromPage.length > 0 && <Fab
                    size="md"
                    placement="bottom left"
                    isHovered={false}
                    isDisabled={false}
                    isPressed={false}
                    onPress={async () => {
                        const id = await generateRecipe(ingredients);
                        if (id) {
                            router.replace({ pathname: '/recipepage', params: { recipeId: id, ingredientsFromPage: ingredients } });
                        }
                    }}
                >
                    <FabIcon as={RefreshCcw} />
                </Fab>}

                {!loading &&(
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            paddingTop: 16,
                            paddingHorizontal: 16,
                            paddingBottom: 100,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Include debug info in development */}
                        {/* {debugInfo()} */}

                        {/* {error ? (
                            <Box className="w-full bg-red-100 rounded-lg shadow-md p-4 mb-6">
                                <Text className="text-red-600 font-bold">Error:</Text>
                                <Text className="text-red-800">{error}</Text>
                            </Box>
                        ) : null} */}

                        {summary ? (
                            <Box className="w-full bg-white rounded-lg shadow-md p-4 mb-6">
                                <Text className="text-gray-600 mb-2 font-bold">Summary:</Text>
                                <Text className="text-gray-800">{summary}</Text>
                            </Box>
                        ) : null}

                        <Box className="w-full bg-white rounded-lg shadow-md p-4 mb-6">
                            <Text className="text-gray-600 font-bold text-lg mb-4">Ingredients:</Text>
                            {ingredients.length > 0 ? (
                                <VStack space="sm">
                                    {ingredients.map((ingredient, index) => (
                                        <HStack key={index} space="sm" className="items-center">
                                            <Box className="w-2 h-2 rounded-full bg-blue-600" />
                                            <Text className="text-gray-800">{ingredient}</Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            ) : (
                                <Text className="text-gray-500 italic">No ingredients found</Text>
                            )}
                        </Box>

                        <Box className="w-full bg-white rounded-lg shadow-md p-4 mb-6">
                            <Text className="text-gray-600 font-bold text-lg mb-4">Steps:</Text>
                            {steps.length > 0 ? (
                                <VStack space="md">
                                    {steps.map((step, index) => (
                                        <HStack key={index} space="sm" className="items-start">
                                            <Center className="w-8 h-8 rounded-full bg-blue-600 mt-1">
                                                <Text className="text-white font-bold">{index + 1}</Text>
                                            </Center>
                                            <Text className="text-gray-800 flex-1 self-center">{step}</Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            ) : (
                                <Text className="text-gray-500 italic">No steps found</Text>
                            )}
                        </Box>
                    </ScrollView>
                )}
            </VStack>
            <CustomLoader visible={loading} />
        </SafeAreaView>
    )
}
