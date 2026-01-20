/**
 * API Service Layer for Audio to ISL Frontend
 * Handles all communication with the backend API
 */

// API Base URL - Azure backend deployment
const API_BASE_URL = 'https://newbackend123-dqdsavatekb9hvek.eastasia-01.azurewebsites.net';

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make a request to the API
 * @param {string} endpoint - API endpoint (e.g., '/process')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // Response is not JSON
      }
      throw new APIError(
        errorData?.detail || `HTTP error ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Network error or other issue
    throw new APIError(
      'Failed to connect to the server. Please check if the backend is running.',
      0,
      null
    );
  }
}

/**
 * Check if the API is healthy and running
 * @returns {Promise<{status: string, version: string, phrases_count: number, letters_count: number}>}
 */
export async function checkHealth() {
  return apiRequest('/health');
}

/**
 * Get the API base URL (useful for constructing static file URLs)
 * @returns {string}
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Convert text to ISL visual representation
 * @param {string} text - Text to convert
 * @returns {Promise<{type: 'gif' | 'sequence', src?: string, alt?: string, data?: string[], original_text?: string}>}
 */
export async function convertTextToISL(text) {
  if (!text || !text.trim()) {
    throw new APIError('Text cannot be empty', 400);
  }

  return apiRequest('/process', {
    method: 'POST',
    body: JSON.stringify({ text: text.trim() }),
  });
}

/**
 * Get list of available ISL phrases
 * @returns {Promise<{phrases: string[], count: number}>}
 */
export async function getAvailablePhrases() {
  return apiRequest('/api/phrases');
}

/**
 * Build full URL for a static resource (GIF or letter image)
 * @param {string} path - Relative path from API response (e.g., '/static/gifs/hello.gif')
 * @returns {string} - Full URL
 */
export function buildStaticUrl(path) {
  if (!path) return '';
  // If path already includes the base URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

// Export error class for type checking
export { APIError };

// Default export with all methods
export default {
  checkHealth,
  getApiBaseUrl,
  convertTextToISL,
  getAvailablePhrases,
  buildStaticUrl,
  APIError,
};





