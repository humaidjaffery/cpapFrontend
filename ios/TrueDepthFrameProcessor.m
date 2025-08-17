#if __has_include(<VisionCamera/FrameProcessorPlugin.h>)

#pragma message "VisionCamera headers found - proceeding with plugin registration (humaid   )"

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("frontend-Swift.h")
#pragma message "✅ frontend-Swift.h found (humaid)"
#import "frontend-Swift.h"
#pragma message "Swift bridging header imported successfully (humaid)"

+ (void)load {
    NSLog(@"🔵 TrueDepthFrameProcessorBridge: Objective-C bridge is loading... (humaid)");
    
    // Check if Swift class exists
    Class swiftClass = NSClassFromString(@"TrueDepthFrameProcessor");
    if (swiftClass) {
        NSLog(@"✅ TrueDepthFrameProcessorBridge: Swift class 'TrueDepthFrameProcessor' found! (humaid)");
    } else {
        NSLog(@"❌ TrueDepthFrameProcessorBridge: Swift class 'TrueDepthFrameProcessor' NOT found! (humaid)");
    }
}

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(TrueDepthFrameProcessor, trueDepthFrameProcessor)

#pragma message "VISION_EXPORT_SWIFT_FRAME_PROCESSOR macro called for TrueDepthFrameProcessor"

#else
// Debug: VisionCamera not found
#pragma message "❌ VisionCamera headers NOT found - plugin will not be registered (huamid)"
#warning "VisionCamera headers not found. Make sure react-native-vision-camera is properly installed. ((huamid))"

#endif