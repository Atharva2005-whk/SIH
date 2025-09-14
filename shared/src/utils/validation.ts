import { z } from 'zod';
import type { ApiResponse } from '../types/auth.js';

/**
 * Validates data against a Zod schema and returns a formatted API response
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    throw error;
  }
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message !== undefined && { message }),
    timestamp: new Date(),
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  errors?: Record<string, string[]>
): ApiResponse {
  return {
    success: false,
    error,
    errors,
    timestamp: new Date(),
  };
}

/**
 * Validates passport number format
 */
export function isValidPassportNumber(passportNumber: string): boolean {
  // Basic passport validation - at least 5 characters, alphanumeric
  const passportRegex = /^[A-Z0-9]{5,15}$/i;
  return passportRegex.test(passportNumber);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculates distance between two geographic points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Checks if a point is within a circular geofence
 */
export function isPointInCircle(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
}

/**
 * Generates a random session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>\"'&]/g, '');
}

/**
 * Formats a date for API responses
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}
