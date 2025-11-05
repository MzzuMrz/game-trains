/**
 * Utility functions for the train simulator
 */

/**
 * Converts km/h to m/s
 */
export function kmhToMs(kmh) {
  return kmh / 3.6;
}

/**
 * Converts m/s to km/h
 */
export function msToKmh(ms) {
  return ms * 3.6;
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 */
export function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Generate random value between min and max
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get color for environmental zone
 */
export function getZoneColor(zone) {
  const colors = {
    subtropical: 0x6B8E23,  // Olive green
    'semi-arid': 0xD2B48C,  // Tan
    pampas: 0x90EE90,       // Light green
    urban: 0x808080         // Gray
  };
  return colors[zone] || 0x90EE90;
}

/**
 * Format time in HH:MM format
 */
export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format distance
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Simple easing function
 */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
