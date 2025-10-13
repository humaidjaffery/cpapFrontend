import { VisionCameraProxy, Frame } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('trueDepthFrameProcessor', {})

export function trueDepthFrameProcessor(frame: Frame) {
  'worklet'
  if (plugin == null) {
    throw new Error("Failed to load Frame Processor Plugin!")
  }
  console.log("in Trye DEpth Frame processor")
  return plugin.call(frame)
}
