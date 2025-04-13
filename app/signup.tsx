import AuthPage from "@/components/authpage";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";



export default function SignUp() {
    return <AuthPage signIn={false} router={router} />
}
