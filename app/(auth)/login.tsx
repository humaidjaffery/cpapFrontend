import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithEmail, isLoading } = useAuth();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      await signIn(provider);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'OAuth login failed');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="space-y-8">
        {/* Header */}
        <View className="space-y-2">
          <Text className="text-4xl font-bold text-primary text-center">
            Welcome Back
          </Text>
          <Text className="text-lg text-secondary text-center">
            Sign in to continue to your CPAP mask scan
          </Text>
        </View>

        {/* Email/Password Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-primary mb-2">Email</Text>
            <TextInput
              className="w-full h-12 px-4 border border-border rounded-lg bg-card text-primary"
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-primary mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className="w-full h-12 px-4 pr-12 border border-border rounded-lg bg-card text-primary"
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="w-full h-12 bg-primary rounded-lg justify-center items-center"
            onPress={handleEmailLogin}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center">
          <View className="flex-1 h-px bg-border" />
          <Text className="px-4 text-secondary">or</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* OAuth Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            className="w-full h-12 bg-white border border-border rounded-lg flex-row items-center justify-center space-x-3"
            onPress={() => handleOAuthLogin('google')}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text className="text-primary font-semibold">Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-12 bg-black rounded-lg flex-row items-center justify-center space-x-3"
            onPress={() => handleOAuthLogin('apple')}
          >
            <Ionicons name="logo-apple" size={24} color="white" />
            <Text className="text-white font-semibold">Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center space-x-1">
          <Text className="text-secondary">Don't have an account?</Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
} 