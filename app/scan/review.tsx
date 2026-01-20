import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

interface ScanQuality {
  front: 'good' | 'poor';
  left: 'good' | 'poor';
  right: 'good' | 'poor';
  top: 'good' | 'poor';
  bottom: 'good' | 'poor';
}

export default function ScanReview() {
  const [isUploading, setIsUploading] = useState(false);
  const [scanQuality] = useState<ScanQuality>({
    front: 'good',
    left: 'good',
    right: 'good',
    top: 'good',
    bottom: 'good'
  });

  const angles = [
    { key: 'front', name: 'Front View', icon: 'person' },
    { key: 'left', name: 'Left Side', icon: 'arrow-back' },
    { key: 'right', name: 'Right Side', icon: 'arrow-forward' },
    { key: 'top', name: 'Above', icon: 'arrow-up' },
    { key: 'bottom', name: 'Below', icon: 'arrow-down' }
  ];

  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Here you would actually upload the scan data to your backend
      console.log('Uploading scan data...');
      
      router.push('/results/summary');
    } catch (error) {
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    Alert.alert(
      'Retake Scan?',
      'This will discard the current scan and start over.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retake', style: 'destructive', onPress: () => router.push('/scan/active') }
      ]
    );
  };

  const getQualityColor = (quality: 'good' | 'poor') => {
    return quality === 'good' ? '#10B981' : '#EF4444';
  };

  const getQualityIcon = (quality: 'good' | 'poor') => {
    return quality === 'good' ? 'checkmark-circle' : 'close-circle';
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">
              Scan Complete!
            </Text>
            <Text className="text-lg text-secondary text-center">
              We've captured your face from all angles. Let's review the quality.
            </Text>
          </View>

          {/* Quality Check */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Scan Quality</Text>
            
            {angles.map((angle) => {
              const quality = scanQuality[angle.key as keyof ScanQuality];
              return (
                <View key={angle.key} className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border">
                  <Ionicons name={angle.icon as any} size={24} color="#3B82F6" />
                  <View className="flex-1">
                    <Text className="font-semibold text-primary">{angle.name}</Text>
                    <Text className="text-sm text-secondary">Captured successfully</Text>
                  </View>
                  <Ionicons 
                    name={getQualityIcon(quality)} 
                    size={24} 
                    color={getQualityColor(quality)} 
                  />
                </View>
              );
            })}
          </View>

          {/* Summary */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Scan Summary
                </Text>
                <Text className="text-sm text-secondary">
                  • 5 facial angles captured{'\n'}
                  • High-quality depth data collected{'\n'}
                  • Facial landmarks identified{'\n'}
                  • Ready for mask customization
                </Text>
              </View>
            </View>
          </View>

          {/* Data Preview */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">What We Captured</Text>
            
            <View className="grid grid-cols-2 gap-4">
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="cube" size={24} color="#8B5CF6" />
                <Text className="font-semibold text-primary mt-2">3D Face Model</Text>
                <Text className="text-sm text-secondary">Complete facial structure</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="resize" size={24} color="#F59E0B" />
                <Text className="font-semibold text-primary mt-2">Measurements</Text>
                <Text className="text-sm text-secondary">Precise facial dimensions</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="location" size={24} color="#10B981" />
                <Text className="font-semibold text-primary mt-2">Landmarks</Text>
                <Text className="text-sm text-secondary">Key facial reference points</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="layers" size={24} color="#EF4444" />
                <Text className="font-semibold text-primary mt-2">Depth Data</Text>
                <Text className="text-sm text-secondary">TrueDepth information</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 space-y-3">
        <TouchableOpacity
          className={`w-full h-12 rounded-lg justify-center items-center ${
            isUploading ? 'bg-gray-300' : 'bg-primary'
          }`}
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <View className="flex-row items-center space-x-2">
              <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <Text className="text-white font-semibold">Uploading...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold">Upload & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full h-12 border border-border rounded-lg justify-center items-center"
          onPress={handleRetake}
        >
          <Text className="text-primary font-semibold">Retake Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 