import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Text } from "@/components/ui/text";
import CustomLoader from "@/components/Loader";

const db = getFirestore();

export default function RecipePage() {
    const params = useLocalSearchParams();
    const { recipeId } = params as { recipeId: string };
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [steps, setSteps] = useState<string[]>([]);
    const [summary, setSummary] = useState<string>(""); // may not be needed
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (recipeId) {
            console.log("Recipe ID:", recipeId);
        } else {
            alert("No recipe ID provided to the recipe page.");
            console.error("No recipe ID provided in the URL.");
        }
        // Fetch recipe details using the recipeId here
        // Example: fetchRecipeDetails(recipeId);
        getDoc(doc(db, "recipes", recipeId))
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const recipeData = docSnapshot.data();
                    // console.log("Recipe Data:", recipeData);
                    setIngredients(recipeData.ingredients || []);
                    setSteps(recipeData.steps || []);
                    setSummary(recipeData.summary || ""); // may not be needed
                } else {
                    console.error("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error fetching recipe:", error);
            })
            .finally(() => setLoading(false));
        // Cleanup function to avoid memory leaks
    }, []);

    return (
        <View>
            <Text>Ingredients:</Text>
            <FlatList
                data={ingredients}
                renderItem={({ item }) => <Text>{item}</Text>}
                keyExtractor={(item, index) => index.toString()}
            />
            <Text>Steps:</Text>
            <FlatList
                data={steps}
                renderItem={({ item }) => <Text>{item}</Text>}
                keyExtractor={(item, index) => index.toString()}
            />
            <Text>Summary: {summary}</Text>
            <CustomLoader visible={loading} />
        </View>
    )
}
