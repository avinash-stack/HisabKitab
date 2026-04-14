/**
 * Utility functions for End-to-End Encryption (E2EE) using Web Crypto API.
 * Uses AES-GCM (256-bit) to encrypt sensitive data before sending to the backend.
 */

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a completely new AES-GCM 256 Master Key.
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // Key is extractable (so we can save it)
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to a Base64 string representation for storage.
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Imports a CryptoKey from a Base64 string representation.
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    buffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts any JSON-serializable object into a single Base64 string containing both the IV and Ciphertext.
 * Format: "ivBase64:ciphertextBase64"
 */
export async function encryptData(data: any, key: CryptoKey): Promise<string> {
  const jsonStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(jsonStr);

  // GCM requires a 12-byte initialization vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const ivBase64 = arrayBufferToBase64(iv);
  const cipherBase64 = arrayBufferToBase64(ciphertext);

  return `${ivBase64}:${cipherBase64}`;
}

/**
 * Decrypts an encrypted string (Format: "ivBase64:ciphertextBase64") back into the JSON object.
 */
export async function decryptData(encryptedString: string, key: CryptoKey): Promise<any> {
  const parts = encryptedString.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted format. Expected iv:ciphertext');
  }

  const ivBuffer = base64ToArrayBuffer(parts[0]);
  const cipherBuffer = base64ToArrayBuffer(parts[1]);

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
    key,
    cipherBuffer
  );

  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(decryptedData);
  return JSON.parse(jsonStr);
}
