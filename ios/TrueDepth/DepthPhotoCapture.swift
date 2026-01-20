import Foundation
import AVFoundation
import UIKit
import React
import Photos

@objc(DepthPhotoCapture)
public class DepthPhotoCapture: NSObject {
  private var captureSession: AVCaptureSession?
  private var photoOutput: AVCapturePhotoOutput?
  private var captureDevice: AVCaptureDevice?
  private var photoDelegate: DepthPhotoCaptureDelegate?
  
  @objc
  public func setupCamera(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("📷 [DepthPhotoCapture] setupCamera() called")
    
    // Create capture session
    let session = AVCaptureSession()
    session.sessionPreset = .photo
    print("📷 [DepthPhotoCapture] AVCaptureSession created with .photo preset")
    
    // Find TrueDepth camera (front camera with depth capability)
    print("📷 [DepthPhotoCapture] Searching for TrueDepth camera...")
    guard let device = AVCaptureDevice.default(.builtInTrueDepthCamera, for: .video, position: .front) else {
      print("❌ [DepthPhotoCapture] TrueDepth camera not found")
      reject("CAMERA_ERROR", "TrueDepth camera not available on this device", nil)
      return
    }
    print("✅ [DepthPhotoCapture] TrueDepth camera found: \(device.localizedName)")
    
    // Check if device supports depth data delivery
    let depthFormatCount = device.activeFormat.supportedDepthDataFormats.count
    print("📷 [DepthPhotoCapture] Depth formats available: \(depthFormatCount)")
    guard depthFormatCount > 0 else {
      print("❌ [DepthPhotoCapture] No depth formats supported")
      reject("DEPTH_ERROR", "Device does not support depth data capture", nil)
      return
    }
    
    // Configure device for depth
    print("📷 [DepthPhotoCapture] Configuring device for depth capture...")
    do {
      try device.lockForConfiguration()
      print("📷 [DepthPhotoCapture] Device locked for configuration")
      
      // Find depth format with highest resolution
      let depthFormats = device.activeFormat.supportedDepthDataFormats
      let depthFormat = depthFormats.max(by: { first, second in
        let firstWidth = CMVideoFormatDescriptionGetDimensions(first.formatDescription).width
        let secondWidth = CMVideoFormatDescriptionGetDimensions(second.formatDescription).width
        return firstWidth < secondWidth
      })
      
      if let depthFormat = depthFormat {
        let dimensions = CMVideoFormatDescriptionGetDimensions(depthFormat.formatDescription)
        print("✅ [DepthPhotoCapture] Selected depth format: \(dimensions.width)x\(dimensions.height)")
        device.activeDepthDataFormat = depthFormat
      } else {
        print("⚠️ [DepthPhotoCapture] No depth format selected")
      }
      
      device.unlockForConfiguration()
      print("📷 [DepthPhotoCapture] Device configuration complete")
    } catch {
      print("❌ [DepthPhotoCapture] Configuration error: \(error.localizedDescription)")
      reject("CONFIG_ERROR", "Failed to configure device: \(error.localizedDescription)", error)
      return
    }
    
    // Add device input
    print("📷 [DepthPhotoCapture] Creating device input...")
    do {
      let input = try AVCaptureDeviceInput(device: device)
      if session.canAddInput(input) {
        session.addInput(input)
        print("✅ [DepthPhotoCapture] Device input added to session")
      } else {
        print("❌ [DepthPhotoCapture] Cannot add device input to session")
        reject("INPUT_ERROR", "Cannot add device input to session", nil)
        return
      }
    } catch {
      print("❌ [DepthPhotoCapture] Failed to create device input: \(error.localizedDescription)")
      reject("INPUT_ERROR", "Failed to create device input: \(error.localizedDescription)", error)
      return
    }
    
    // Configure photo output
    print("📷 [DepthPhotoCapture] Configuring photo output...")
    let output = AVCapturePhotoOutput()
    
    if session.canAddOutput(output) {
      session.addOutput(output)
      print("✅ [DepthPhotoCapture] Photo output added to session")
      
      // Enable high resolution capture FIRST
      print("📷 [DepthPhotoCapture] High res capture supported: \(output.isHighResolutionCaptureEnabled)")
      output.isHighResolutionCaptureEnabled = true
      print("📷 [DepthPhotoCapture] High res capture enabled: \(output.isHighResolutionCaptureEnabled)")
      
      // Enable depth data delivery
      print("📷 [DepthPhotoCapture] Depth delivery supported: \(output.isDepthDataDeliverySupported)")
      output.isDepthDataDeliveryEnabled = output.isDepthDataDeliverySupported
      print("📷 [DepthPhotoCapture] Depth delivery enabled: \(output.isDepthDataDeliveryEnabled)")
      
      if !output.isDepthDataDeliveryEnabled {
        print("❌ [DepthPhotoCapture] Depth data delivery could not be enabled")
        reject("DEPTH_ERROR", "Depth data delivery is not supported", nil)
        return
      }
    } else {
      print("❌ [DepthPhotoCapture] Cannot add photo output to session")
      reject("OUTPUT_ERROR", "Cannot add photo output to session", nil)
      return
    }
    
    // Store references
    self.captureSession = session
    self.photoOutput = output
    self.captureDevice = device
    print("✅ [DepthPhotoCapture] References stored")
    
    // Start session on background queue
    print("📷 [DepthPhotoCapture] Starting capture session...")
    DispatchQueue.global(qos: .userInitiated).async {
      session.startRunning()
      print("✅ [DepthPhotoCapture] Capture session started")
      DispatchQueue.main.async {
        print("✅ [DepthPhotoCapture] Setup complete - resolving promise")
        resolve([
          "success": true,
          "depthAvailable": output.isDepthDataDeliveryEnabled
        ])
      }
    }
  }
  
