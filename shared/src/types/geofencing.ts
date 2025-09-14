import { z } from 'zod';
import { LocationSchema } from './tourist.js';

// Geofencing related types
export const ZoneTypeSchema = z.enum([
  'safe',
  'restricted',
  'danger',
  'emergency_only',
  'tourist_friendly',
  'checkpoint'
]);

export type ZoneType = z.infer<typeof ZoneTypeSchema>;

export const GeoFenceZoneSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Zone name is required'),
  description: z.string().optional(),
  centerLocation: LocationSchema,
  radius: z.number().min(1, 'Radius must be positive'),
  zoneType: ZoneTypeSchema,
  isActive: z.boolean().default(true),
  maxOccupancy: z.number().optional(),
  currentOccupancy: z.number().default(0),
  alertThreshold: z.number().default(0.8), // percentage
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  createdBy: z.number().optional(), // authority ID
});

export type GeoFenceZone = z.infer<typeof GeoFenceZoneSchema>;

export const SafetyCheckpointSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Checkpoint name is required'),
  description: z.string().optional(),
  location: LocationSchema,
  zoneId: z.number().optional(),
  checkpointType: z.enum(['entry', 'exit', 'verification', 'emergency']),
  isActive: z.boolean().default(true),
  requiresVerification: z.boolean().default(false),
  staffIds: z.array(z.number()).default([]),
  operatingHours: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  }).optional(),
  createdAt: z.date().default(() => new Date()),
});

export type SafetyCheckpoint = z.infer<typeof SafetyCheckpointSchema>;

// Zone violation tracking
export const ZoneViolationSchema = z.object({
  id: z.number().optional(),
  touristId: z.number(),
  zoneId: z.number(),
  violationType: z.enum(['unauthorized_entry', 'overstay', 'overcapacity', 'restricted_access']),
  detectedAt: z.date().default(() => new Date()),
  location: LocationSchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  autoResolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  notes: z.string().optional(),
});

export type ZoneViolation = z.infer<typeof ZoneViolationSchema>;
