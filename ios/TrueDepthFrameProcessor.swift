import VisionCamera
import Foundation

@objc(TrueDepthFrameProcessor)
public class TrueDepthFrameProcessor: FrameProcessorPlugin {
    
    public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
        print("🔥 TrueDepthFrameProcessor: callback() called! (humaid)")
        print("🔥 Frame details: \(frame.width) x \(frame.height) (humaid)" )
        
        // Your frame processing logic here
        let result = [
            "width": frame.width,
            "height": frame.height,
            "timestamp": frame.timestamp
        ]
        
        print("🔥 Returning result: \(result) (humaid)")
        return result
    }
    
    // Optional: Override initializer if you need custom setup
    public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]? = nil) {
        super.init(proxy: proxy, options: options)
        print("🟢 TrueDepthFrameProcessor: Initialized! (humaid)")
    }
}