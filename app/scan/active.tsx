import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ScanData {
  front: any;
  left: any;
  right: any;
  top: any;
  bottom: any;
}

export default function ActiveScan() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right' | 'top' | 'bottom'>('front');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanData, setScanData] = useState<ScanData>({} as ScanData);
  const cameraRef = useRef<null | typeof Camera>(null);

  const angles = [
    { key: 'front', name: 'Front', icon: 'person', instruction: 'Face the camera directly' },
    { key: 'left', name: 'Left Side', icon: 'arrow-back', instruction: 'Turn your head to the left' },
    { key: 'right', name: 'Right Side', icon: 'arrow-forward', instruction: 'Turn your head to the right' },
    { key: 'top', name: 'Above', icon: 'arrow-up', instruction: 'Tilt your head back slightly' },
    { key: 'bottom', name: 'Below', icon: 'arrow-down', instruction: 'Tilt your head forward slightly' }
  ];

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startScan = async () => {
    setIsScanning(true);
    await captureAllAngles();
  };

  const captureAllAngles = async () => {
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i].key as keyof ScanData;
      setCurrentAngle(angle as any);
      setScanProgress((i / angles.length) * 100);

      // Simulate capture delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would capture the actual TrueDepth data
      // For now, we'll simulate the capture
      const mockScanData = {
        timestamp: Date.now(),
        angle: angle,
        depthData: `mock_depth_data_${angle}`,
        landmarks: `mock_landmarks_${angle}`
      };

      setScanData(prev => ({
        ...prev,
        [angle]: mockScanData
      }));
    }

    setScanProgress(100);
    setIsScanning(false);
    router.push('/scan/review');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Scan?',
      'Are you sure you want to cancel? All progress will be lost.',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-secondary">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Ionicons name="alert" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-primary mt-4">Camera Access Required</Text>
        <Text className="text-secondary text-center mt-2">
          Please enable camera permissions to continue with the scan.
        </Text>
        <TouchableOpacity
          className="mt-6 px-6 py-3 bg-primary rounded-lg"
          onPress={checkPermissions}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentAngleData = angles.find(a => a.key === currentAngle);

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      <CameraView
        ref={cameraRef as unknown as React.RefObject<CameraView>}
        className="flex-1"
        facing="front"
        ratio="4:3"
      >
        {/* Overlay */}
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 pt-12">
            <TouchableOpacity
              onPress={handleCancel}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="bg-black/50 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">
                {Math.round(scanProgress)}% Complete
              </Text>
            </View>
          </View>

          {/* Center Content */}
          <View className="flex-1 justify-center items-center">
            {!isScanning ? (
              <View className="items-center space-y-6">
                <View className="w-32 h-32 border-4 border-white rounded-full items-center justify-center">
                  <Ionicons name="camera" size={48} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                  Ready to Scan
                </Text>
                <Text className="text-white/80 text-center px-8">
                  We'll capture your face from multiple angles to create a perfect 3D model
                </Text>
                <TouchableOpacity
                  className="bg-primary px-8 py-4 rounded-lg"
                  onPress={startScan}
                >
                  <Text className="text-white font-semibold text-lg">Start Scan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center space-y-6">
                {/* Scanning Animation */}
                <View className="w-32 h-32 border-4 border-primary rounded-full items-center justify-center">
                  <View className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </View>
                
                <Text className="text-white text-2xl font-bold text-center">
                  Scanning {currentAngleData?.name}
                </Text>
                
                <Text className="text-white/80 text-center px-8">
                  {currentAngleData?.instruction}
                </Text>

                {/* Progress Bar */}
                <View className="w-64 h-2 bg-white/20 rounded-full">
                  <View 
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </View>

                {/* Current Angle Indicator */}
                <View className="flex-row space-x-2">
                  {angles.map((angle, index) => (
                    <View
                      key={angle.key}
                      className={`w-3 h-3 rounded-full ${
                        currentAngle === angle.key ? 'bg-primary' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Bottom Instructions */}
          {isScanning && (
            <View className="p-6">
              <View className="bg-black/50 p-4 rounded-lg">
                <Text className="text-white text-center font-semibold">
                  Keep your head still and follow the prompts
                </Text>
              </View>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
} 