import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'DepthPhotoCapture' doesn't seem to be linked. Make sure: ` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DepthPhotoCapture = NativeModules.DepthPhotoCapture
  ? NativeModules.DepthPhotoCapture
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface DepthPhotoCaptureResult {
  success: boolean;
  filePath: string;
  depthWidth: number;
  depthHeight: number;
  depthAccuracy: 'absolute' | 'relative' | 'unknown';
  depthDataType: number;
  isDepthDataFiltered: boolean;
  timestamp: number;
  // Binary file path (too large to pass as array)
  depthDataPath?: string;
  minDepth?: number;
  maxDepth?: number;
  avgDepth?: number;
}

export interface CameraSetupResult {
  success: boolean;
  depthAvailable: boolean;
}

export interface DepthDataExtraction {
  success: boolean;
  width: number;
  height: number;
  depthArray: number[]; // Array of depth values in meters
  minDepth: number;
  maxDepth: number;
  avgDepth: number;
  totalPoints: number;
}

export default {
  /**
   * Set up the TrueDepth camera session for depth photo capture
   * @returns Promise with setup result including depth availability
   */
  setupCamera(): Promise<CameraSetupResult> {
    return DepthPhotoCapture.setupCamera();
  },

  /**
   * Capture a single photo with embedded depth data from TrueDepth camera
   * @returns Promise with photo capture result including file path and depth info
   */
  captureDepthPhoto(): Promise<DepthPhotoCaptureResult> {
    return DepthPhotoCapture.captureDepthPhoto();
  },

  /**
   * Stop the camera session and release resources
   * @returns Promise with stop result
   */
  stopCamera(): Promise<{ success: boolean; message?: string }> {
    return DepthPhotoCapture.stopCamera();
  },

  /**
   * Save the captured depth photo to Photos app (preserves depth data in HEIC)
   * @param filePath Path to the HEIC file to save
   * @returns Promise with save result
   */
  saveToPhotos(filePath: string): Promise<{ success: boolean; message?: string }> {
    return DepthPhotoCapture.saveToPhotos(filePath);
  },

  /**
   * Extract raw depth data array from HEIC file
   * @param filePath Path to the HEIC file
   * @returns Promise with depth array and statistics
   */
  extractDepthData(filePath: string): Promise<DepthDataExtraction> {
    return DepthPhotoCapture.extractDepthData(filePath);
  },

  /**
   * Read a chunk of depth data from binary file
   * @param filePath Path to the binary depth file
   * @param offset Starting index
   * @param length Number of values to read
   * @returns Promise with chunk of depth values
   */
  readDepthBinaryChunk(filePath: string, offset: number, length: number): Promise<{
    success: boolean;
    data: number[];
    offset: number;
    length: number;
    totalPoints: number;
  }> {
    return DepthPhotoCapture.readDepthBinaryChunk(filePath, offset, length);
  },
};
