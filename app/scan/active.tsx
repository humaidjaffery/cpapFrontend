import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Camera, useCameraPermission, CameraPermissionStatus, useCameraDevice, useFrameProcessor} from 'react-native-vision-camera'
import DepthPhotoCapture, { DepthPhotoCaptureResult } from '../../utils/depthPhotoCapture';
import { checkFaceFrameProcessor, CheckFaceData } from '../../utils/frameProcessor';
import { analyzeDepthQuality, formatDepthReport, validateDepthForFaceMeasurement } from '../../utils/depthDataAnalyzer';
import "../globals.css";

// Backend URL - change this to your server's IP when running
// Use your Mac's IP address (not 127.0.0.1 which only works on the same device)
const BACKEND_URL = 'http://172.20.10.12:8000';

// Simple test function to verify backend connectivity
const testBackendConnection = async () => {
  try {
    console.log('[testBackend] 🧪 Testing backend connection...');
    console.log(`[testBackend]    URL: ${BACKEND_URL}/health`);
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[testBackend] ✅ Backend is reachable!', data);
      Alert.alert('✅ Success', `Backend connected!\n\nResponse: ${JSON.stringify(data)}`);
      return true;
    } else {
      console.log('[testBackend] ❌ Backend returned error:', response.status);
      Alert.alert('❌ Error', `Backend returned status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    console.error('[testBackend] ❌ Connection failed:', error.message);
    Alert.alert('❌ Connection Failed', `Could not reach backend.\n\nError: ${error.message}\n\nMake sure:\n1. Backend is running\n2. Phone and Mac are on same network\n3. IP address is correct`);
    return false;
  }
};

const { width, height } = Dimensions.get('window');

interface ScanData {
  front: DepthPhotoCaptureResult | null;
  left: DepthPhotoCaptureResult | null;
  right: DepthPhotoCaptureResult | null;
  top: DepthPhotoCaptureResult | null; 
  bottom: DepthPhotoCaptureResult | null;
}

export default function ActiveScan() {
  const [hasPermission, setHasPermission] = React.useState<CameraPermissionStatus>("not-determined")
  const [isScanning, setIsScanning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right' | 'top' | 'bottom'>('front');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanData, setScanData] = useState<ScanData>({} as ScanData);
  const [cameraReady, setCameraReady] = useState(false);
  const [depthAvailable, setDepthAvailable] = useState(false);
  const [lastCaptureResult, setLastCaptureResult] = useState<DepthPhotoCaptureResult | null>(null);
  const [frameProcessorActive, setFrameProcessorActive] = useState(true); // Controls frame processor
  const [isCapturing, setIsCapturing] = useState(false); // New: tracks photo capture state

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

  useEffect(() => {
    if (hasPermission === 'granted') {
      setupCamera();
    }
    
    return () => {
      // Cleanup on unmount
      DepthPhotoCapture.stopCamera().catch(err => console.log('[useEffect cleanup] Error stopping camera:', err));
    };
  }, [hasPermission]);

  const setupCamera = async () => {
    try {
      console.log('[setupCamera] 📷 Setting up TrueDepth camera...');
      const result = await DepthPhotoCapture.setupCamera();
      console.log('[setupCamera] 📷 Camera setup result:', result);
      setCameraReady(result.success);
      setDepthAvailable(result.depthAvailable);
      
      if (!result.depthAvailable) {
        Alert.alert(
          'Depth Not Available',
          'This device does not support depth data capture. Please use an iPhone with TrueDepth camera (iPhone X or newer with Face ID).',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('[setupCamera] ❌ Camera setup failed:', error);
      Alert.alert(
        'Camera Setup Failed',
        error.message || 'Could not initialize TrueDepth camera',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const device = useCameraDevice("front");
  
  // Select a camera format that supports depth data
  const format = React.useMemo(() => {
    if (!device?.formats) return undefined;
    
    // Find formats that support depth data
    const depthFormats = device.formats.filter(f => 
      f.supportsDepthCapture === true
    );
    
    if (depthFormats.length > 0) {
      // Sort by video dimensions (prefer higher resolution)
      const sorted = depthFormats.sort((a, b) => 
        (b.videoWidth * b.videoHeight) - (a.videoWidth * a.videoHeight)
      );
      console.log(`[format useMemo] ✅ Found ${depthFormats.length} depth-capable formats`);
      console.log(`[format useMemo] Using format: ${sorted[0].videoWidth}x${sorted[0].videoHeight}`);
      return sorted[0];
    }
    
    console.log('[format useMemo] ⚠️ No depth-capable formats found on this device');
    return undefined;
  }, [device]);
  
  if(!device) return <View> <Text> You must have an Iphone Camera</Text> </View>

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    // Only process frames when NOT capturing photo
    if (!isCapturing) {
      const result = checkFaceFrameProcessor(frame);
      // Reduce logging spam
      // if (result) {
      //   console.log('🎬 Frame processor active:', result.status);
      // }
    }
  }, [isCapturing]);

  useEffect(() => {
    if (format) {
      console.log('[format useEffect] 📹 Selected Format Details:');
      console.log(`[format useEffect]   Resolution: ${format.videoWidth}x${format.videoHeight}`);
      console.log(`[format useEffect]   Supports Depth: ${format.supportsDepthCapture}`);
    }
  }, [format]);
  
  const checkPermissions = async () => {
    const persmission = await Camera.requestCameraPermission()
    setHasPermission(persmission);
  }

  const captureDepthPhoto = async (): Promise<DepthPhotoCaptureResult | null> => {
    try {
      console.log('[captureDepthPhoto] 📸 Capturing depth photo...');
      const result = await DepthPhotoCapture.captureDepthPhoto();
      // console.log('[captureDepthPhoto] 📸 Capture result:', result);
      setLastCaptureResult(result);
      return result;
    } catch (error: any) {
      console.error('[captureDepthPhoto] ❌ Capture failed:', error);
      Alert.alert('Capture Failed', error.message || 'Could not capture depth photo');
      return null;
    }
  };

  const sendDepthToBackend = async (result: DepthPhotoCaptureResult, depthArray: number[]): Promise<boolean> => {
    try {
      console.log('[sendDepthToBackend] 📤 Sending depth data to backend...');
      console.log(`[sendDepthToBackend]    URL: ${BACKEND_URL}/api/depth-capture`);
      console.log(`[sendDepthToBackend]    Points: ${depthArray.length}`);
      
      const payload = {
        depthArray: depthArray,
        depthWidth: result.depthWidth,
        depthHeight: result.depthHeight,
        depthAccuracy: result.depthAccuracy,
        minDepth: result.minDepth || 0,
        maxDepth: result.maxDepth || 0,
        avgDepth: result.avgDepth || 0,
        timestamp: result.timestamp || Date.now(),
      };
      
      const response = await fetch(`${BACKEND_URL}/api/depth-capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[sendDepthToBackend] ✅ Backend response:', data);
      return data.success;
    } catch (error: any) {
      console.error('[sendDepthToBackend] ❌ Failed to send to backend:', error.message);
      return false;
    }
  };

  const handleCapturePhoto = async () => {
    if (!cameraReady || !depthAvailable) {
      Alert.alert(
        'Camera Not Ready',
        'Please wait for the camera to be ready or check if your device supports depth capture.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('[handleCapturePhoto] 📸 Starting capture - disabling frame processor...');
    setIsCapturing(true); // Disable frame processor
    setIsScanning(true);
    
    // Small delay to let frame processor stop
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await captureDepthPhoto();
    
    setIsCapturing(false); // Re-enable frame processor
    setIsScanning(false);
    
    // console.log('📸 CAPTURE RESULT:', JSON.stringify(result, null, 2));

    
    if (result && result.success) {
      // Analyze depth quality
      const qualityReport = analyzeDepthQuality(result);
      const validation = validateDepthForFaceMeasurement(result);
      
      console.log('[handleCapturePhoto] ✅ SUCCESS - Depth data captured!');
      console.log(`[handleCapturePhoto] 📊 Depth Accuracy: ${result.depthAccuracy}`);
      console.log(`[handleCapturePhoto] 📏 Depth Resolution: ${result.depthWidth}x${result.depthHeight}`);
      console.log(`[handleCapturePhoto] 📁 File saved at: ${result.filePath}`);
      console.log(`[handleCapturePhoto] 🔢 Depth Data Type: ${result.depthDataType}`);
      console.log(`[handleCapturePhoto] 🔍 Filtered: ${result.isDepthDataFiltered}`);
      console.log('[handleCapturePhoto] \n' + formatDepthReport(qualityReport));
      console.log(`[handleCapturePhoto] \n🎯 Suitable for face measurement: ${validation.suitable ? 'YES' : 'NO'}`);
      console.log(`[handleCapturePhoto]    Reason: ${validation.reason}`);
      
      // Display depth data info (now saved as binary file)
      if (result.depthDataPath) {
        console.log('[handleCapturePhoto] \n✅ Depth data saved as binary file!');
        console.log(`[handleCapturePhoto] 📊 Depth Stats:`);
        console.log(`[handleCapturePhoto]    Min: ${result.minDepth?.toFixed(3)}m`);
        console.log(`[handleCapturePhoto]    Max: ${result.maxDepth?.toFixed(3)}m`);
        console.log(`[handleCapturePhoto]    Avg: ${result.avgDepth?.toFixed(3)}m`);
        console.log(`[handleCapturePhoto]    Binary file: ${result.depthDataPath}`);
        console.log(`[handleCapturePhoto]    Total Points: ${result.depthWidth * result.depthHeight}`);
        
        // Read all depth data and send to backend
        try {
          console.log('[handleCapturePhoto] 📖 Reading full depth data for backend...');
          const totalPoints = result.depthWidth * result.depthHeight;
          const allDepthData: number[] = [];
          const chunkSize = 50000; // Read in chunks of 50k points
          
          for (let offset = 0; offset < totalPoints; offset += chunkSize) {
            const count = Math.min(chunkSize, totalPoints - offset);
            const chunk = await DepthPhotoCapture.readDepthBinaryChunk(result.depthDataPath, offset, count);
            allDepthData.push(...chunk.data);
            console.log(`[handleCapturePhoto]    Read chunk: ${offset} - ${offset + count} (${allDepthData.length}/${totalPoints})`);
          }
          
          console.log(`[handleCapturePhoto] ✅ Read all ${allDepthData.length.toLocaleString()} depth points`);
          console.log(`[handleCapturePhoto]    First 5 values: [${allDepthData.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`);
          
          // Send to backend
          const backendSuccess = await sendDepthToBackend(result, allDepthData);
          if (backendSuccess) {
            console.log('[handleCapturePhoto] ✅ Depth data sent to backend and saved!');
          } else {
            console.log('[handleCapturePhoto] ⚠️ Failed to send to backend (is the server running?)');
          }
        } catch (error: any) {
          console.log('[handleCapturePhoto] ⚠️ Could not read/send depth data:', error.message);
        }
        
        // Store for later use
        setLastCaptureResult(result);
      } else {
        console.log('[handleCapturePhoto] ⚠️ No depth data path in capture result');
      }
      
      // Save to Photos app
      console.log('[handleCapturePhoto] 💾 Saving to Photos app...');
      try {
        const saveResult = await DepthPhotoCapture.saveToPhotos(result.filePath);
        console.log('[handleCapturePhoto] ✅ Saved to Photos:', saveResult);
      } catch (error: any) {
        console.log('[handleCapturePhoto] ⚠️ Failed to save to Photos:', error.message);
      }
      
      Alert.alert(
        `${qualityReport.quality === 'excellent' ? '🎉' : '✅'} Capture Complete!`,
        `Quality: ${qualityReport.quality.toUpperCase()}\n\n` +
        `Resolution: ${result.depthWidth}x${result.depthHeight}\n` +
        `Accuracy: ${result.depthAccuracy}\n` +
        `Points: ${(result.depthWidth * result.depthHeight).toLocaleString()}\n\n` +
        `${validation.reason}\n\n` +
        `Photo saved to Photos app with depth data!`,
        [{ text: 'OK' }]
      );
    } else {
      console.log('[handleCapturePhoto] ❌ CAPTURE FAILED:', result);
      Alert.alert('Error', 'Failed to capture depth photo. Please try again.');
    }
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
    <View className='h-full w-full bg-black'>
      {/* Remove VisionCamera's Camera component - using native DepthPhotoCapture instead */}
      <View className='absolute top-0 left-0 right-0 bottom-0 w-full h-full flex justify-center items-center'>
        <View className='bg-black/50 p-4 rounded-lg mb-4'>
          <Text className='text-white text-center mb-2'>
            {cameraReady ? '✅ Camera Ready' : '⏳ Setting up camera...'}
          </Text>
          <Text className='text-white text-center text-sm'>
            Depth Available: {depthAvailable ? 'Yes' : 'No'}
          </Text>
          {lastCaptureResult && (
            <>
              <Text className='text-white text-center text-sm'>
                Last Capture: {lastCaptureResult.depthAccuracy} accuracy
              </Text>
              <Text className='text-white text-center text-sm'>
                Depth Size: {lastCaptureResult.depthWidth}x{lastCaptureResult.depthHeight}
              </Text>
            </>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={handleCapturePhoto}
          disabled={!cameraReady || !depthAvailable || isScanning}
          className={`px-8 py-4 rounded-lg ${
            !cameraReady || !depthAvailable || isScanning
              ? 'bg-gray-500' 
              : 'bg-blue-500'
          }`}
        >
          <Text className='text-white text-xl font-bold text-center'>
            {!cameraReady ? 'Setting Up...' : isScanning ? 'Capturing...' : 'Capture Depth Photo'}
          </Text>
        </TouchableOpacity>
        
        {/* Test Backend Connection Button */}
        <TouchableOpacity 
          onPress={testBackendConnection}
          className='px-6 py-3 rounded-lg bg-green-600 mt-4'
        >
          <Text className='text-white text-sm font-bold text-center'>
            🧪 Test Backend Connection
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 

