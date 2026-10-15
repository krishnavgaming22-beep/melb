import Foundation
import AVFoundation
import AppKit
let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let output = CommandLine.arguments[2]
try FileManager.default.createDirectory(atPath: output, withIntermediateDirectories: true)
let duration = CMTimeGetSeconds(asset.duration)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 720, height: 720)
print("Duration: \(duration) seconds")
for i in 0..<12 {
 let seconds = duration * Double(i) / 12.0
 let image = try generator.copyCGImage(at: CMTime(seconds:seconds,preferredTimescale:600),actualTime:nil)
 let bitmap=NSBitmapImageRep(cgImage:image)
 try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:"\(output)/frame-\(i).png"))
 print("Frame \(i): \(seconds)")
}
