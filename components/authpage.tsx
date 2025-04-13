import React, { useState } from 'react';
import { View, TouchableOpacity, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { FormControl, FormControlError, FormControlLabel, FormControlErrorText, FormControlLabelText } from '@/components/ui/form-control';
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
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Router } from 'expo-router';

export default function AuthPage({ signIn, router }: { signIn: boolean, router: Router }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const mainButtonText = signIn ? "Sign In" : "Sign Up";
    const mainButtonLoadingText = signIn ? "Signing In" : "Signing Up";


    const validateEmail = (text: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmail(text);
        setEmailError(emailRegex.test(text) ? '' : 'Please enter a valid email');
    };

    const validatePassword = (text: string) => {
        setPassword(text);
        setPasswordError(text.length >= 8 ? '' : 'Password must be at least 8 characters');
    };


    async function handleAuth() {
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (emailError || passwordError) {
            return;
        }
        setLoading(true);
        try {
            if (signIn) {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
            }
            else {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
            }
            router.replace("/(app)");
        } catch (error) {
            setLoading(false);
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <Box className="flex-1 justify-center p-6">
                    <Center className="mb-8">
                        <Heading size="2xl" className="text-center text-blue-600 font-bold">{signIn ? "Sign In" : "Sign Up"}</Heading>
                    </Center>

                    <VStack space="md" className="mb-8">
                        <FormControl isInvalid={!!emailError}>
                            <FormControlLabel>
                                <FormControlLabelText>Email</FormControlLabelText>
                            </FormControlLabel>
                            <Input
                                className="bg-gray-50 border rounded-lg"
                                size="lg"
                            >
                                <InputField
                                    placeholder="email"
                                    value={email}
                                    onChangeText={validateEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </Input>
                            {emailError ? (
                                <FormControlError>
                                    <FormControlErrorText>{emailError}</FormControlErrorText>
                                </FormControlError>
                            ) : null}
                        </FormControl>

                        <FormControl isInvalid={!!passwordError}>
                            <FormControlLabel>
                                <FormControlLabelText>Password</FormControlLabelText>
                            </FormControlLabel>
                            <Input
                                className="bg-gray-50 border rounded-lg"
                                size="lg"
                            >
                                <InputField
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={validatePassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <InputSlot className="pr-3">
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Icon as={showPassword ? Eye : EyeOff} size="sm" color="gray" />
                                    </TouchableOpacity>
                                </InputSlot>
                            </Input>
                            {passwordError ? (
                                <FormControlError>
                                    <FormControlErrorText>{passwordError}</FormControlErrorText>
                                </FormControlError>
                            ) : null}
                        </FormControl>
                    </VStack>

                    <Button
                        size="lg"
                        className={`bg-blue-600 rounded-lg mt-4 ${loading && 'opacity-50'}`}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <ButtonText className="font-semibold">{loading ? mainButtonLoadingText : mainButtonText}</ButtonText>
                    </Button>

                    <Center className="mt-8 mb-4">
                        <HStack space="xs">
                            <TouchableOpacity onPress={() => router.push(signIn ? "/signup" : "/signin")}>
                                <Text className="text-blue-600 font-semibold">{signIn ? "Create Account" : "Sign In"}</Text>
                            </TouchableOpacity>
                        </HStack>
                    </Center>
                </Box>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
