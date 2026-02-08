/**
 * =====================================================
 * faceReconstruction.ts
 * =====================================================
 * TypeScript wrapper for the native FaceReconstruction module.
 * 
 * This file provides a clean, type-safe interface to call the
 * native iOS reconstruction code from React Native.
 * 
 * HOW IT WORKS:
 * 1. NativeModules.FaceReconstruction accesses the native module
 * 2. We wrap it with TypeScript interfaces for type safety
 * 3. We provide helpful documentation and error handling
 * 
 * USAGE:
 * ```typescript
 * import FaceReconstruction, { ReconstructionFrame } from '../utils/faceReconstruction';
 * 
 * // Collect frames during capture
 * const frames: ReconstructionFrame[] = [
 *   {
 *     colorImagePath: '/path/to/front.heic',
 *     depthDataPath: '/path/to/front.bin',
 *     depthWidth: 640,
 *     depthHeight: 480,
 *     fx: 500, fy: 500, cx: 320, cy: 240,
 *     timestamp: Date.now(),
 *     angleId: 'front'
 *   },
 *   // ... more frames
 * ];
 * 
 * // Reconstruct after capture
 * const result = await FaceReconstruction.reconstructFace(frames);
 * console.log('Mesh saved to:', result.meshFilePath);
 * ```
 */

import { NativeModules, Platform } from 'react-native';

