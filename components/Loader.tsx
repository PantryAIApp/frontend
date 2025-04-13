// CustomLoader.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Fold } from "react-native-animated-spinkit";

export default function CustomLoader({ visible }: { visible: boolean }) {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const [renderLoader, setRenderLoader] = useState(visible);

    useEffect(() => {
        if (visible) {
            setRenderLoader(true);
        }

        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (!visible) {
                setRenderLoader(false);
            }
        });
    }, [visible]);

    if (!renderLoader) return null;

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                styles.container,
                { opacity: fadeAnim }
            ]}
            pointerEvents={visible ? "auto" : "none"}
        >
            <Fold size={50} color="#0000ff" />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
});