  @objc
  public func captureDepthPhoto(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("📸 [DepthPhotoCapture] captureDepthPhoto() called")
    
    guard let photoOutput = self.photoOutput else {
      print("❌ [DepthPhotoCapture] Photo output not initialized")
      reject("SESSION_ERROR", "Camera session not initialized. Call setupCamera first.", nil)
      return
    }
    print("✅ [DepthPhotoCapture] Photo output exists")
    
    // Create photo settings with HEVC codec (required for depth data)
    print("📸 [DepthPhotoCapture] Creating photo settings with HEVC codec...")
    let photoSettings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.hevc])
    
    // Enable depth data delivery
    print("📸 [DepthPhotoCapture] Depth delivery supported: \(photoOutput.isDepthDataDeliveryEnabled)")
    photoSettings.isDepthDataDeliveryEnabled = photoOutput.isDepthDataDeliveryEnabled
    print("📸 [DepthPhotoCapture] Depth delivery enabled in settings: \(photoSettings.isDepthDataDeliveryEnabled)")
    
    // Enable high resolution photo
    photoSettings.isHighResolutionPhotoEnabled = true
    print("📸 [DepthPhotoCapture] High resolution enabled")
    
    // Create delegate to handle photo capture
    print("📸 [DepthPhotoCapture] Creating capture delegate...")
    let delegate = DepthPhotoCaptureDelegate(resolve: resolve, reject: reject)
    self.photoDelegate = delegate // Keep strong reference until capture completes
    print("📸 [DepthPhotoCapture] Delegate created and stored")
    
    // Capture photo
    print("📸 [DepthPhotoCapture] Initiating photo capture...")
    photoOutput.capturePhoto(with: photoSettings, delegate: delegate)
    print("📸 [DepthPhotoCapture] capturePhoto() called - waiting for delegate callbacks")
  }
  
  @objc
  public func stopCamera(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("🛑 [DepthPhotoCapture] stopCamera() called")
    if let session = captureSession {
      print("🛑 [DepthPhotoCapture] Stopping capture session...")
      DispatchQueue.global(qos: .userInitiated).async {
        session.stopRunning()
        print("✅ [DepthPhotoCapture] Capture session stopped")
        DispatchQueue.main.async {
          resolve(["success": true])
        }
      }
    } else {
      print("⚠️ [DepthPhotoCapture] No active session to stop")
      resolve(["success": false, "message": "No active session"])
    }
  }
  
  @objc
  public func saveToPhotos(_ filePath: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("💾 [DepthPhotoCapture] saveToPhotos() called for: \(filePath)")
    
    let fileURL = URL(fileURLWithPath: filePath)
    
    // Check if file exists
    guard FileManager.default.fileExists(atPath: filePath) else {
      print("❌ [DepthPhotoCapture] File not found at path: \(filePath)")
      reject("FILE_NOT_FOUND", "Photo file not found at specified path", nil)
      return
    }
    
    print("💾 [DepthPhotoCapture] Requesting photo library authorization...")
    PHPhotoLibrary.requestAuthorization { status in
      guard status == .authorized else {
        print("❌ [DepthPhotoCapture] Photo library access denied")
        reject("PERMISSION_DENIED", "Photo library access denied. Please enable in Settings.", nil)
        return
      }
      
      print("✅ [DepthPhotoCapture] Photo library access granted")
      print("💾 [DepthPhotoCapture] Adding photo to library...")
      
      PHPhotoLibrary.shared().performChanges({
        // This preserves the HEIC format with embedded depth data
        let creationRequest = PHAssetCreationRequest.forAsset()
        creationRequest.addResource(with: .photo, fileURL: fileURL, options: nil)
        print("💾 [DepthPhotoCapture] Creation request prepared")
      }, completionHandler: { success, error in
        DispatchQueue.main.async {
          if success {
            print("✅ [DepthPhotoCapture] Photo saved to Photos app successfully!")
            resolve([
              "success": true,
              "message": "Photo with depth data saved to Photos app"
            ])
          } else {
            print("❌ [DepthPhotoCapture] Failed to save: \(error?.localizedDescription ?? "unknown error")")
            reject("SAVE_FAILED", "Failed to save photo: \(error?.localizedDescription ?? "unknown error")", error)
          }
        }
      })
    }
  }
  
  @objc
  public func readDepthBinaryChunk(_ filePath: String, offset: Int, length: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("📖 [DepthPhotoCapture] readDepthBinaryChunk() - offset: \(offset), length: \(length)")
    
    let fileURL = URL(fileURLWithPath: filePath)
    
    guard FileManager.default.fileExists(atPath: filePath) else {
      reject("FILE_NOT_FOUND", "Binary file not found", nil)
      return
    }
    
    do {
      let data = try Data(contentsOf: fileURL)
      let floatCount = data.count / MemoryLayout<Float>.size
      
      guard offset >= 0 && offset < floatCount else {
        reject("INVALID_OFFSET", "Offset out of bounds", nil)
        return
      }
      
      let startByte = offset * MemoryLayout<Float>.size
      let chunkLength = min(length, floatCount - offset)
      let endByte = startByte + (chunkLength * MemoryLayout<Float>.size)
      
      let chunkData = data.subdata(in: startByte..<endByte)
      let floatArray = chunkData.withUnsafeBytes { (ptr: UnsafeRawBufferPointer) -> [Float] in
        Array(ptr.bindMemory(to: Float.self))
      }
      
      resolve([
        "success": true,
        "data": floatArray,
        "offset": offset,
        "length": floatArray.count,
        "totalPoints": floatCount
      ])
    } catch {
      reject("READ_ERROR", "Failed to read binary file: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  public func extractDepthData(_ filePath: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("🔍 [DepthPhotoCapture] extractDepthData() called for: \(filePath)")
    
    let fileURL = URL(fileURLWithPath: filePath)
    
    guard FileManager.default.fileExists(atPath: filePath) else {
      print("❌ [DepthPhotoCapture] File not found")
      reject("FILE_NOT_FOUND", "Photo file not found at specified path", nil)
      return
    }
    
    guard let imageSource = CGImageSourceCreateWithURL(fileURL as CFURL, nil) else {
      print("❌ [DepthPhotoCapture] Could not create image source")
      reject("IMAGE_ERROR", "Could not read image file", nil)
      return
    }
    
    // Get auxiliary depth data
    guard let auxDataInfo = CGImageSourceCopyAuxiliaryDataInfoAtIndex(imageSource, 0, kCGImageAuxiliaryDataTypeDisparity) as? [String: Any] else {
      print("❌ [DepthPhotoCapture] No depth data found in image")
      reject("NO_DEPTH", "No depth data found in image. Make sure photo was captured with depth enabled.", nil)
      return
    }
    
    print("✅ [DepthPhotoCapture] Depth auxiliary data found")
    
    // Create AVDepthData from auxiliary data
    guard let depthData = try? AVDepthData(fromDictionaryRepresentation: auxDataInfo) else {
      print("❌ [DepthPhotoCapture] Could not create AVDepthData")
      reject("DEPTH_ERROR", "Could not parse depth data", nil)
      return
    }
    
    // Convert to Float32 if needed
    let float32DepthData: AVDepthData
    if depthData.depthDataType != kCVPixelFormatType_DepthFloat32 {
      print("🔄 [DepthPhotoCapture] Converting depth to Float32...")
      float32DepthData = depthData.converting(toDepthDataType: kCVPixelFormatType_DepthFloat32)
    } else {
      float32DepthData = depthData
    }
    
    // Get the depth map pixel buffer
    let depthMap = float32DepthData.depthDataMap
    
    CVPixelBufferLockBaseAddress(depthMap, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }
    
    let width = CVPixelBufferGetWidth(depthMap)
    let height = CVPixelBufferGetHeight(depthMap)
    let bytesPerRow = CVPixelBufferGetBytesPerRow(depthMap)
    
    print("🔍 [DepthPhotoCapture] Depth map size: \(width)x\(height)")
    
    guard let baseAddress = CVPixelBufferGetBaseAddress(depthMap) else {
      print("❌ [DepthPhotoCapture] Could not get pixel buffer address")
      reject("BUFFER_ERROR", "Could not access depth map data", nil)
      return
    }
    
    // Extract depth values as array
    let floatBuffer = baseAddress.assumingMemoryBound(to: Float32.self)
    var depthArray: [Float] = []
    depthArray.reserveCapacity(width * height)
    
    print("🔍 [DepthPhotoCapture] Extracting \(width * height) depth values...")
    
    for row in 0..<height {
      let rowStart = row * (bytesPerRow / MemoryLayout<Float32>.size)
      for col in 0..<width {
        let index = rowStart + col
        depthArray.append(floatBuffer[index])
      }
    }
    
    print("✅ [DepthPhotoCapture] Extracted \(depthArray.count) depth values")
    
    // Get min/max for stats
    let minDepth = depthArray.min() ?? 0
    let maxDepth = depthArray.max() ?? 0
    let avgDepth = depthArray.reduce(0, +) / Float(depthArray.count)
    
    print("📊 [DepthPhotoCapture] Depth range: \(minDepth)m to \(maxDepth)m (avg: \(avgDepth)m)")
    
    resolve([
      "success": true,
      "width": width,
      "height": height,
      "depthArray": depthArray,
      "minDepth": minDepth,
      "maxDepth": maxDepth,
      "avgDepth": avgDepth,
      "totalPoints": depthArray.count
    ])
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Helper Methods
  
  /// Extract depth array from AVDepthData
  static func extractDepthArray(from depthData: AVDepthData) -> (array: [Float], width: Int, height: Int, min: Float, max: Float, avg: Float)? {
    // Convert to Float32 if needed
    let float32DepthData: AVDepthData
    if depthData.depthDataType != kCVPixelFormatType_DepthFloat32 {
      float32DepthData = depthData.converting(toDepthDataType: kCVPixelFormatType_DepthFloat32)
    } else {
      float32DepthData = depthData
    }
    
    let depthMap = float32DepthData.depthDataMap
    
    CVPixelBufferLockBaseAddress(depthMap, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }
    
    let width = CVPixelBufferGetWidth(depthMap)
    let height = CVPixelBufferGetHeight(depthMap)
    let bytesPerRow = CVPixelBufferGetBytesPerRow(depthMap)
    
    guard let baseAddress = CVPixelBufferGetBaseAddress(depthMap) else {
      return nil
    }
    
    let floatBuffer = baseAddress.assumingMemoryBound(to: Float32.self)
    var depthArray: [Float] = []
    depthArray.reserveCapacity(width * height)
    
    for row in 0..<height {
      let rowStart = row * (bytesPerRow / MemoryLayout<Float32>.size)
      for col in 0..<width {
        let index = rowStart + col
        depthArray.append(floatBuffer[index])
      }
    }
    
    let minDepth = depthArray.min() ?? 0
    let maxDepth = depthArray.max() ?? 0
    let avgDepth = depthArray.reduce(0, +) / Float(depthArray.count)
    
    return (depthArray, width, height, minDepth, maxDepth, avgDepth)
  }
}

// MARK: - Photo Capture Delegate
private class DepthPhotoCaptureDelegate: NSObject, AVCapturePhotoCaptureDelegate {
  private let resolve: RCTPromiseResolveBlock
  private let reject: RCTPromiseRejectBlock
  
  init(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    self.resolve = resolve
    self.reject = reject
    super.init()
    print("📸 [Delegate] Initialized")
  }
  
  func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
    print("📸 [Delegate] didFinishProcessingPhoto called")
    
    if let error = error {
      print("❌ [Delegate] Capture error: \(error.localizedDescription)")
      reject("CAPTURE_ERROR", "Failed to capture photo: \(error.localizedDescription)", error)
      return
    }
    print("✅ [Delegate] Photo captured successfully")
    
    // Check if depth data is available
    print("📸 [Delegate] Checking for depth data...")
    guard let depthData = photo.depthData else {
      print("❌ [Delegate] No depth data in photo")
      reject("DEPTH_ERROR", "No depth data available in captured photo. Make sure TrueDepth camera is being used with depth enabled.", nil)
      return
    }
    print("✅ [Delegate] Depth data found in photo")
    
    // Get the photo data as HEIC with embedded depth
    print("📸 [Delegate] Getting file data representation...")
    guard let photoData = photo.fileDataRepresentation() else {
      print("❌ [Delegate] Failed to get photo data")
      reject("DATA_ERROR", "Failed to get photo data representation", nil)
      return
    }
    print("✅ [Delegate] Photo data size: \(photoData.count) bytes")
    
    // Save photo to temporary file
    print("📸 [Delegate] Saving photo to temporary file...")
    let tempDir = FileManager.default.temporaryDirectory
    let filename = "depth_photo_\(Date().timeIntervalSince1970).heic"
    let fileURL = tempDir.appendingPathComponent(filename)
    print("📸 [Delegate] File path: \(fileURL.path)")
    
    do {
      try photoData.write(to: fileURL)
      print("✅ [Delegate] Photo saved successfully")
      
      // Extract depth data information
      print("📸 [Delegate] Extracting depth data information...")
      let depthDataMap = depthData.depthDataMap
      let depthWidth = CVPixelBufferGetWidth(depthDataMap)
      let depthHeight = CVPixelBufferGetHeight(depthDataMap)
      print("📸 [Delegate] Depth resolution: \(depthWidth)x\(depthHeight)")
      
      // Get depth data accuracy
      let accuracy = depthData.depthDataAccuracy
      let accuracyString: String
      switch accuracy {
      case .absolute:
        accuracyString = "absolute"
        print("📸 [Delegate] Depth accuracy: absolute (TrueDepth)")
      case .relative:
        accuracyString = "relative"
        print("📸 [Delegate] Depth accuracy: relative")
      @unknown default:
        accuracyString = "unknown"
        print("⚠️ [Delegate] Depth accuracy: unknown")
      }
      
      // Get depth data type
      let depthDataType = depthData.depthDataType
      print("📸 [Delegate] Depth data type: \(depthDataType)")
      print("📸 [Delegate] Depth data filtered: \(depthData.isDepthDataFiltered)")
      
      // Extract raw depth array
      print("🔍 [Delegate] Extracting raw depth array...")
      if let depthExtraction = DepthPhotoCapture.extractDepthArray(from: depthData) {
        print("✅ [Delegate] Depth array extracted: \(depthExtraction.array.count) values")
        print("📊 [Delegate] Depth range: \(depthExtraction.min)m to \(depthExtraction.max)m (avg: \(depthExtraction.avg)m)")
        
        print("✅ [Delegate] Resolving with capture result (including raw depth array)")
        
        // Save depth array as binary file (too large for React Native bridge)
        let depthFileName = "depth_data_\(Date().timeIntervalSince1970).bin"
        let depthFileURL = tempDir.appendingPathComponent(depthFileName)
        
        do {
          let data = Data(bytes: depthExtraction.array, count: depthExtraction.array.count * MemoryLayout<Float>.size)
          try data.write(to: depthFileURL)
          print("💾 [Delegate] Depth array saved as binary file: \(depthFileURL.path)")
          
          resolve([
            "success": true,
            "filePath": fileURL.path,
            "depthWidth": depthWidth,
            "depthHeight": depthHeight,
            "depthAccuracy": accuracyString,
            "depthDataType": depthDataType,
            "isDepthDataFiltered": depthData.isDepthDataFiltered,
            "timestamp": Date().timeIntervalSince1970,
            // Binary file path instead of array
            "depthDataPath": depthFileURL.path,
            "minDepth": depthExtraction.min,
            "maxDepth": depthExtraction.max,
            "avgDepth": depthExtraction.avg
          ])
        } catch {
          print("⚠️ [Delegate] Could not save binary file: \(error.localizedDescription)")
          // Fall back to result without depth data
          resolve([
            "success": true,
            "filePath": fileURL.path,
            "depthWidth": depthWidth,
            "depthHeight": depthHeight,
            "depthAccuracy": accuracyString,
            "depthDataType": depthDataType,
            "isDepthDataFiltered": depthData.isDepthDataFiltered,
            "timestamp": Date().timeIntervalSince1970,
            "minDepth": depthExtraction.min,
            "maxDepth": depthExtraction.max,
            "avgDepth": depthExtraction.avg
          ])
        }
      } else {
        print("⚠️ [Delegate] Could not extract depth array, returning without it")
        resolve([
          "success": true,
          "filePath": fileURL.path,
          "depthWidth": depthWidth,
          "depthHeight": depthHeight,
          "depthAccuracy": accuracyString,
          "depthDataType": depthDataType,
          "isDepthDataFiltered": depthData.isDepthDataFiltered,
          "timestamp": Date().timeIntervalSince1970
        ])
      }
      
    } catch {
      print("❌ [Delegate] Save error: \(error.localizedDescription)")
      reject("SAVE_ERROR", "Failed to save photo: \(error.localizedDescription)", error)
    }
  }
  
  func photoOutput(_ output: AVCapturePhotoOutput, willCapturePhotoFor resolvedSettings: AVCaptureResolvedPhotoSettings) {
    // Optional: Play shutter sound or provide feedback
    print("📸 Capturing depth photo...")
  }
  
  func photoOutput(_ output: AVCapturePhotoOutput, didCapturePhotoFor resolvedSettings: AVCaptureResolvedPhotoSettings) {
    // Optional: Provide immediate feedback
    print("📸 Photo captured, processing depth data...")
  }
}
