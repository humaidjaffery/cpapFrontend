import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScanPrepare() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      setHasPermission(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartScan = () => {
    if (hasPermission) {
      router.push('/scan/active');
    } else {
      Alert.alert(
        'Camera Permission Required',
        'We need camera access to scan your face. Please enable camera permissions in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => checkPermissions() }
        ]
      );
    }
  };

  const handleRetryPermissions = async () => {
    setIsChecking(true);
    await checkPermissions();
  };

  if (isChecking) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-secondary mt-4">Checking permissions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center">
        <View className="space-y-8">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Ionicons name="camera" size={100} color="white" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">
              Prepare to Scan
            </Text>
            <Text className="text-lg text-secondary text-center">
              Let's make sure everything is ready for your face scan
            </Text>
          </View>

          {/* Status Checks */}
          <View className="space-y-4">
            {/* Camera Permission */}
            <View className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border">
              <Ionicons 
                name={hasPermission ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color={hasPermission ? '#10B981' : '#EF4444'} 
              />
              <View className="flex-1">
                <Text className="font-semibold text-primary">Camera Access</Text>
                <Text className="text-sm text-secondary">
                  {hasPermission ? 'Camera permission granted' : 'Camera permission required'}
                </Text>
              </View>
            </View>

            {/* Device Compatibility */}
            <View className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View className="flex-1">
                <Text className="font-semibold text-primary">Device Compatibility</Text>
                <Text className="text-sm text-secondary">TrueDepth camera detected</Text>
              </View>
            </View>

            {/* Lighting Check */}
            <View className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border">
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <View className="flex-1">
                <Text className="font-semibold text-primary">Good Lighting</Text>
                <Text className="text-sm text-secondary">Ensure you're in a well-lit area</Text>
              </View>
            </View>

            {/* Face Clear */}
            <View className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border">
              <Ionicons name="person" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="font-semibold text-primary">Face Clear</Text>
                <Text className="text-sm text-secondary">Remove glasses and accessories</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            {!hasPermission && (
              <TouchableOpacity
                className="w-full h-12 border border-border rounded-lg justify-center items-center"
                onPress={handleRetryPermissions}
              >
                <Text className="text-primary font-semibold">Grant Camera Permission</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`w-full h-12 rounded-lg justify-center items-center ${
                hasPermission ? 'bg-primary' : 'bg-gray-300'
              }`}
              onPress={handleStartScan}
              disabled={!hasPermission}
            >
              <Text className={`font-semibold ${
                hasPermission ? 'text-white' : 'text-gray-500'
              }`}>
                Start Face Scan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Scanning Tips
                </Text>
                <Text className="text-sm text-secondary">
                  • Stay about 20-30 inches from your device{'\n'}
                  • Keep your head level and face forward{'\n'}
                  • Follow the on-screen prompts for different angles{'\n'}
                  • The scan will take about 1-2 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
} 