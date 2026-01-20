import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

export default function SurveyWelcome() {
  const handleContinue = () => {
    router.push('/survey/medical');
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 min-h-screen justify-center">
        <View className="space-y-8">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Ionicons name="scan" size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-primary text-center">
              Welcome to CPAP Mask Scanner
            </Text>
            <Text className="text-lg text-secondary text-center leading-6">
              Let's create your perfect custom CPAP mask. We'll need some information to ensure the best fit.
            </Text>
          </View>

          {/* Process Steps */}
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-primary text-center">
              What to Expect
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-primary">Quick Survey</Text>
                  <Text className="text-secondary">Answer a few questions about your CPAP usage and preferences</Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-primary">Face Scan</Text>
                  <Text className="text-secondary">We'll scan your face from multiple angles using advanced 3D technology</Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-primary">Custom Mask</Text>
                  <Text className="text-secondary">We'll create your perfect custom CPAP mask based on the scan data</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Privacy Notice */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Your Privacy Matters
                </Text>
                <Text className="text-sm text-secondary">
                  All your data is encrypted and stored securely. We follow HIPAA guidelines to protect your health information.
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            className="w-full h-14 bg-primary rounded-lg justify-center items-center"
            onPress={handleContinue}
          >
            <Text className="text-white font-semibold text-lg">Get Started</Text>
          </TouchableOpacity>

          {/* Estimated Time */}
          <View className="items-center">
            <Text className="text-secondary text-center">
              This process takes about 5-10 minutes
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 