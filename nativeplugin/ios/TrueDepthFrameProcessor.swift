import  VisionCamera
import Foundation

@objc(TrueDepthFrameProcessor)
public class TrueDepthFrameProcessor: FrameProcessorPlugin {
  @objc
  public static func callback(_ frame: Frame!, withArguments arguments: [Any]!) -> Any? {
    // Your native Swift logic goes here
    print("Received frame: \(frame.width) x \(frame.height)")
    
    // Return data back to JS if needed
    return ["width": frame.width, "height": frame.height]
  }
}