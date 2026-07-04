/**
 * Video URL Utility
 * Centralized video URL construction to ensure consistency across the application
 */

// Base URL for video files - DO NOT MODIFY without updating this constant
export const VIDEO_BASE_URL = 'https://najot-edu.softwareengineer.uz/files/files';

/**
 * Constructs a complete video URL from a filename
 * @param {string} fileName - The video file name (e.g., "1780340713500.mp4")
 * @returns {string} - Complete video URL or empty string if fileName is invalid
 * 
 * @example
 * getVideoUrl("1780340713500.mp4") 
 * // Returns: "https://najot-edu.softwareengineer.uz/files/files/1780340713500.mp4"
 */
export function getVideoUrl(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  const trimmed = fileName.trim();
  
  // If already a complete URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Remove leading slashes if present
  const cleanFileName = trimmed.replace(/^\/+/, '');
  
  if (!cleanFileName) {
    return '';
  }

  // Construct and return the complete URL
  return `${VIDEO_BASE_URL}/${cleanFileName}`;
}

/**
 * Extracts video filename from various response formats
 * @param {Object|string|Array} videoData - Video data from API response
 * @returns {string} - Extracted filename or empty string
 */
export function extractVideoFileName(videoData) {
  if (!videoData) return '';

  // If it's already a string (filename), return it
  if (typeof videoData === 'string') {
    return videoData;
  }

  // If it's an array, get the first item
  if (Array.isArray(videoData)) {
    if (videoData.length === 0) return '';
    return extractVideoFileName(videoData[0]);
  }

  // If it's an object, try common field names
  if (typeof videoData === 'object') {
    const possibleFields = [
      'video_url',
      'videoUrl',
      'url',
      'file_url',
      'fileUrl',
      'filename',
      'fileName',
      'name',
      'storedName',
      'originalname',
      'path',
      'file_path',
      'filepath',
    ];

    for (const field of possibleFields) {
      if (videoData[field]) {
        return extractVideoFileName(videoData[field]);
      }
    }
  }

  return '';
}

/**
 * Gets complete video URL from API response data
 * @param {Object|string|Array} videoData - Video data from API response
 * @returns {string} - Complete video URL or empty string
 */
export function getVideoUrlFromResponse(videoData) {
  const fileName = extractVideoFileName(videoData);
  return getVideoUrl(fileName);
}
