import path from 'path';

export interface ValidatedFile {
  path: string;
  content: string;
}

export interface FileValidationResult {
  valid: boolean;
  files?: ValidatedFile[];
  error?: string;
}

// Limits
export const SECURITY_LIMITS = {
  MAX_FILES: 500,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024,      // 2MB per file
  MAX_TOTAL_SIZE_BYTES: 25 * 1024 * 1024,    // 25MB total
  MAX_PATH_LENGTH: 260
};

/**
 * Validates and sanitizes file paths to prevent Path Traversal / Zip Slip attacks.
 */
export function sanitizeFilePath(rawPath: string): string | null {
  if (!rawPath || typeof rawPath !== 'string') return null;

  // Reject null bytes or control characters
  if (/[\x00-\x1f\x7f]/.test(rawPath)) return null;

  // Normalize path separators to forward slash
  let normalized = rawPath.replace(/\\/g, '/');

  // Strip leading slashes and drive letters (e.g. C:)
  normalized = normalized.replace(/^[a-zA-Z]:/, '').replace(/^\/+/, '');

  // Detect and reject directory traversal attempts
  const segments = normalized.split('/');
  for (const seg of segments) {
    if (seg === '..' || seg === '.' || seg === '') {
      // Reject any segment attempting parent directory navigation
      if (seg === '..') return null;
    }
  }

  // Ensure path is not empty and within reasonable length
  const cleanPath = segments.filter(Boolean).join('/');
  if (!cleanPath || cleanPath.length > SECURITY_LIMITS.MAX_PATH_LENGTH) {
    return null;
  }

  return cleanPath;
}

/**
 * Validates an array of input files against security constraints.
 */
export function validateInputFiles(rawFiles: any[]): FileValidationResult {
  if (!Array.isArray(rawFiles) || rawFiles.length === 0) {
    return { valid: false, error: 'No files provided for assessment.' };
  }

  if (rawFiles.length > SECURITY_LIMITS.MAX_FILES) {
    return {
      valid: false,
      error: `File count (${rawFiles.length}) exceeds maximum allowable threshold (${SECURITY_LIMITS.MAX_FILES}).`
    };
  }

  let totalSize = 0;
  const validated: ValidatedFile[] = [];

  for (let i = 0; i < rawFiles.length; i++) {
    const item = rawFiles[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Invalid file entry at index ${i}.` };
    }

    const cleanPath = sanitizeFilePath(item.path);
    if (!cleanPath) {
      return {
        valid: false,
        error: `Insecure or invalid file path detected: "${String(item.path).slice(0, 60)}". Path traversal is prohibited.`
      };
    }

    const content = typeof item.content === 'string' ? item.content : '';
    const contentBytes = Buffer.byteLength(content, 'utf-8');

    if (contentBytes > SECURITY_LIMITS.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File "${cleanPath}" exceeds the maximum single-file size limit (2MB).`
      };
    }

    totalSize += contentBytes;
    if (totalSize > SECURITY_LIMITS.MAX_TOTAL_SIZE_BYTES) {
      return {
        valid: false,
        error: `Total assessment payload exceeds the maximum batch limit (25MB).`
      };
    }

    validated.push({
      path: cleanPath,
      content
    });
  }

  return { valid: true, files: validated };
}

/**
 * Centralized Safe Error Formatter for API responses.
 * Ensures internal paths, stack traces, and API keys are never exposed.
 */
export function formatSafeError(err: any, fallbackMessage = 'An internal processing error occurred'): { error: string; code: string } {
  const message = err?.message || '';

  // Log raw error securely on the server console
  console.error('[Internal Error]:', err);

  // Check for common safe error types
  if (message.includes('GEMINI_API_KEY') || message.includes('API key not valid')) {
    return { error: 'AI Copilot authentication failed. Verify server API configuration.', code: 'ERR_AUTH' };
  }
  if (message.includes('rate limit') || message.includes('quota')) {
    return { error: 'AI Copilot rate limit reached. Please retry in a few moments.', code: 'ERR_RATE_LIMIT' };
  }
  if (message.includes('traversal') || message.includes('Prohibited')) {
    return { error: message, code: 'ERR_SECURITY_VIOLATION' };
  }

  // Never return raw stack traces or internal filesystem references
  return {
    error: fallbackMessage,
    code: 'ERR_INTERNAL'
  };
}
