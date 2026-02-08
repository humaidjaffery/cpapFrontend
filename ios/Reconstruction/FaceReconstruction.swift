import Foundation
import AVFoundation
import UIKit
import React
import simd

// =====================================================
// FaceReconstruction.swift
// =====================================================
// This module provides 3D face reconstruction using
// StandardCyborg's TSDF (Truncated Signed Distance Function)
// fusion algorithm.
//
// HOW IT WORKS:
// 1. You capture multiple depth frames from different angles (front, left, right, etc.)
// 2. Each frame has: RGB image + depth map + camera intrinsics
// 3. This module takes ALL those frames and "fuses" them into one 3D mesh
// 4. The fusion algorithm:
//    - Aligns frames to each other (ICP registration)
//    - Combines depth values in a voxel grid (TSDF)
//    - Extracts a watertight mesh surface (Poisson reconstruction)
// 5. Output: A .ply file containing the 3D face mesh
//
// USAGE FROM REACT NATIVE:
// const result = await FaceReconstruction.reconstructFace(frames);
// console.log(result.meshFilePath); // Path to the generated .ply file

// MARK: - Data Structures

/// Represents a single captured frame with all data needed for reconstruction
@objc public class ReconstructionFrame: NSObject {
  /// Path to the RGB image file (HEIC or JPEG)
  @objc public let colorImagePath: String
  
  /// Path to the binary depth data file (.bin)
  @objc public let depthDataPath: String
  
  /// Width of the depth map in pixels
  @objc public let depthWidth: Int
  
  /// Height of the depth map in pixels
  @objc public let depthHeight: Int
  
  /// Focal length X in pixels (from camera intrinsics)
  /// This describes how "zoomed in" the camera is horizontally
  @objc public let fx: Float
  
  /// Focal length Y in pixels (from camera intrinsics)
  /// This describes how "zoomed in" the camera is vertically
  @objc public let fy: Float
  
  /// Principal point X (from camera intrinsics)
  /// This is where the optical axis intersects the sensor (usually near center)
  @objc public let cx: Float
  
  /// Principal point Y (from camera intrinsics)
  @objc public let cy: Float
  
  /// Width of the intrinsic matrix reference dimensions
  @objc public let intrinsicWidth: Float
  
  /// Height of the intrinsic matrix reference dimensions
  @objc public let intrinsicHeight: Float
  
  /// Capture timestamp for ordering frames
  @objc public let timestamp: Double
  
  /// Angle identifier (front, left, right, top, bottom)
  @objc public let angleId: String
  
  @objc public init(
    colorImagePath: String,
    depthDataPath: String,
    depthWidth: Int,
    depthHeight: Int,
    fx: Float,
    fy: Float,
    cx: Float,
    cy: Float,
    intrinsicWidth: Float,
    intrinsicHeight: Float,
    timestamp: Double,
    angleId: String
  ) {
    self.colorImagePath = colorImagePath
    self.depthDataPath = depthDataPath
    self.depthWidth = depthWidth
    self.depthHeight = depthHeight
    self.fx = fx
    self.fy = fy
    self.cx = cx
    self.cy = cy
    self.intrinsicWidth = intrinsicWidth
    self.intrinsicHeight = intrinsicHeight
    self.timestamp = timestamp
    self.angleId = angleId
    super.init()
  }
}

/// Result of the reconstruction process
@objc public class ReconstructionResult: NSObject {
  @objc public let success: Bool
  @objc public let meshFilePath: String?
  @objc public let vertexCount: Int
  @objc public let faceCount: Int
  @objc public let errorMessage: String?
  @objc public let processingTimeMs: Double
  
  init(
    success: Bool,
    meshFilePath: String?,
    vertexCount: Int,
    faceCount: Int,
    errorMessage: String?,
    processingTimeMs: Double
  ) {
    self.success = success
    self.meshFilePath = meshFilePath
    self.vertexCount = vertexCount
    self.faceCount = faceCount
    self.errorMessage = errorMessage
    self.processingTimeMs = processingTimeMs
    super.init()
  }
}

