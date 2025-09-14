import { z } from 'zod';
import { LocationSchema } from './tourist.js';

// Incident related types
export const IncidentTypeSchema = z.enum([
  'theft',
  'medical',
  'emergency',
  'accident',
  'harassment',
  'lost',
  'natural_disaster',
  'other'
]);

export type IncidentType = z.infer<typeof IncidentTypeSchema>;

export const SeverityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;

export const IncidentStatusSchema = z.enum([
  'reported',
  'acknowledged',
  'investigating',
  'responding',
  'resolved',
  'closed'
]);

export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentSchema = z.object({
  id: z.number().optional(),
  touristId: z.number(),
  incidentType: IncidentTypeSchema,
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: LocationSchema,
  locationDescription: z.string().optional(),
  severity: SeverityLevelSchema,
  status: IncidentStatusSchema.default('reported'),
  evidenceHashes: z.array(z.string()).default([]),
  reportedAt: z.date().default(() => new Date()),
  resolvedAt: z.date().optional(),
  responderIds: z.array(z.number()).default([]),
  notes: z.string().optional(),
});

export type Incident = z.infer<typeof IncidentSchema>;

// Safety Alert types
export const AlertTypeSchema = z.enum([
  'emergency',
  'safety_warning',
  'zone_violation',
  'medical',
  'security',
  'weather',
  'system'
]);

export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'dispatched',
  'resolved',
  'cancelled'
]);

export type AlertStatus = z.infer<typeof AlertStatusSchema>;

export const SafetyAlertSchema = z.object({
  id: z.number().optional(),
  touristId: z.number().optional(),
  alertType: AlertTypeSchema,
  message: z.string().min(1, 'Alert message is required'),
  location: LocationSchema.optional(),
  severity: SeverityLevelSchema,
  status: AlertStatusSchema.default('active'),
  triggeredAt: z.date().default(() => new Date()),
  acknowledgedAt: z.date().optional(),
  resolvedAt: z.date().optional(),
  responderIds: z.array(z.number()).default([]),
  affectedZones: z.array(z.number()).default([]),
});

export type SafetyAlert = z.infer<typeof SafetyAlertSchema>;
