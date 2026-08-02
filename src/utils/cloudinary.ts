// Cloudinary utility for direct browser uploads using REST API
// Uses SHA-1 signing with user's Cloudinary API Key & Secret

const CLOUD_NAME = 'nonzehj3';
const API_KEY = '936497127116632';
const API_SECRET = 'snTkpkBkqCRWaqARdoKlYcbRZlQ';

/**
 * Computes SHA-1 hexadecimal hash using browser crypto.subtle API
 */
async function getSha1Hash(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback if crypto.subtle is not available in current environment
  return fallbackSha1(message);
}

/**
 * Pure JS fallback SHA-1 implementation for browser environments
 */
function fallbackSha1(msg: string): string {
  function rotl(n: number, s: number) {
    return (n << s) | (n >>> (32 - s));
  }
  function toHex(n: number) {
    let s = '';
    for (let i = 7; i >= 0; i--) {
      s += ((n >>> (i * 4)) & 0xf).toString(16);
    }
    return s;
  }
  let blockLen = 64;
  let blocks = [];
  let len = msg.length * 8;
  let index = 0;
  for (let i = 0; i < msg.length; i += 4) {
    blocks.push(
      (msg.charCodeAt(i) << 24) |
      ((msg.charCodeAt(i + 1) || 0) << 16) |
      ((msg.charCodeAt(i + 2) || 0) << 8) |
      (msg.charCodeAt(i + 3) || 0)
    );
  }
  let lastLen = msg.length % 4;
  let padIdx = blocks.length - 1;
  if (lastLen === 0) {
    blocks.push(0x80000000);
  } else if (lastLen === 1) {
    blocks[padIdx] = (blocks[padIdx] & 0xff000000) | 0x00800000;
  } else if (lastLen === 2) {
    blocks[padIdx] = (blocks[padIdx] & 0xffff0000) | 0x00008000;
  } else if (lastLen === 3) {
    blocks[padIdx] = (blocks[padIdx] & 0xffffff00) | 0x00000080;
  }
  while ((blocks.length * 32) % 512 !== 448) {
    blocks.push(0);
  }
  blocks.push(Math.floor(len / 4294967296));
  blocks.push(len & 0xffffffff);

  let w = new Array(80);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;
  let e = 0xc3d2e1f0;

  for (let i = 0; i < blocks.length; i += 16) {
    let oldA = a, oldB = b, oldC = c, oldD = d, oldE = e;
    for (let j = 0; j < 80; j++) {
      if (j < 16) {
        w[j] = blocks[i + j];
      } else {
        w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      }
      let f = 0, k = 0;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      let temp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30) >>> 0;
      b = a;
      a = temp;
    }
    a = (a + oldA) >>> 0;
    b = (b + oldB) >>> 0;
    c = (c + oldC) >>> 0;
    d = (d + oldD) >>> 0;
    e = (e + oldE) >>> 0;
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d) + toHex(e);
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Directly upload any file/image to Cloudinary REST API using SHA-1 signature
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Cloudinary signature calculation:
  // Sort parameters alphabetically: timestamp=123456789 + api_secret -> sha1
  const stringToSign = `timestamp=${timestamp}${API_SECRET}`;
  const signature = await getSha1Hash(stringToSign);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Cloudinary upload failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    url: data.url,
    secureUrl: data.secure_url || data.url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/**
 * Generate optimized Cloudinary delivery URL with auto-format and auto-quality
 */
export function getOptimizedImageUrl(publicIdOrUrl: string): string {
  if (!publicIdOrUrl) return '';
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    return publicIdOrUrl.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicIdOrUrl}`;
}

/**
 * Generate auto-crop square aspect ratio URL
 */
export function getAutoCropUrl(publicIdOrUrl: string, width = 500, height = 500): string {
  if (!publicIdOrUrl) return '';
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    return publicIdOrUrl.replace('/upload/', `/upload/c_auto,g_auto,w_${width},h_${height},f_auto,q_auto/`);
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_auto,g_auto,w_${width},h_${height},f_auto,q_auto/${publicIdOrUrl}`;
}
