import { CameraType, CameraView, PermissionResponse, useCameraPermissions } from "expo-camera";
import { getAuth, signOut } from "firebase/auth";
import { TouchableOpacity, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Loader from "@/components/Loader";
import { router, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

const auth = getAuth();

export default function Camera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();

    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const triggerShutter = () => {
        // This sequence fades out then fades in once
        opacity.value = withSequence(
            withTiming(0, { duration: 300 }), // Fade to transparent quickly (simulate shutter flash)
            withTiming(1, { duration: 300 })  // Fade back to opaque
        );
    };

    const takePhoto = async () => {
        triggerShutter();
    };

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-white">Camera permissions are required to use this feature</Text>
                <Button onPress={requestPermission} className="mt-4" variant="solid" size="md" action="primary">
                    <ButtonText>Grant Permissions</ButtonText>
                </Button>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }
    //style={[styles.container, animatedStyle]}
    return (
        <Animated.View className='flex-1 justify-center' style={animatedStyle}>
            <CameraView style={styles.camera} facing={facing}>
                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={toggleCameraFacing} className='align-items-center'>
                        <Ionicons name="camera-reverse-outline" size={50} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={takePhoto}
                        className='align-items-center'
                    >
                        <Ionicons
                            name={"radio-button-on-outline"}
                            size={50}
                            color={"white"}
                        />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
});