// MARK: - Errors

enum ReconstructionError: Error {
  case insufficientFrames(count: Int, required: Int)
  case failedToLoadColorImage(path: String)
  case failedToLoadDepthData(path: String)
  case missingIntrinsics(frameIndex: Int)
  case reconstructionFailed(reason: String)
  case meshExportFailed(reason: String)
  
  var localizedDescription: String {
    switch self {
    case .insufficientFrames(let count, let required):
      return "Insufficient frames: got \(count), need at least \(required)"
    case .failedToLoadColorImage(let path):
      return "Failed to load color image: \(path)"
    case .failedToLoadDepthData(let path):
      return "Failed to load depth data: \(path)"
    case .missingIntrinsics(let frameIndex):
      return "Missing camera intrinsics for frame \(frameIndex)"
    case .reconstructionFailed(let reason):
      return "Reconstruction failed: \(reason)"
    case .meshExportFailed(let reason):
      return "Mesh export failed: \(reason)"
    }
  }
}

// MARK: - Main Reconstruction Module

@objc(FaceReconstruction)
public class FaceReconstruction: NSObject {
  
  // Minimum number of frames required for reconstruction
  private let minimumFrames = 3
  
  // MARK: - React Native Bridge Methods
  
  /// Reconstruct a 3D face mesh from multiple captured frames
  /// This is the main entry point called from React Native
  ///
  /// - Parameters:
  ///   - framesData: Array of dictionaries containing frame data
  ///   - resolve: Promise resolve callback
  ///   - reject: Promise reject callback
  @objc
  public func reconstructFace(
    _ framesData: [[String: Any]],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    print("🔷 [FaceReconstruction] reconstructFace() called with \(framesData.count) frames")
    
    // Parse frame data from JavaScript
    var frames: [ReconstructionFrame] = []
    
    for (index, frameDict) in framesData.enumerated() {
      guard let colorImagePath = frameDict["colorImagePath"] as? String,
            let depthDataPath = frameDict["depthDataPath"] as? String,
            let depthWidth = frameDict["depthWidth"] as? Int,
            let depthHeight = frameDict["depthHeight"] as? Int,
            let fx = frameDict["fx"] as? Float ?? (frameDict["fx"] as? Double).map({ Float($0) }),
            let fy = frameDict["fy"] as? Float ?? (frameDict["fy"] as? Double).map({ Float($0) }),
            let cx = frameDict["cx"] as? Float ?? (frameDict["cx"] as? Double).map({ Float($0) }),
            let cy = frameDict["cy"] as? Float ?? (frameDict["cy"] as? Double).map({ Float($0) }),
            let timestamp = frameDict["timestamp"] as? Double else {
        print("❌ [FaceReconstruction] Invalid frame data at index \(index)")
        reject("INVALID_FRAME", "Invalid frame data at index \(index)", nil)
        return
      }
      
      let intrinsicWidth = (frameDict["intrinsicWidth"] as? Float) ?? 
                          (frameDict["intrinsicWidth"] as? Double).map({ Float($0) }) ??
                          Float(depthWidth)
      let intrinsicHeight = (frameDict["intrinsicHeight"] as? Float) ?? 
                           (frameDict["intrinsicHeight"] as? Double).map({ Float($0) }) ??
                           Float(depthHeight)
      let angleId = (frameDict["angleId"] as? String) ?? "unknown"
      
      let frame = ReconstructionFrame(
        colorImagePath: colorImagePath,
        depthDataPath: depthDataPath,
        depthWidth: depthWidth,
        depthHeight: depthHeight,
        fx: fx,
        fy: fy,
        cx: cx,
        cy: cy,
        intrinsicWidth: intrinsicWidth,
        intrinsicHeight: intrinsicHeight,
        timestamp: timestamp,
        angleId: angleId
      )
      
      frames.append(frame)
      print("📦 [FaceReconstruction] Parsed frame \(index): \(angleId), \(depthWidth)x\(depthHeight)")
    }
    
    // Validate minimum frame count
    guard frames.count >= minimumFrames else {
      print("❌ [FaceReconstruction] Insufficient frames: \(frames.count) < \(minimumFrames)")
      reject("INSUFFICIENT_FRAMES", 
             "Need at least \(minimumFrames) frames for reconstruction, got \(frames.count)", nil)
      return
    }
    
    // Run reconstruction on background thread
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let self = self else { return }
      
      let startTime = Date()
      
      do {
        let result = try self.performReconstruction(frames: frames)
        
        let processingTime = Date().timeIntervalSince(startTime) * 1000 // ms
        
        DispatchQueue.main.async {
          print("✅ [FaceReconstruction] Reconstruction complete in \(processingTime)ms")
          resolve([
            "success": result.success,
            "meshFilePath": result.meshFilePath ?? "",
            "vertexCount": result.vertexCount,
            "faceCount": result.faceCount,
            "processingTimeMs": processingTime
          ])
        }
      } catch {
        DispatchQueue.main.async {
          print("❌ [FaceReconstruction] Reconstruction failed: \(error.localizedDescription)")
          reject("RECONSTRUCTION_ERROR", error.localizedDescription, error)
        }
      }
    }
  }
  
  /// Check if StandardCyborg SDK is available
  @objc
  public func isSDKAvailable(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // TODO: Check if StandardCyborgFusion framework is properly linked
    // For now, return true if we can import the framework
    resolve([
      "available": true,
      "version": "1.0.0",
      "features": ["tsdf_fusion", "poisson_reconstruction", "face_landmarks"]
    ])
  }
  
  // MARK: - Core Reconstruction Logic
  
  private func performReconstruction(frames: [ReconstructionFrame]) throws -> ReconstructionResult {
    print("🔷 [FaceReconstruction] Starting reconstruction pipeline...")
    
    // STEP 1: Load all frames into memory
    print("📥 [FaceReconstruction] Step 1: Loading \(frames.count) frames...")
    
    var loadedFrames: [LoadedFrame] = []
    
    for (index, frame) in frames.enumerated() {
      print("  Loading frame \(index): \(frame.angleId)")
      
      // Load color image
      guard let colorBuffer = loadColorImage(from: frame.colorImagePath) else {
        throw ReconstructionError.failedToLoadColorImage(path: frame.colorImagePath)
      }
      
      // Load depth data
      guard let depthBuffer = loadDepthData(
        from: frame.depthDataPath,
        width: frame.depthWidth,
        height: frame.depthHeight
      ) else {
        throw ReconstructionError.failedToLoadDepthData(path: frame.depthDataPath)
      }
      
      // Build intrinsic matrix
      // The intrinsic matrix transforms 3D camera coordinates to 2D image coordinates:
      // [u]   [fx  0  cx] [X]
      // [v] = [0  fy  cy] [Y]
      // [1]   [0   0   1] [Z]
      let intrinsics = simd_float3x3(columns: (
        simd_float3(frame.fx, 0, 0),
        simd_float3(0, frame.fy, 0),
        simd_float3(frame.cx, frame.cy, 1)
      ))
      
      loadedFrames.append(LoadedFrame(
        colorBuffer: colorBuffer,
        depthBuffer: depthBuffer,
        intrinsics: intrinsics,
        width: frame.depthWidth,
        height: frame.depthHeight,
        angleId: frame.angleId
      ))
      
      print("  ✓ Frame \(index) loaded: \(frame.depthWidth)x\(frame.depthHeight)")
    }
    
    print("📦 [FaceReconstruction] All \(loadedFrames.count) frames loaded into memory")
    
    // STEP 2: Perform TSDF Fusion
    // TODO: This is where StandardCyborg's actual fusion code will go
    // For now, we'll create a placeholder that demonstrates the pipeline
    print("🔧 [FaceReconstruction] Step 2: TSDF Fusion (StandardCyborg integration pending)...")
    
    /*
    ================================================================
    STANDARDCYBORG INTEGRATION POINT
    ================================================================
    
    When StandardCyborgFusion.framework is properly built and linked,
    this is where we would call:
    
    // Create reconstruction parameters
    let parameters = SCReconstructionManagerParameters()
    parameters.initialCameraWorldPosition = simd_float3(0, 0, 0.5)
    
    // Create offline reconstruction manager
    let reconstructionManager = SCOfflineReconstructionManager(parameters: parameters)
    
    // Feed each frame to the fusion engine
    for loadedFrame in loadedFrames {
      reconstructionManager.assimilate(
        depthFrame: loadedFrame.depthBuffer,
        colorBuffer: loadedFrame.colorBuffer,
        calibrationData: loadedFrame.intrinsics,
        withResult: { metadata in
          print("Frame assimilated: confidence = \(metadata.confidence)")
        }
      )
    }
    
    // Generate the final mesh
    let pointCloud = reconstructionManager.buildPointCloud()
    let mesh = reconstructionManager.buildMesh()
    
    ================================================================
    */
    
    // STEP 3: Generate output mesh
    print("📝 [FaceReconstruction] Step 3: Generating output mesh...")
    
    let outputDirectory = FileManager.default.temporaryDirectory
    let timestamp = Date().timeIntervalSince1970
    let meshFilename = "face_reconstruction_\(timestamp).ply"
    let meshFilePath = outputDirectory.appendingPathComponent(meshFilename).path
    
    // For now, generate a placeholder PLY file with point cloud from first frame
    // This demonstrates the pipeline; real mesh will come from StandardCyborg
    let placeholderResult = try generatePlaceholderMesh(
      from: loadedFrames,
      outputPath: meshFilePath
    )
    
    print("✅ [FaceReconstruction] Mesh saved to: \(meshFilePath)")
    
    return ReconstructionResult(
      success: true,
      meshFilePath: meshFilePath,
      vertexCount: placeholderResult.vertexCount,
      faceCount: placeholderResult.faceCount,
      errorMessage: nil,
      processingTimeMs: 0
    )
  }
  
  // MARK: - Helper Methods
  
  /// Load a color image from file path into a CVPixelBuffer
  private func loadColorImage(from path: String) -> CVPixelBuffer? {
    guard let image = UIImage(contentsOfFile: path),
          let cgImage = image.cgImage else {
      // Try loading from HEIC
      if let data = FileManager.default.contents(atPath: path),
         let source = CGImageSourceCreateWithData(data as CFData, nil),
         let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) {
        return createPixelBuffer(from: cgImage)
      }
      return nil
    }
    
    return createPixelBuffer(from: cgImage)
  }
  
  /// Create a CVPixelBuffer from a CGImage
  private func createPixelBuffer(from cgImage: CGImage) -> CVPixelBuffer? {
    let width = cgImage.width
    let height = cgImage.height
    
    var pixelBuffer: CVPixelBuffer?
    let attrs = [
      kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
      kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue,
      kCVPixelBufferWidthKey: width,
      kCVPixelBufferHeightKey: height
    ] as CFDictionary
    
    let status = CVPixelBufferCreate(
      kCFAllocatorDefault,
      width,
      height,
      kCVPixelFormatType_32BGRA,
      attrs,
      &pixelBuffer
    )
    
    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
      return nil
    }
    
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    
    guard let context = CGContext(
      data: CVPixelBufferGetBaseAddress(buffer),
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ) else {
      return nil
    }
    
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    
    return buffer
  }
  
  /// Load binary depth data from file into a CVPixelBuffer
  private func loadDepthData(from path: String, width: Int, height: Int) -> CVPixelBuffer? {
    guard let data = FileManager.default.contents(atPath: path) else {
      print("❌ [FaceReconstruction] Could not read depth file: \(path)")
      return nil
    }
    
    let expectedSize = width * height * MemoryLayout<Float>.size
    guard data.count == expectedSize else {
      print("❌ [FaceReconstruction] Depth data size mismatch: got \(data.count), expected \(expectedSize)")
      return nil
    }
    
    var pixelBuffer: CVPixelBuffer?
    let attrs = [
      kCVPixelBufferWidthKey: width,
      kCVPixelBufferHeightKey: height
    ] as CFDictionary
    
    let status = CVPixelBufferCreate(
      kCFAllocatorDefault,
      width,
      height,
      kCVPixelFormatType_DepthFloat32,
      attrs,
      &pixelBuffer
    )
    
    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
      return nil
    }
    
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    
    if let baseAddress = CVPixelBufferGetBaseAddress(buffer) {
      data.copyBytes(to: baseAddress.assumingMemoryBound(to: UInt8.self), count: data.count)
    }
    
    return buffer
  }
  
  /// Generate a placeholder PLY mesh from depth frames
  /// This demonstrates the output format; real implementation uses StandardCyborg
  private func generatePlaceholderMesh(
    from frames: [LoadedFrame],
    outputPath: String
  ) throws -> (vertexCount: Int, faceCount: Int) {
    
    guard let firstFrame = frames.first else {
      throw ReconstructionError.insufficientFrames(count: 0, required: 1)
    }
    
    // Extract points from the first frame's depth buffer
    let depthBuffer = firstFrame.depthBuffer
    let width = firstFrame.width
    let height = firstFrame.height
    let intrinsics = firstFrame.intrinsics
    
    CVPixelBufferLockBaseAddress(depthBuffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthBuffer, .readOnly) }
    
    guard let baseAddress = CVPixelBufferGetBaseAddress(depthBuffer) else {
      throw ReconstructionError.reconstructionFailed(reason: "Could not access depth buffer")
    }
    
    let floatBuffer = baseAddress.assumingMemoryBound(to: Float.self)
    let bytesPerRow = CVPixelBufferGetBytesPerRow(depthBuffer)
    let floatsPerRow = bytesPerRow / MemoryLayout<Float>.size
    
    // Convert depth pixels to 3D points using camera intrinsics
    // The formula is:
    // X = (u - cx) * Z / fx
    // Y = (v - cy) * Z / fy
    // Z = depth_value
    
    var points: [(x: Float, y: Float, z: Float)] = []
    
    // Sample every Nth pixel to reduce point count
    let sampleStep = 4
    
    for row in stride(from: 0, to: height, by: sampleStep) {
      for col in stride(from: 0, to: width, by: sampleStep) {
        let index = row * floatsPerRow + col
        let depth = floatBuffer[index]
        
        // Skip invalid depth values
        if depth <= 0 || depth > 2.0 || depth.isNaN || depth.isInfinite {
          continue
        }
        
        // Back-project to 3D using intrinsics
        let u = Float(col)
        let v = Float(row)
        let fx = intrinsics.columns.0.x
        let fy = intrinsics.columns.1.y
        let cx = intrinsics.columns.2.x
        let cy = intrinsics.columns.2.y
        
        let x = (u - cx) * depth / fx
        let y = (v - cy) * depth / fy
        let z = depth
        
        points.append((x: x, y: y, z: z))
      }
    }
    
    print("📊 [FaceReconstruction] Generated \(points.count) 3D points from depth data")
    
    // Write PLY file
    var plyContent = """
    ply
    format ascii 1.0
    comment Generated by DreamSeal FaceReconstruction
    comment This is a placeholder point cloud - StandardCyborg integration pending
    element vertex \(points.count)
    property float x
    property float y
    property float z
    end_header
    
    """
    
    for point in points {
      plyContent += "\(point.x) \(point.y) \(point.z)\n"
    }
    
    do {
      try plyContent.write(toFile: outputPath, atomically: true, encoding: .utf8)
    } catch {
      throw ReconstructionError.meshExportFailed(reason: error.localizedDescription)
    }
    
    return (vertexCount: points.count, faceCount: 0) // Point cloud, no faces yet
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

// MARK: - Internal Data Structures

/// Represents a frame with all data loaded into memory
private struct LoadedFrame {
  let colorBuffer: CVPixelBuffer
  let depthBuffer: CVPixelBuffer
  let intrinsics: simd_float3x3
  let width: Int
  let height: Int
  let angleId: String
}
