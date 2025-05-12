import axios from "axios";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useState } from "react";

const auth = getAuth();
const db = getFirestore();
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export function useRecipe(errorHandler: (message: string) => void, loadingDefault: boolean = false) {
  const [loading, setLoading] = useState(false);
  
  const generateRecipe = async (ingredients: string[]) => {
    if (!auth.currentUser) {
      errorHandler("Please sign in again to use this feature.");
      return null;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post(
        `${apiUrl}/generate-recipe`,
        { ingredients },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          }
        }
      );
      
      if (!('ingredients' in res.data) || !('steps' in res.data) || 
          !('summary' in res.data) || !('name' in res.data)) {
        errorHandler("Please try again. No recipe found.");
        setLoading(false);
        return null;
      }
      
      const docRef = await addDoc(collection(db, "recipes"), {
        ingredients: res.data.ingredients,
        steps: res.data.steps,
        summary: res.data.summary,
        name: res.data.name,
        user: auth.currentUser.uid,
        createdAt: new Date(),
      });
      
      console.log("Recipe saved to database!", docRef.id);
      return docRef.id;
    } catch (err: any) {
      errorHandler(err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, generateRecipe};
}