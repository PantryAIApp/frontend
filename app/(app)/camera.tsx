import { CameraType, CameraView, PermissionResponse, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { getAuth, signOut } from "firebase/auth";
import { useRef, useState } from "react";


const auth = getAuth();

export default function Camera() {
};
