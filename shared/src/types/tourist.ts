import { z } from 'zod';

// Tourist related types
export const TouristSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  passportNumber: z.string().min(5, 'Valid passport number required'),
  nationality: z.string().min(2, 'Nationality is required'),
  emergencyContact: z.string().optional(),
  medicalInfo: z.string().optional(),
  isVerified: z.boolean().default(false),
  verificationLevel: z.enum(['none', 'basic', 'enhanced']).default('none'),
  registrationDate: z.date().optional(),
  lastLocationUpdate: z.date().optional(),
});

export type Tourist = z.infer<typeof TouristSchema>;

export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type Location = z.infer<typeof LocationSchema>;

export const TouristLocationSchema = z.object({
  touristId: z.number(),
  location: LocationSchema,
  zoneId: z.number().optional(),
  status: z.enum(['safe', 'warning', 'danger', 'emergency']).default('safe'),
});

export type TouristLocation = z.infer<typeof TouristLocationSchema>;
