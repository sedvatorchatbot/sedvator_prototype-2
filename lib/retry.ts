/**
 * Retry an async operation with exponential backoff
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if this is a retryable error (DNS, network timeouts)
      const isRetryable =
        lastError.message.includes("ENOTFOUND") ||
        lastError.message.includes("ECONNREFUSED") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("fetch failed")

      if (!isRetryable || attempt === maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(
        `[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms. Error: ${lastError.message}`
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
