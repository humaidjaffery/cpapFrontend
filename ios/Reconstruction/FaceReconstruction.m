// =====================================================
// FaceReconstruction.m
// =====================================================
// This is the Objective-C bridge file that connects
// React Native's JavaScript to our Swift FaceReconstruction module.
//
// WHY IS THIS NEEDED?
// React Native's native module system uses Objective-C macros like
// RCT_EXTERN_MODULE and RCT_EXTERN_METHOD to expose native code to JS.
// Since our main code is in Swift, we need this bridge file to:
// 1. Tell React Native that FaceReconstruction module exists
// 2. Declare which methods are available to call from JavaScript
// 3. Define the parameter types for each method
//
// HOW IT WORKS:
// 1. RCT_EXTERN_MODULE(FaceReconstruction, NSObject) registers the module
// 2. RCT_EXTERN_METHOD declares each callable method with its parameters
// 3. When JS calls NativeModules.FaceReconstruction.methodName(),
//    React Native routes the call to our Swift implementation

#import <React/RCTBridgeModule.h>

// Register FaceReconstruction as a React Native module
// First parameter: Module name (must match @objc(FaceReconstruction) in Swift)
// Second parameter: Base class (NSObject for standard modules)
@interface RCT_EXTERN_MODULE(FaceReconstruction, NSObject)

// =====================================================
// reconstructFace Method
// =====================================================
// Main method to reconstruct 3D face mesh from captured frames
//
// Parameters:
// - framesData: Array of frame dictionaries, each containing:
//   - colorImagePath: String path to RGB image
//   - depthDataPath: String path to binary depth file
//   - depthWidth: Int width of depth map
//   - depthHeight: Int height of depth map
//   - fx, fy, cx, cy: Float camera intrinsics
//   - timestamp: Double capture time
//   - angleId: String angle identifier
// - resolve: Promise resolve callback (returns result dictionary)
// - reject: Promise reject callback (returns error)
//
// Returns (via resolve):
// - success: Boolean indicating if reconstruction succeeded
// - meshFilePath: String path to output .ply file
// - vertexCount: Int number of vertices in mesh
// - faceCount: Int number of faces in mesh
// - processingTimeMs: Double time taken in milliseconds

RCT_EXTERN_METHOD(reconstructFace:(NSArray *)framesData
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// =====================================================
// isSDKAvailable Method
// =====================================================
// Check if StandardCyborg SDK is properly linked and available
//
// Returns (via resolve):
// - available: Boolean
// - version: String SDK version
// - features: Array of available features

RCT_EXTERN_METHOD(isSDKAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// =====================================================
// requiresMainQueueSetup
// =====================================================
// Tells React Native whether this module needs to be initialized
// on the main thread.
//
// We return NO because:
// - Our reconstruction is CPU-intensive and runs on background threads
// - We don't interact with UI directly
// - Initializing on main thread would block the UI

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
