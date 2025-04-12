import { View, Text, StyleSheet } from "react-native";



export default function SignIn() {


    return (
        <View style={styles.container}>
            <Text className="text-typography-0 font-bold">Sign In</Text>
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
