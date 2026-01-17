// End-to-End Encryption utility using Web Crypto API (AES-GCM)

const ENCRYPTION_KEY_PREFIX = "sedvator_e2e_key_"
const SALT = "sedvator_secure_salt_2024"

// Derive an encryption key from user ID (used as unique identifier)
async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(userId + SALT), { name: "PBKDF2" }, false, [
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

// Get or create encryption key for user
async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  return deriveKey(userId)
}

// Encrypt a message
export async function encryptMessage(message: string, userId: string): Promise<string> {
  try {
    const key = await getEncryptionKey(userId)
    const encoder = new TextEncoder()
    const data = encoder.encode(message)

    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data)

    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedData), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error("Encryption error:", error)
    // Return original message if encryption fails (fallback)
    return message
  }
}

// Decrypt a message
export async function decryptMessage(encryptedMessage: string, userId: string): Promise<string> {
  try {
    // Check if message is encrypted (base64 encoded with proper length)
    if (!encryptedMessage || encryptedMessage.length < 20) {
      return encryptedMessage
    }

    // Try to decode as base64
    let combined: Uint8Array
    try {
      const binaryString = atob(encryptedMessage)
      combined = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i)
      }
    } catch {
      // Not base64, return as-is (unencrypted old message)
      return encryptedMessage
    }

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const encryptedData = combined.slice(12)

    if (encryptedData.length === 0) {
      return encryptedMessage
    }

    const key = await getEncryptionKey(userId)

    const decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData)

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    // If decryption fails, return original (might be unencrypted old message)
    console.error("Decryption error (might be old unencrypted message):", error)
    return encryptedMessage
  }
}

// Check if a message appears to be encrypted
export function isEncrypted(message: string): boolean {
  if (!message || message.length < 20) return false
  try {
    const decoded = atob(message)
    // Check if it looks like binary data (IV + ciphertext)
    return decoded.length >= 12 && !/^[\x20-\x7E\s]+$/.test(decoded)
  } catch {
    return false
  }
}
