#if __has_include(<VisionCamera/FrameProcessorPlugin.h>)
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#import "Frontend-Swift.h"

// // Example for a Swift Frame Processor plugin automatic registration
VISION_EXPORT_SWIFT_FRAME_PROCESSOR(TrueDepthFrameProcessor, trueDepthFrameProcessor)

#endif