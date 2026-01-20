import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css";

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person',
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.')
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy & Security',
      subtitle: 'Manage your data and privacy',
      onPress: () => Alert.alert('Privacy', 'Your data is protected with HIPAA-compliant security measures.')
    },
    {
      icon: 'card',
      title: 'Order History',
      subtitle: 'View your past orders',
      onPress: () => Alert.alert('Orders', 'No orders found.')
    },
    {
      icon: 'scan',
      title: 'Scan History',
      subtitle: 'View your previous scans',
      onPress: () => Alert.alert('Scans', 'No scans found.')
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Support', 'Contact us at support@cpapscan.com')
    },
    {
      icon: 'document-text',
      title: 'Terms & Conditions',
      subtitle: 'Read our terms of service',
      onPress: () => Alert.alert('Terms', 'Terms and conditions will be displayed here.')
    }
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Profile Header */}
          <View className="space-y-4 items-center">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
              <Text className="text-3xl font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">
                {user?.name || 'User'}
              </Text>
              <Text className="text-secondary">
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>

          {/* Account Stats */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Account Overview</Text>
            
            <View className="grid grid-cols-2 gap-4">
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="scan" size={24} color="#007AFF" />
                <Text className="text-2xl font-bold text-primary mt-2">0</Text>
                <Text className="text-sm text-secondary">Scans Completed</Text>
              </View>
              
              <View className="bg-card p-4 rounded-lg border border-border">
                <Ionicons name="card" size={24} color="#10B981" />
                <Text className="text-2xl font-bold text-primary mt-2">0</Text>
                <Text className="text-sm text-secondary">Orders Placed</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Settings</Text>
            
            <View className="space-y-2">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center space-x-4 p-4 bg-card rounded-lg border border-border"
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon as any} size={24} color="#007AFF" />
                  <View className="flex-1">
                    <Text className="font-semibold text-primary">{item.title}</Text>
                    <Text className="text-sm text-secondary">{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* App Information */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">App Information</Text>
            
            <View className="bg-card p-4 rounded-lg border border-border">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View className="flex-1">
                  <Text className="font-semibold text-primary">CPAP Mask Scanner</Text>
                  <Text className="text-sm text-secondary">Version 1.0.0</Text>
                </View>
              </View>
            </View>

            <View className="bg-card p-4 rounded-lg border border-border">
              <View className="flex-row items-center space-x-3">
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                <View className="flex-1">
                  <Text className="font-semibold text-primary">HIPAA Compliant</Text>
                  <Text className="text-sm text-secondary">Your health data is secure</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sign Out Button */}
      <View className="p-6">
        <TouchableOpacity
          className="w-full h-12 border border-red-500 rounded-lg justify-center items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-500 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 