import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

export default function ScanTab() {
  const handleStartScan = () => {
    router.push('/survey/welcome');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
              <Ionicons name="scan" size={48} color="white" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">
              Face Scanner
            </Text>
            <Text className="text-lg text-secondary text-center">
              Create your custom CPAP mask with our advanced 3D scanning technology
            </Text>
          </View>

          {/* Scan Process */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">How It Works</Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-primary">Complete Survey</Text>
                  <Text className="text-secondary">Answer questions about your CPAP usage</Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-primary">3D Face Scan</Text>
                  <Text className="text-secondary">Capture your face from multiple angles</Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-primary">Custom Mask</Text>
                  <Text className="text-secondary">Receive your perfect fit CPAP mask</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Features */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">What You Get</Text>
            
            <View className="grid grid-cols-2 gap-4">
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="cube" size={24} color="#8B5CF6" />
                <Text className="font-semibold text-primary mt-2">3D Model</Text>
                <Text className="text-sm text-secondary">Complete facial mapping</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="resize" size={24} color="#F59E0B" />
                <Text className="font-semibold text-primary mt-2">Precise Fit</Text>
                <Text className="text-sm text-secondary">Exact measurements</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                <Text className="font-semibold text-primary mt-2">HIPAA Secure</Text>
                <Text className="text-sm text-secondary">Privacy protected</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="time" size={24} color="#3B82F6" />
                <Text className="font-semibold text-primary mt-2">Quick Process</Text>
                <Text className="text-sm text-secondary">5-10 minutes total</Text>
              </View>
            </View>
          </View>

          {/* Requirements */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Requirements
                </Text>
                <Text className="text-sm text-secondary">
                  • iOS device with TrueDepth camera{'\n'}
                  • Good lighting conditions{'\n'}
                  • Clear face (no glasses/accessories){'\n'}
                  • Stable internet connection
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View className="p-6">
        <TouchableOpacity
          className="w-full h-14 bg-primary rounded-lg justify-center items-center"
          onPress={handleStartScan}
        >
          <Text className="text-white font-semibold text-lg">Start Your Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 