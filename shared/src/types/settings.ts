import { z } from 'zod';

// Theme types
export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof ThemeSchema>;

// Language types
export const LanguageSchema = z.enum(['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh']);
export type Language = z.infer<typeof LanguageSchema>;

// Notification preferences
export const NotificationTypeSchema = z.enum([
  'emergency_alerts',
  'safety_updates',
  'incident_reports',
  'zone_violations',
  'system_notifications',
  'marketing_updates'
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationMethodSchema = z.enum([
  'push',
  'email',
  'sms',
  'in_app'
]);

export type NotificationMethod = z.infer<typeof NotificationMethodSchema>;

export const NotificationPreferenceSchema = z.object({
  type: NotificationTypeSchema,
  methods: z.array(NotificationMethodSchema),
  enabled: z.boolean().default(true),
});

export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;

// Privacy settings
export const PrivacySettingsSchema = z.object({
  shareLocationWithAuthorities: z.boolean().default(true),
  shareLocationWithEmergencyServices: z.boolean().default(true),
  allowLocationTracking: z.boolean().default(true),
  shareProfileWithOtherTourists: z.boolean().default(false),
  allowDataAnalytics: z.boolean().default(true),
  allowMarketingCommunications: z.boolean().default(false),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

// Accessibility settings
export const AccessibilitySettingsSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large', 'extra_large']).default('medium'),
  highContrast: z.boolean().default(false),
  reduceMotion: z.boolean().default(false),
  screenReader: z.boolean().default(false),
  keyboardNavigation: z.boolean().default(false),
});

export type AccessibilitySettings = z.infer<typeof AccessibilitySettingsSchema>;

// Emergency contacts
export const EmergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional(),
  isPrimary: z.boolean().default(false),
  countryCode: z.string().default('+1'),
});

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

// Location preferences
export const LocationPreferencesSchema = z.object({
  autoShareLocation: z.boolean().default(true),
  locationAccuracy: z.enum(['high', 'medium', 'low']).default('high'),
  backgroundLocationTracking: z.boolean().default(true),
  geoFenceAlerts: z.boolean().default(true),
  locationHistoryRetention: z.number().min(1).max(365).default(30), // days
});

export type LocationPreferences = z.infer<typeof LocationPreferencesSchema>;

// User settings schema
export const UserSettingsSchema = z.object({
  id: z.string().optional(),
  userId: z.number(),
  
  // Appearance
  theme: ThemeSchema.default('system'),
  language: LanguageSchema.default('en'),
  
  // Notifications
  notificationPreferences: z.array(NotificationPreferenceSchema).default([
    { type: 'emergency_alerts', methods: ['push', 'sms'], enabled: true },
    { type: 'safety_updates', methods: ['push'], enabled: true },
    { type: 'incident_reports', methods: ['push'], enabled: true },
    { type: 'zone_violations', methods: ['push', 'sms'], enabled: true },
    { type: 'system_notifications', methods: ['push'], enabled: true },
    { type: 'marketing_updates', methods: ['email'], enabled: false },
  ]),
  
  // Privacy
  privacySettings: PrivacySettingsSchema.default({}),
  
  // Accessibility
  accessibilitySettings: AccessibilitySettingsSchema.default({}),
  
  // Emergency contacts
  emergencyContacts: z.array(EmergencyContactSchema).default([]),
  
  // Location
  locationPreferences: LocationPreferencesSchema.default({}),
  
  // Metadata
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Settings update request
export const SettingsUpdateRequestSchema = UserSettingsSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type SettingsUpdateRequest = z.infer<typeof SettingsUpdateRequestSchema>;

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  { type: 'emergency_alerts', methods: ['push', 'sms'], enabled: true },
  { type: 'safety_updates', methods: ['push'], enabled: true },
  { type: 'incident_reports', methods: ['push'], enabled: true },
  { type: 'zone_violations', methods: ['push', 'sms'], enabled: true },
  { type: 'system_notifications', methods: ['push'], enabled: true },
  { type: 'marketing_updates', methods: ['email'], enabled: false },
];

// Language labels
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  de: 'Deutsch (German)',
  ja: '日本語 (Japanese)',
  zh: '中文 (Chinese)',
};

// Notification type labels
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  emergency_alerts: 'Emergency Alerts',
  safety_updates: 'Safety Updates',
  incident_reports: 'Incident Reports',
  zone_violations: 'Zone Violations',
  system_notifications: 'System Notifications',
  marketing_updates: 'Marketing Updates',
};
