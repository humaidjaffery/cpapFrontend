import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OrderData {
  maskType: string;
  material: string;
  color: string;
  shippingAddress: string;
  email: string;
  phone: string;
}

export default function OrderConfirmation() {
  const [orderData, setOrderData] = useState<OrderData>({
    maskType: 'Full Face',
    material: 'Silicone',
    color: 'Clear',
    shippingAddress: '',
    email: '',
    phone: ''
  });

  const maskTypes = ['Full Face', 'Nasal', 'Nasal Pillows'];
  const materials = ['Silicone', 'Gel', 'Foam'];
  const colors = ['Clear', 'Blue', 'Black', 'White'];

  const handleOrder = () => {
    if (!orderData.shippingAddress || !orderData.email || !orderData.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Order Confirmed!',
      'Your custom CPAP mask order has been placed. You will receive a confirmation email shortly.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)')
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-4 items-center">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Ionicons name="card" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">
              Customize Your Mask
            </Text>
            <Text className="text-lg text-secondary text-center">
              Choose your preferences and complete your order
            </Text>
          </View>

          {/* Mask Customization */}
          <View className="space-y-6">
            {/* Mask Type */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-primary">Mask Type</Text>
              <View className="flex-row flex-wrap gap-3">
                {maskTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-3 rounded-lg border ${
                      orderData.maskType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    onPress={() => setOrderData(prev => ({ ...prev, maskType: type }))}
                  >
                    <Text className={`font-medium ${
                      orderData.maskType === type ? 'text-primary' : 'text-primary'
                    }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Material */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-primary">Material</Text>
              <View className="flex-row flex-wrap gap-3">
                {materials.map((material) => (
                  <TouchableOpacity
                    key={material}
                    className={`px-4 py-3 rounded-lg border ${
                      orderData.material === material
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    onPress={() => setOrderData(prev => ({ ...prev, material: material }))}
                  >
                    <Text className={`font-medium ${
                      orderData.material === material ? 'text-primary' : 'text-primary'
                    }`}>
                      {material}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-primary">Color</Text>
              <View className="flex-row flex-wrap gap-3">
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    className={`px-4 py-3 rounded-lg border ${
                      orderData.color === color
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                    onPress={() => setOrderData(prev => ({ ...prev, color: color }))}
                  >
                    <Text className={`font-medium ${
                      orderData.color === color ? 'text-primary' : 'text-primary'
                    }`}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Shipping Information */}
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-primary">Shipping Information</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-primary mb-2">Shipping Address *</Text>
                <TextInput
                  className="w-full p-4 border border-border rounded-lg bg-card text-primary"
                  placeholder="Enter your full shipping address"
                  placeholderTextColor="#6B7280"
                  value={orderData.shippingAddress}
                  onChangeText={(text) => setOrderData(prev => ({ ...prev, shippingAddress: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-primary mb-2">Email *</Text>
                <TextInput
                  className="w-full p-4 border border-border rounded-lg bg-card text-primary"
                  placeholder="Enter your email address"
                  placeholderTextColor="#6B7280"
                  value={orderData.email}
                  onChangeText={(text) => setOrderData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-primary mb-2">Phone Number *</Text>
                <TextInput
                  className="w-full p-4 border border-border rounded-lg bg-card text-primary"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#6B7280"
                  value={orderData.phone}
                  onChangeText={(text) => setOrderData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Order Summary */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <Text className="text-lg font-semibold text-primary mb-3">Order Summary</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-secondary">Custom CPAP Mask</Text>
                <Text className="text-primary font-semibold">$299.99</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-secondary">3D Scan & Design</Text>
                <Text className="text-primary font-semibold">$99.99</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-secondary">Shipping</Text>
                <Text className="text-primary font-semibold">$19.99</Text>
              </View>
              
              <View className="border-t border-border pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold text-primary">Total</Text>
                  <Text className="text-lg font-bold text-primary">$419.97</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Estimated Delivery */}
          <View className="bg-card p-4 rounded-lg border border-border">
            <View className="flex-row items-start space-x-3">
              <Ionicons name="time" size={24} color="#F59E0B" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary mb-1">
                  Estimated Delivery
                </Text>
                <Text className="text-sm text-secondary">
                  2-3 weeks for custom manufacturing and shipping
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
          <Text className="text-white font-semibold text-lg">Place Order - $419.97</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full h-12 border border-border rounded-lg justify-center items-center"
          onPress={() => router.back()}
        >
          <Text className="text-primary font-semibold">Back to Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 