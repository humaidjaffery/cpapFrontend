#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("Frontend/Frontend-Swift.h")
#import "Frontend/Frontend-Swift.h"
#else
#import "Frontend-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(TrueDepthFrameProcessorPlugin, trueDepthFrameProcessor)