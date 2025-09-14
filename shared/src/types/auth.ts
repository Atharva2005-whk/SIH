import { z } from 'zod';

// Authentication related types
export const UserRoleSchema = z.enum(['tourist', 'authority', 'responder', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AuthorityDepartmentSchema = z.enum([
  'police',
  'fire',
  'medical',
  'tourism',
  'security',
  'customs',
  'immigration'
]);
export type AuthorityDepartment = z.infer<typeof AuthorityDepartmentSchema>;

export const TouristLoginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'), // passport or email
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nationality: z.string().optional(),
});

export type TouristLogin = z.infer<typeof TouristLoginSchema>;

export const AuthorityLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: AuthorityDepartmentSchema,
  badge: z.string().optional(),
});

export type AuthorityLogin = z.infer<typeof AuthorityLoginSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.number(),
  userRole: UserRoleSchema,
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
  lastActivityAt: z.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

export const AuthUserSchema = z.object({
  id: z.number(),
  role: UserRoleSchema,
  name: z.string(),
  email: z.string().email().optional(),
  isVerified: z.boolean().default(false),
  department: AuthorityDepartmentSchema.optional(),
  badge: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(), // for validation errors
  timestamp: z.date().default(() => new Date()),
});

export type ApiResponse<T = unknown> = Omit<z.infer<typeof ApiResponseSchema>, 'data'> & {
  data?: T;
};

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  total: z.number().min(0),
  totalPages: z.number().min(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(itemSchema),
    pagination: PaginationSchema,
    message: z.string().optional(),
    timestamp: z.date().default(() => new Date()),
  });

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
  timestamp: Date;
};
