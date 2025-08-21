import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Camera, useCameraPermission, CameraPermissionStatus, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera'
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';


import type { Frame } from 'react-native-vision-camera'

// declare global {
//   function trueDepthFrameProcessor(frame: Frame, options?: any): any;
// }

const { width, height } = Dimensions.get('window');
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
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);

  const angles = [
    { key: 'front', name: 'Front', icon: 'person', instruction: 'Face the camera directly' },
    { key: 'left', name: 'Left Side', icon: 'arrow-back', instruction: 'Turn your head to the left' },
    { key: 'right', name: 'Right Side', icon: 'arrow-forward', instruction: 'Turn your head to the right' },
    { key: 'top', name: 'Above', icon: 'arrow-up', instruction: 'Tilt your head back slightly' },
    { key: 'bottom', name: 'Below', icon: 'arrow-down', instruction: 'Tilt your head forward slightly' }
  ];

  useEffect(() => {
    console.log('�� Checking trueDepthFrameProcessor availability...');
    
    // Check if it's available in the global scope
    if (typeof (global as any).trueDepthFrameProcessor === 'function') {
      console.log('✅ trueDepthFrameProcessor found in global scope');
      setIsPluginLoaded(true);
    } else {
      console.log('❌ trueDepthFrameProcessor NOT found in global scope');
      setIsPluginLoaded(false);
      
      // Try to wait for it to load
      const checkInterval = setInterval(() => {
        if (typeof (global as any).trueDepthFrameProcessor === 'function') {
          console.log('✅ trueDepthFrameProcessor now available!');
          setIsPluginLoaded(true);
          clearInterval(checkInterval);
        }
      }, 1000);
      
      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, []);

  const device = useCameraDevice("front")
  // console.log(device)
  if(!device) return <View> <Text> You must have an Iphone Camera</Text> </View>

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    console.log("IN frame processor")
    // Check for any frame processor related functions
    const frameProcessorKeys = Object.keys(global)

    console.log("frameProcessorKeys: ", frameProcessorKeys);
    
    try {
      // Check if the function exists
      if (typeof (global as any).trueDepthFrameProcessor === 'function') {
        const result = (global as any).trueDepthFrameProcessor(frame, {
          mode: 'scan',
          angle: currentAngle
        });
        console.log("RESULT: ", result);
      } else {
        console.log("❌ trueDepthFrameProcessor function not found");
      }
    } catch (error) {
      console.log("❌ Error in frame processor:", error);
    }
  }, [currentAngle, isPluginLoaded])

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

