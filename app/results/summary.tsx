import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

export default function ResultsSummary() {
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my CPAP mask scan results! I just completed a 3D facial scan for a custom CPAP mask.',
        title: 'CPAP Mask Scan Results'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOrder = () => {
    router.push('/results/order');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Ionicons name="cube" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">
              Your 3D Model is Ready!
            </Text>
            <Text className="text-lg text-secondary text-center">
              We've successfully created your personalized 3D facial model for custom CPAP mask design.
            </Text>
          </View>

          {/* Model Preview */}
          <View className="bg-card p-6 rounded-lg border border-border">
            <View className="items-center space-y-4">
              <View className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full items-center justify-center">
                <Ionicons name="cube" size={48} color="#007AFF" />
              </View>
              <Text className="text-lg font-semibold text-primary">3D Facial Model</Text>
              <Text className="text-sm text-secondary text-center">
                High-resolution model with precise measurements and depth data
              </Text>
            </View>
          </View>

          {/* Measurements */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Key Measurements</Text>
            
            <View className="grid grid-cols-2 gap-4">
              <View className="bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-primary">12.5 cm</Text>
                <Text className="text-sm text-secondary">Face Width</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-primary">18.2 cm</Text>
                <Text className="text-sm text-secondary">Face Height</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-primary">8.7 cm</Text>
                <Text className="text-sm text-secondary">Nose Bridge</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Text className="text-2xl font-bold text-primary">14.3 cm</Text>
                <Text className="text-sm text-secondary">Chin to Nose</Text>
              </View>
            </View>
          </View>

          {/* Features */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">What's Included</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-primary">Complete 3D facial scan</Text>
              </View>
              
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-primary">Precise measurements</Text>
              </View>
              
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-primary">Facial landmark identification</Text>
              </View>
              
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-primary">Custom mask design</Text>
              </View>
              
              <View className="flex-row items-center space-x-3">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className="text-primary">HIPAA-compliant data storage</Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Next Steps
                </Text>
                <Text className="text-sm text-secondary">
                  Our team will use this 3D model to design your custom CPAP mask. 
                  You'll receive updates on the manufacturing process and estimated delivery.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 space-y-3">
        <TouchableOpacity
          className="w-full h-12 bg-primary rounded-lg justify-center items-center"
          onPress={handleOrder}
        >
          <Text className="text-white font-semibold text-lg">Order Custom Mask</Text>
        </TouchableOpacity>

        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 h-12 border border-border rounded-lg justify-center items-center"
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#007AFF" />
            <Text className="text-primary font-semibold ml-2">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 h-12 border border-border rounded-lg justify-center items-center"
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="home-outline" size={20} color="#007AFF" />
            <Text className="text-primary font-semibold ml-2">Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 