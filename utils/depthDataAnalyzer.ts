/**
 * Depth Data Quality Analyzer
 * Validates and analyzes depth capture results
 */

export interface DepthQualityReport {
  isValid: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  recommendations: string[];
  stats: {
    resolution: string;
    totalPoints: number;
    accuracy: string;
    filtered: boolean;
    format: string;
  };
}

export function analyzeDepthQuality(result: any): DepthQualityReport {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  // Check if capture succeeded
  if (!result || !result.success) {
    return {
      isValid: false,
      quality: 'poor',
      issues: ['Capture failed'],
      recommendations: ['Try capturing again', 'Check camera permissions'],
      stats: {
        resolution: 'N/A',
        totalPoints: 0,
        accuracy: 'N/A',
        filtered: false,
        format: 'N/A',
      },
    };
  }

  // Analyze accuracy
  if (result.depthAccuracy !== 'absolute') {
    issues.push('Depth accuracy is not absolute - measurements may be relative only');
    recommendations.push('Use a device with TrueDepth camera (iPhone X or newer with Face ID)');
    quality = 'poor';
  }

  // Analyze resolution
  const totalPoints = result.depthWidth * result.depthHeight;
  const resolution = `${result.depthWidth}×${result.depthHeight}`;
  
  if (totalPoints < 100000) {
    issues.push('Low depth resolution');
    recommendations.push('Resolution below 320×320, may lack detail');
    quality = quality === 'excellent' ? 'fair' : quality;
  } else if (totalPoints < 300000) {
    // 640×480 = 307,200 - this is your case
    if (quality === 'excellent') quality = 'good';
  }

  // Check filtering
  if (!result.isDepthDataFiltered) {
    issues.push('Depth data not filtered - may contain noise');
    recommendations.push('Noise filtering disabled, depth map may have artifacts');
  }

  // Analyze depth data type
  const depthType = getDepthDataTypeString(result.depthDataType);
  if (!depthType.includes('Float')) {
    issues.push('Depth data is not in floating point format');
    quality = quality === 'excellent' ? 'good' : quality;
  }

  // Final quality assessment
  if (issues.length === 0 && result.depthAccuracy === 'absolute' && totalPoints >= 300000) {
    quality = 'excellent';
    recommendations.push('Depth data quality is excellent for face measurements!');
  } else if (issues.length <= 1) {
    quality = 'good';
  }

  return {
    isValid: true,
    quality,
    issues,
    recommendations,
    stats: {
      resolution,
      totalPoints,
      accuracy: result.depthAccuracy,
      filtered: result.isDepthDataFiltered,
      format: depthType,
    },
  };
}

function getDepthDataTypeString(fourcc: number): string {
  // Decode FourCC to string
  const chars = [
    String.fromCharCode((fourcc >> 24) & 0xFF),
    String.fromCharCode((fourcc >> 16) & 0xFF),
    String.fromCharCode((fourcc >> 8) & 0xFF),
    String.fromCharCode(fourcc & 0xFF),
  ];
  const code = chars.join('');

  // Common depth formats
  const formats: { [key: string]: string } = {
    'hdis': 'DepthFloat32 (32-bit float, meters)',
    'hdep': 'DepthFloat16 (16-bit float, meters)',
    'dis ': 'DisparityFloat32 (32-bit float, inverse depth)',
    'dep ': 'DisparityFloat16 (16-bit float, inverse depth)',
  };

  return formats[code] || `Unknown (${code} / ${fourcc})`;
}

export function formatDepthReport(report: DepthQualityReport): string {
  let output = '';
  
  output += `🎯 Depth Quality: ${report.quality.toUpperCase()}\n`;
  output += `✓ Valid: ${report.isValid ? 'Yes' : 'No'}\n\n`;
  
  output += `📊 Statistics:\n`;
  output += `  • Resolution: ${report.stats.resolution}\n`;
  output += `  • Total Points: ${report.stats.totalPoints.toLocaleString()}\n`;
  output += `  • Accuracy: ${report.stats.accuracy}\n`;
  output += `  • Filtered: ${report.stats.filtered ? 'Yes' : 'No'}\n`;
  output += `  • Format: ${report.stats.format}\n\n`;
  
  if (report.issues.length > 0) {
    output += `⚠️ Issues:\n`;
    report.issues.forEach(issue => output += `  • ${issue}\n`);
    output += '\n';
  }
  
  if (report.recommendations.length > 0) {
    output += `💡 Recommendations:\n`;
    report.recommendations.forEach(rec => output += `  • ${rec}\n`);
  }
  
  return output;
}

// Real-world depth validation
export function validateDepthForFaceMeasurement(result: any): {
  suitable: boolean;
  reason: string;
} {
  if (!result || !result.success) {
    return { suitable: false, reason: 'Capture failed' };
  }

  if (result.depthAccuracy !== 'absolute') {
    return { 
      suitable: false, 
      reason: 'Requires absolute depth measurements (TrueDepth camera)' 
    };
  }

  const totalPoints = result.depthWidth * result.depthHeight;
  if (totalPoints < 200000) {
    return { 
      suitable: false, 
      reason: 'Insufficient resolution for accurate face measurements' 
    };
  }

  return { 
    suitable: true, 
    reason: 'Perfect for CPAP mask fitting measurements!' 
  };
}
