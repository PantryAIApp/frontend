import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { getAuth } from "firebase/auth";
import { TouchableOpacity, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Loader from "@/components/Loader";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import axios, { AxiosError, AxiosResponse } from "axios";
import * as ImagePicker from 'expo-image-picker';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, State } from "react-native-gesture-handler";

// import { getFirestore } from "firebase/firestore";

const auth = getAuth();
// const db = getFirestore();

const AnimatedCameraView = Animated.createAnimatedComponent(CameraView);

export default function Camera() {
    const insets = useSafeAreaInsets();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const cameraRef = useRef<CameraView>(null);

    const opacity = useSharedValue(0);


    // Using shared values for smooth native updates.
    const zoomShared = useSharedValue(0);
    const baseZoom = useSharedValue(0);

    const animatedCameraProps = useAnimatedProps(() => ({
        zoom: zoomShared.value,
    }));


    // const animatedStyle = useAnimatedStyle(() => ({
    //     opacity: opacity.value,
    // }));

    // Update zoom as the pinch gesture updates.
    const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
        const { scale } = event.nativeEvent;
        let newZoom = baseZoom.value + (scale - 1);
        newZoom = Math.min(Math.max(newZoom, 0), 1);
        zoomShared.value = newZoom;
    };

    const onPinchHandlerStateChange = (event: PinchGestureHandlerGestureEvent) => {
        const { state } = event.nativeEvent;
        if (state === State.BEGAN) {
            baseZoom.value = zoomShared.value;
        }
    };

    // const triggerShutter = () => {
    //     // This sequence fades out then fades in once
    //     opacity.value = withSequence(
    //         withTiming(1, { duration: 200 }), // Fade to transparent quickly (simulate shutter flash)
    //         withTiming(0, { duration: 200 })  // Fade back to opaque
    //     );
    // };

    const getIngredients = async (formData: FormData) => {
        console.log('getting ingredients...');
        if (!auth.currentUser) {
            alert("Please sign in again to use this feature.");
            setLoading(false);
            return;
        }
        // setLoading(true); // not necessary but doesn't hurt
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
            // route to new page
            router.push({
                pathname: "/ingredients",
                params: {
                    ingredients: JSON.stringify(res.data.ingredients),
                },
            });

            // do req and other logic here in a function and directly navigate to that component,
            // later just move to the next screen.
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
        setLoading(true);
        await getIngredients(formData);
    }

    const takePhotoWrapper = async () => {
        // triggerShutter();
        setTimeout(() => {
            if (!loading) {
                setLoading(true);
            }
        }, 1000);
        takePhoto();
    };

    const takePhoto = async () => {
        const picture = await cameraRef.current?.takePictureAsync();
        if (!auth.currentUser) {
            setLoading(false);
            alert("Please sign in again to use this feature.");
            return;
        }
        if (!picture) {
            setLoading(false);
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
        await getIngredients(formData);
    };

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text>Camera permissions are required to use this feature</Text>
                <Button onPress={requestPermission} className="mt-4" variant="solid" size="md" action="primary">
                    <ButtonText>Grant Permissions</ButtonText>
                </Button>
            </SafeAreaView>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    //style={[styles.container, animatedStyle]}
    return (
        <View className='flex-1 justify-center'>
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-4 z-10 bg-black/40 py-2 px-4 rounded-full flex flex-row items-center"
                style={{
                    top: insets.top + 10,
                }}
            >
                <Ionicons name="chevron-back" size={20} color="white" />
                <Text className="text-white ml-1 font-medium">Back</Text>
            </TouchableOpacity>
            <AnimatedCameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                animatedProps={animatedCameraProps}
            />
            <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
            >
                <Animated.View style={[StyleSheet.absoluteFill, { bottom: 100 }]} />
            </PinchGestureHandler>
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={toggleCameraFacing} className='align-items-center'>
                    <Ionicons name="camera-reverse-outline" size={50} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhotoWrapper} className='align-items-center'>
                    <Ionicons name={"radio-button-on-outline"} size={50} color={"white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={selectImage} className='align-items-center'>
                    <Ionicons name="document-outline" size={50} color="white" />
                </TouchableOpacity>
            </View>
            {/* <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, { backgroundColor: 'white' }]} pointerEvents="none" /> */}
            <Loader visible={loading} />
        </View>
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
