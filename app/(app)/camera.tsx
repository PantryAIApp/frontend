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
import axios, { AxiosError } from "axios";
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent, State } from "react-native-gesture-handler";

const auth = getAuth();

export default function Camera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const cameraRef = useRef<CameraView>(null);

    const opacity = useSharedValue(0);

    // Add state for zoom level
    const [zoom, setZoom] = useState(0);
    const baseZoom = useSharedValue(0);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Handle pinch gesture for zoom
    const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
        // Calculate new zoom based on pinch scale
        // Clamp zoom between 0 and 1
        const newZoom = Math.min(Math.max(baseZoom.value * event.nativeEvent.scale, 0), 1);
        setZoom(newZoom);
    };

    const onPinchHandlerStateChange = (event: PinchGestureHandlerGestureEvent) => {
        // When pinch ends, update the base zoom value for the next pinch
        if (event.nativeEvent.state === State.END) {
            baseZoom.value = zoom;
        }
    };

    const triggerShutter = () => {
        // This sequence fades out then fades in once
        opacity.value = withSequence(
            withTiming(1, { duration: 200 }), // Fade to transparent quickly (simulate shutter flash)
            withTiming(0, { duration: 200 })  // Fade back to opaque
        );
    };

    const getIngredients = async (formData: FormData) => {
        if (!auth.currentUser) {
            alert("Please sign in again to use this feature.");
            return;
        }
        console.log(await auth.currentUser.getIdToken());
        setLoading(true);
        axios.post(`${apiUrl}/extract-ingredients`, formData, {
            headers: {
                Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
                'Content-Type': 'multipart/form-data',
            }
        }).then(res => {
            if (res.data.ingredients.length == 0) {
                alert("No ingredients found in image. Please try again.");
                setLoading(false);
                return;
            }
            // go to next screen
            console.log("Success!", res.data.ingredients);
            setLoading(false);
        })
            .catch((err: AxiosError) => {
                // alert("Server error: " + err.message + ". Please try again.");
                alert("There doesn't appear to be any food here");
                console.log(err.cause, err.message, err.response?.data);
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const selectImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            aspect: [4, 3],
            quality: 1,
        });
        if (result.canceled) {
            return;
        }
        if (!auth.currentUser) {
            alert("Please sign in again to use this feature.");
            return;
        }

        // logic to support dif types of images:
        // Get the first selected asset.
        const asset = result.assets[0];
        const uri = asset.uri;

        // Extract the file name from the URI.
        const fileName = uri.split('/').pop() || 'photo';

        // Extract the file extension and normalize it.
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

        // Map the file extension to a MIME type.
        let mimeType: string;
        switch (fileExtension) {
            case 'jpg':
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
            case 'png':
                mimeType = 'image/png';
                break;
            case 'gif':
                mimeType = 'image/gif';
                break;
            case 'heic':
            case 'heif':
                mimeType = 'image/heic';
                break;
            default:
                // Fallback to a generic image type.
                mimeType = `image/${fileExtension}`;
        }

        const formData = new FormData();
        // images on android are all jpegs iirc
        console.log(fileName, mimeType, uri);
        formData.append('image', {
            uri: uri,
            name: fileName,
            type: mimeType,
        } as any);
        await getIngredients(formData);
    }

    const takePhoto = async () => {
        triggerShutter();
        const picture = await cameraRef.current?.takePictureAsync();
        if (!auth.currentUser) {
            alert("Please sign in again to use this feature.");
            return;
        }
        if (!picture) {
            alert("Error with picture taking. Please try again.");
            return;
        }
        const formData = new FormData();
        formData.append('image', {
            uri: picture.uri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        } as any);
        console.log(await auth.currentUser.getIdToken());
        await setTimeout(() => { }, 450); // wait for animation to finish
        await getIngredients(formData);
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className='flex-1 justify-center'>
                <PinchGestureHandler
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchHandlerStateChange}
                >
                    <CameraView ref={cameraRef} style={styles.camera} facing={facing} zoom={zoom}>
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
                            <TouchableOpacity className='align-items-center' onPress={selectImage}>
                                <Ionicons name="document-outline" size={50} color="white" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </PinchGestureHandler>
                {/* The flash overlay */}
                <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, { backgroundColor: 'white' }]} pointerEvents="none" />

                <Loader visible={loading} />
            </View>
        </GestureHandlerRootView>
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
