# Depth Data Storage & Export Formats

## Current Storage

### HEIC File (iOS Native)
**Location:** `/private/var/mobile/.../tmp/depth_photo_XXXXX.heic`
- **RGB Photo:** 12MP (typical iPhone camera)
- **Depth Map:** 640×480 Float32 array embedded
- **Total Size:** 2-5 MB

---

## Export Format Options

### 1. **JSON (Easy to use, large file)**
```json
{
  "metadata": {
    "width": 640,
    "height": 480,
    "accuracy": "absolute",
    "units": "meters",
    "timestamp": 1768691466.168003
  },
  "depthMap": [
    [0.45, 0.46, 0.47, ...],  // Row 1
    [0.44, 0.45, 0.46, ...],  // Row 2
    ...
  ]
}
```
**Size:** ~10-15 MB
**Pros:** Easy to parse, human-readable
**Cons:** Very large file size

---

### 2. **Binary Float32 (Efficient, compact)**
```
Header (32 bytes):
  - Magic: "DPTH" (4 bytes)
  - Version: 1 (4 bytes)
  - Width: 640 (4 bytes)
  - Height: 480 (4 bytes)
  - Format: Float32 (4 bytes)
  - Accuracy: 1=absolute (4 bytes)
  - Reserved: (8 bytes)

Data (1,228,800 bytes):
  - 307,200 × 4-byte floats
  - Row-major order (left-to-right, top-to-bottom)
```
**Size:** ~1.2 MB
**Pros:** Very compact, fast to load
**Cons:** Needs custom parser

---

### 3. **PNG Depth Map (Visual + Data)**
```
Format: 16-bit grayscale PNG
Encoding: Depth values normalized to 0-65535
Formula: pixel_value = (depth_meters / max_depth) * 65535
```
**Size:** ~300-500 KB (compressed)
**Pros:** 
- Can visualize depth as grayscale image
- Widely supported
- Relatively compact
**Cons:** 
- Loses some precision (16-bit vs 32-bit)
- Need to normalize/denormalize

---

### 4. **CSV (Spreadsheet compatible)**
```csv
x,y,depth_meters
0,0,0.45
1,0,0.46
2,0,0.47
...
639,479,0.58
```
**Size:** ~15-20 MB
**Pros:** Can open in Excel/Google Sheets
**Cons:** Huge file size, slow to parse

---

### 5. **PLY (3D Point Cloud)**
```
ply
format binary_little_endian 1.0
element vertex 307200
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
[binary data: x,y,z,r,g,b for each point]
```
**Size:** ~7-8 MB
**Pros:** 
- 3D visualization in MeshLab/CloudCompare
- Includes RGB color per point
- Standard format
**Cons:** Need 3D viewer software

---

### 6. **OBJ (3D Mesh)**
```
v 0.0 0.0 0.45  # Vertex 1 (x, y, depth)
v 0.1 0.0 0.46  # Vertex 2
...
f 1 2 642       # Face triangle indices
```
**Size:** ~20-30 MB
**Pros:** 
- Can import into Blender/Unity
- Creates 3D face mesh
**Cons:** Very large, complex processing

---

## Recommended Format for CPAP Application

### For Backend Processing: **Binary Float32**
- Compact size
- Fast to load
- Preserves full precision
- Easy to process with NumPy/Python

### For Visualization: **PNG Depth Map**
- Can show depth as image
- Reasonable size
- Easy to inspect quality

### For 3D Analysis: **PLY Point Cloud**
- View 3D face scan
- Industry standard
- Color + depth

---

## Current Implementation Status

✅ **HEIC capture** - Working
⏳ **Export to other formats** - Not yet implemented
⏳ **Cloud upload** - Not yet implemented
⏳ **Backend processing** - Not yet implemented

---

## Data Flow

```
iPhone TrueDepth Camera
        ↓
  Capture (Swift)
        ↓
HEIC file in /tmp/ (iOS)
        ↓
  [Future: Export function]
        ↓
Binary/PNG/PLY export
        ↓
  Upload to backend
        ↓
Python processing (NumPy)
        ↓
Face measurements for CPAP
```