// Error message shown when native module isn't properly linked
const LINKING_ERROR =
  `The package 'FaceReconstruction' doesn't seem to be linked. Make sure:\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  `- The Reconstruction folder is added to Xcode project\n` +
  `- You rebuilt the app after adding the native module\n` +
  `- You are not using Expo Go (native modules require dev client)`;

// Access the native module, or create a proxy that throws helpful errors
const FaceReconstructionModule = NativeModules.FaceReconstruction
  ? NativeModules.FaceReconstruction
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// =====================================================
// Type Definitions
// =====================================================

/**
 * Input frame data for reconstruction.
 * 
 * Each frame represents one capture from a specific angle.
 * You need at least 3 frames (ideally 5: front, left, right, top, bottom)
 * for good reconstruction quality.
 */
export interface ReconstructionFrame {
  /**
   * Path to the RGB image file (HEIC format from TrueDepth capture)
   * Example: "/var/mobile/.../depth_photo_1234567890.heic"
   */
  colorImagePath: string;
  
  /**
   * Path to the binary depth data file
   * This is the raw Float32 depth array saved during capture
   * Example: "/var/mobile/.../depth_data_1234567890.bin"
   */
  depthDataPath: string;
  
  /**
   * Width of the depth map in pixels
   * Typically 640 for TrueDepth camera
   */
  depthWidth: number;
  
  /**
   * Height of the depth map in pixels
   * Typically 480 for TrueDepth camera
   */
  depthHeight: number;
  
  /**
   * Focal length X in pixels (from camera intrinsics)
   * 
   * This describes how "zoomed in" the camera is horizontally.
   * Higher values = more telephoto, narrower field of view.
   * Typical values for TrueDepth: 400-600 pixels
   */
  fx: number;
  
  /**
   * Focal length Y in pixels (from camera intrinsics)
   * 
   * This describes how "zoomed in" the camera is vertically.
   * Usually very close to fx (square pixels).
   */
  fy: number;
  
  /**
   * Principal point X (from camera intrinsics)
   * 
   * This is the X coordinate where the camera's optical axis
   * intersects the image sensor. Usually near the center.
   * Typical value: depthWidth / 2 ≈ 320
   */
  cx: number;
  
  /**
   * Principal point Y (from camera intrinsics)
   * 
   * This is the Y coordinate where the camera's optical axis
   * intersects the image sensor. Usually near the center.
   * Typical value: depthHeight / 2 ≈ 240
   */
  cy: number;
  
  /**
   * Reference width for the intrinsic matrix
   * May differ from depthWidth if intrinsics were calibrated
   * at a different resolution
   */
  intrinsicWidth?: number;
  
  /**
   * Reference height for the intrinsic matrix
   */
  intrinsicHeight?: number;
  
  /**
   * Capture timestamp (milliseconds since epoch)
   * Used to order frames chronologically
   */
  timestamp: number;
  
  /**
   * Angle identifier for this capture
   * One of: 'front', 'left', 'right', 'top', 'bottom'
   */
  angleId: 'front' | 'left' | 'right' | 'top' | 'bottom' | string;
}

/**
 * Result of the reconstruction process
 */
export interface ReconstructionResult {
  /**
   * Whether reconstruction succeeded
   */
  success: boolean;
  
  /**
   * Path to the generated mesh file (.ply format)
   * 
   * PLY (Polygon File Format) is a standard 3D format that stores:
   * - Vertex positions (x, y, z coordinates)
   * - Vertex colors (RGB)
   * - Face indices (which vertices form each triangle)
   * 
   * You can send this file to your backend for further processing.
   */
  meshFilePath: string;
  
  /**
   * Number of vertices in the generated mesh
   * More vertices = more detail but larger file
   */
  vertexCount: number;
  
  /**
   * Number of faces (triangles) in the generated mesh
   * Will be 0 for point clouds, > 0 for true meshes
   */
  faceCount: number;
  
  /**
   * Time taken for reconstruction in milliseconds
   */
  processingTimeMs: number;
  
  /**
   * Error message if reconstruction failed
   */
  errorMessage?: string;
}

/**
 * SDK availability check result
 */
export interface SDKStatus {
  /**
   * Whether StandardCyborg SDK is properly linked
   */
  available: boolean;
  
  /**
   * SDK version string
   */
  version: string;
  
  /**
   * List of available features
   */
  features: string[];
}

// =====================================================
// Exported Functions
// =====================================================

export default {
  /**
   * Reconstruct a 3D face mesh from multiple captured frames.
   * 
   * This function takes all the depth frames you captured from different
   * angles and combines them into a single 3D mesh using StandardCyborg's
   * TSDF (Truncated Signed Distance Function) fusion algorithm.
   * 
   * THE PROCESS:
   * 1. Load all frames (RGB + depth + intrinsics) into memory
   * 2. Align frames to each other using ICP (Iterative Closest Point)
   * 3. Fuse depth values in a voxel grid (TSDF)
   * 4. Extract mesh surface using Poisson reconstruction
   * 5. Save result as .ply file
   * 
   * REQUIREMENTS:
   * - Minimum 3 frames (5 recommended for best quality)
   * - Each frame must have valid depth data
   * - Camera intrinsics (fx, fy, cx, cy) are required
   * 
   * @param frames Array of captured frames with depth data and intrinsics
   * @returns Promise resolving to reconstruction result with mesh file path
   * 
   * @example
   * ```typescript
   * // After capturing all angles...
   * const result = await FaceReconstruction.reconstructFace(capturedFrames);
   * 
   * if (result.success) {
   *   console.log(`✅ Created mesh with ${result.vertexCount} vertices`);
   *   console.log(`📁 Saved to: ${result.meshFilePath}`);
   *   
   *   // Send to backend
   *   await uploadMeshToBackend(result.meshFilePath);
   * }
   * ```
   */
  async reconstructFace(frames: ReconstructionFrame[]): Promise<ReconstructionResult> {
    console.log(`🔷 [FaceReconstruction] Starting reconstruction with ${frames.length} frames`);
    
    // Validate input
    if (!frames || frames.length === 0) {
      throw new Error('No frames provided for reconstruction');
    }
    
    if (frames.length < 3) {
      console.warn(`⚠️ [FaceReconstruction] Only ${frames.length} frames provided. Recommend at least 3-5 for good quality.`);
    }
    
    // Log frame info for debugging
    frames.forEach((frame, index) => {
      console.log(`  Frame ${index} [${frame.angleId}]: ${frame.depthWidth}x${frame.depthHeight}, fx=${frame.fx.toFixed(1)}`);
    });
    
    try {
      const result = await FaceReconstructionModule.reconstructFace(frames);
      
      if (result.success) {
        console.log(`✅ [FaceReconstruction] Complete!`);
        console.log(`   Vertices: ${result.vertexCount}`);
        console.log(`   Faces: ${result.faceCount}`);
        console.log(`   Time: ${result.processingTimeMs?.toFixed(0)}ms`);
        console.log(`   Path: ${result.meshFilePath}`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ [FaceReconstruction] Failed:`, error);
      throw error;
    }
  },
  
  /**
   * Check if the StandardCyborg SDK is available and properly linked.
   * 
   * Call this before attempting reconstruction to verify the native
   * module is working correctly.
   * 
   * @returns Promise resolving to SDK status
   * 
   * @example
   * ```typescript
   * const status = await FaceReconstruction.isSDKAvailable();
   * if (status.available) {
   *   console.log(`SDK v${status.version} ready`);
   *   console.log(`Features: ${status.features.join(', ')}`);
   * }
   * ```
   */
  async isSDKAvailable(): Promise<SDKStatus> {
    return FaceReconstructionModule.isSDKAvailable();
  },
  
  /**
   * Helper function to create a ReconstructionFrame from a DepthPhotoCaptureResult.
   * 
   * This makes it easy to convert your capture results into the format
   * needed for reconstruction.
   * 
   * @param captureResult Result from DepthPhotoCapture.captureDepthPhoto()
   * @param angleId Which angle this capture represents
   * @returns ReconstructionFrame ready for reconstruction
   * 
   * @example
   * ```typescript
   * const captureResult = await DepthPhotoCapture.captureDepthPhoto();
   * const frame = FaceReconstruction.createFrameFromCapture(captureResult, 'front');
   * frames.push(frame);
   * ```
   */
  createFrameFromCapture(
    captureResult: {
      filePath: string;
      depthDataPath?: string;
      depthWidth: number;
      depthHeight: number;
      fx?: number;
      fy?: number;
      cx?: number;
      cy?: number;
      intrinsicWidth?: number;
      intrinsicHeight?: number;
      timestamp: number;
      hasIntrinsics?: boolean;
    },
    angleId: string
  ): ReconstructionFrame {
    // Validate intrinsics are present
    if (!captureResult.hasIntrinsics || 
        captureResult.fx === undefined || 
        captureResult.fy === undefined ||
        captureResult.cx === undefined ||
        captureResult.cy === undefined) {
      console.warn(`⚠️ [FaceReconstruction] Frame missing camera intrinsics. Using defaults.`);
    }
    
    if (!captureResult.depthDataPath) {
      throw new Error('Capture result missing depthDataPath. Make sure depth was captured successfully.');
    }
    
    return {
      colorImagePath: captureResult.filePath,
      depthDataPath: captureResult.depthDataPath,
      depthWidth: captureResult.depthWidth,
      depthHeight: captureResult.depthHeight,
      // Use captured intrinsics or sensible defaults for TrueDepth
      fx: captureResult.fx ?? captureResult.depthWidth * 0.8,  // ~512 for 640 width
      fy: captureResult.fy ?? captureResult.depthHeight * 1.0, // ~480 for 480 height  
      cx: captureResult.cx ?? captureResult.depthWidth / 2,    // 320 for 640 width
      cy: captureResult.cy ?? captureResult.depthHeight / 2,   // 240 for 480 height
      intrinsicWidth: captureResult.intrinsicWidth ?? captureResult.depthWidth,
      intrinsicHeight: captureResult.intrinsicHeight ?? captureResult.depthHeight,
      timestamp: captureResult.timestamp,
      angleId: angleId,
    };
  },
};
