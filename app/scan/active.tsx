import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Camera, useCameraPermission, CameraPermissionStatus, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera'
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';

declare function trueDepthFrameProcessor(frame: any): any;

const { width, height } = Dimensions.get('window');
         as
interface ScanData {
  front: any;
  left: any;
  right: any;
  top: any; 
  bottom: any;
}

export default function ActiveScan() {
  const [hasPermission, setHasPermission] = React.useState<CameraPermissionStatus>("not-determined")
  const [isScanning, setIsScanning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right' | 'top' | 'bottom'>('front');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanData, setScanData] = useState<ScanData>({} as ScanData);

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

  const device = useCameraDevice("front")
  console.log(device)
  if(!device) return <View> <Text> You must have an Iphone Camera</Text> </View>


  
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    const result = trueDepthFrameProcessor(frame)
    console.log("RESULT: ")
    console.log(result)
  }, [])

  const checkPermissions = async () => {
    const persmission = await Camera.requestCameraPermission()
    setHasPermission(persmission);
  }

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

  if (hasPermission === 'not-determined') {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-secondary">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission !== "granted") {
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
    <View className='h-full w-full'>
      <Camera style={{flex: 1}} device={device} frameProcessor={frameProcessor} isActive /> 
      <View className='absolute top-0 left-0 right-0 bottom-0 w-full h-full flex justify-center items-center'>
        <Text className='text-3xl text-center '> Scan </Text>
      </View>
    </View>
  );
} 

