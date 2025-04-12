import { View, Text, StyleSheet } from "react-native";



export default function SignUp() {


    return (
        <View style={styles.container}>
            <Text className="text-typography-0 font-bold">Sign Up</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});
