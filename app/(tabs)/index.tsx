import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css"

export default function Home() {
  const { user, signOut } = useAuth();

  const handleStartScan = () => {
    // router.push('/survey/welcome');
    router.push('/scan/prepare')
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Text className="text-3xl font-bold text-primary">
              Welcome back, {user?.name || 'User'}!
            </Text>
            <Text className="text-lg text-secondary">
              Ready to create your perfect custom CPAP mask?
            </Text>
          </View>

          {/* Quick Actions */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Quick Actions</Text>
            
            <TouchableOpacity
              className="bg-primary p-6 rounded-lg"
              onPress={handleStartScan}
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                  <Ionicons name="scan" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">Start New Scan</Text>
                  <Text className="text-white/80">Begin your custom mask journey</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-card p-6 rounded-lg border border-border"
              onPress={() => router.push('/results/summary')}
            >
              <View className="flex-row items-center space-x-4">
                <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
                  <Ionicons name="cube" size={24} color="#007AFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary text-lg font-semibold">View Results</Text>
                  <Text className="text-secondary">Check your scan data</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#007AFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Recent Activity</Text>
            
            <View className="bg-card p-4 rounded-lg border border-border">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="time" size={24} color="#F59E0B" />
                <View className="flex-1">
                  <Text className="font-semibold text-primary">Last Scan</Text>
                  <Text className="text-sm text-secondary">No scans completed yet</Text>
                </View>
              </View>
            </View>

            <View className="bg-card p-4 rounded-lg border border-border">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="card" size={24} color="#10B981" />
                <View className="flex-1">
                  <Text className="font-semibold text-primary">Orders</Text>
                  <Text className="text-sm text-secondary">No orders placed yet</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Information Cards */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Learn More</Text>
            
            <View className="grid grid-cols-2 gap-4">
              <TouchableOpacity className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <Text className="font-semibold text-primary mt-2">How It Works</Text>
                <Text className="text-sm text-secondary">Learn about our process</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                <Text className="font-semibold text-primary mt-2">Privacy & Security</Text>
                <Text className="text-sm text-secondary">HIPAA compliant</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Actions */}
          <View className="space-y-3">
            <TouchableOpacity
              className="w-full h-12 border border-border rounded-lg justify-center items-center"
              onPress={handleSignOut}
            >
              <Text className="text-primary font-semibold">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
