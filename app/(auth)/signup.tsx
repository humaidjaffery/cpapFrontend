import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp, isLoading } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Signup failed');
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'apple') => {
    try {
      await signIn(provider);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'OAuth signup failed');
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
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 justify-center min-h-screen">
        <View className="space-y-8">
          {/* Header */}
          <View className="space-y-2">
            <Text className="text-4xl font-bold text-primary text-center">
              Create Account
            </Text>
            <Text className="text-lg text-secondary text-center">
              Sign up to start your CPAP mask journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-primary mb-2">Full Name</Text>
              <TextInput
                className="w-full h-12 px-4 border border-border rounded-lg bg-card text-primary"
                placeholder="Enter your full name"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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

            <View>
              <Text className="text-sm font-medium text-primary mb-2">Confirm Password</Text>
              <View className="relative">
                <TextInput
                  className="w-full h-12 px-4 pr-12 border border-border rounded-lg bg-card text-primary"
                  placeholder="Confirm your password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View className="flex-row items-start space-x-3">
              <TouchableOpacity
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="mt-1"
              >
                <Ionicons
                  name={acceptedTerms ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={acceptedTerms ? '#007AFF' : '#6B7280'}
                />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-sm text-secondary">
                  I agree to the{' '}
                  <Text className="text-primary font-semibold">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-primary font-semibold">Privacy Policy</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-full h-12 bg-primary rounded-lg justify-center items-center"
              onPress={handleSignup}
            >
              <Text className="text-white font-semibold">Create Account</Text>
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
              onPress={() => handleOAuthSignup('google')}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text className="text-primary font-semibold">Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full h-12 bg-black rounded-lg flex-row items-center justify-center space-x-3"
              onPress={() => handleOAuthSignup('apple')}
            >
              <Ionicons name="logo-apple" size={24} color="white" />
              <Text className="text-white font-semibold">Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center space-x-1">
            <Text className="text-secondary">Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 