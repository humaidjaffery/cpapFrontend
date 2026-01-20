import { VisionCameraProxy, Frame } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('CheckFace', {})

export interface CheckFaceData {
  timestamp: number;
  status: string;
}

export function checkFaceFrameProcessor(frame: Frame): CheckFaceData | null {
  
  'worklet'
  if (plugin == null) {
    throw new Error("Failed to load Frame Processor Plugin!")
  }
  
  try {
    const result = plugin.call(frame) as unknown as CheckFaceData;
    return result;
  } catch (error) {
    console.error("Frame processor error:", error);
    return null;
  }
}
