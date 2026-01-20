import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

export default function ScanningInstructions() {
  const [currentStep, setCurrentStep] = useState(0);

  const instructions = [
    {
      title: 'Find Good Lighting',
      description: 'Ensure you\'re in a well-lit environment. Natural light is best, but avoid direct sunlight on your face.',
      icon: 'sunny',
      color: '#F59E0B'
    },
    {
      title: 'Clear Your Face',
      description: 'Remove glasses, hats, or any accessories that might interfere with the scan. Tie back long hair.',
      icon: 'person',
      color: '#3B82F6'
    },
    {
      title: 'Position Yourself',
      description: 'Sit or stand about 20-30 inches from your device. Keep your head level and face the camera directly.',
      icon: 'camera',
      color: '#10B981'
    },
    {
      title: 'Stay Still',
      description: 'The scan will capture multiple angles. Follow the on-screen prompts and remain as still as possible.',
      icon: 'hand-left',
      color: '#8B5CF6'
    },
    {
      title: 'Multiple Angles',
      description: 'We\'ll scan from front, left side, right side, above, and below to create a complete 3D model.',
      icon: 'scan',
      color: '#EF4444'
    }
  ];

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartScan();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartScan = () => {
    Alert.alert(
      'Ready to Scan?',
      'Make sure you\'re in a well-lit area and your face is clear. The scan will take about 1-2 minutes.',
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Start Scan', 
          onPress: () => router.push('/scan/prepare')
        }
      ]
    );
  };

  const currentInstruction = instructions[currentStep];

  return (
    <View className="flex-1 bg-background">
      {/* Progress Bar */}
      <View className="h-2 bg-border">
        <View 
          className="h-2 bg-primary" 
          style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
        />
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Progress Indicator */}
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-secondary">
              Step {currentStep + 1} of {instructions.length}
            </Text>
            <Text className="text-sm text-secondary">
              {Math.round(((currentStep + 1) / instructions.length) * 100)}%
            </Text>
          </View>

          {/* Current Instruction */}
          <View className="space-y-6 items-center">
            <View 
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: `${currentInstruction.color}20` }}
            >
              <Ionicons 
                name={currentInstruction.icon as any} 
                size={48} 
                color={currentInstruction.color} 
              />
            </View>

            <Text className="text-2xl font-bold text-primary text-center">
              {currentInstruction.title}
            </Text>

            <Text className="text-lg text-secondary text-center leading-6">
              {currentInstruction.description}
            </Text>
          </View>

          {/* Tips */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Pro Tip
                </Text>
                <Text className="text-sm text-secondary">
                  {currentStep === 0 && 'Try to scan in the same lighting conditions you typically sleep in.'}
                  {currentStep === 1 && 'If you wear glasses, consider scanning without them for a more accurate fit.'}
                  {currentStep === 2 && 'Keep your expression neutral - no smiling or frowning for best results.'}
                  {currentStep === 3 && 'Take a deep breath and relax. The scan will be over quickly!'}
                  {currentStep === 4 && 'The more angles we capture, the better your custom mask will fit.'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="p-6 space-y-3">
        {currentStep > 0 && (
          <TouchableOpacity
            className="w-full h-12 border border-border rounded-lg justify-center items-center"
            onPress={handleBack}
          >
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="w-full h-12 bg-primary rounded-lg justify-center items-center"
          onPress={handleNext}
        >
          <Text className="text-white font-semibold">
            {currentStep === instructions.length - 1 ? 'Start Scanning' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 