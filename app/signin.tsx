import React, { useState } from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { FormControl, FormControlError, FormControlLabel, FormControlErrorText } from '@/components/ui/form-control';
import {
    Input, InputField,
    InputIcon,
    InputSlot
} from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { Center } from '@/components/ui/center';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import AuthPage from '@/components/authpage';

export default function SignIn() {
    return <AuthPage signIn={true} router={router} />;
};
