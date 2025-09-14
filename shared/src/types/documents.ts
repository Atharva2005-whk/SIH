import { z } from 'zod';

// Document types for verification
export const DocumentTypeSchema = z.enum([
  'visa',
  'passport',
  'aadhar',
  'pan_card',
  'voter_id',
  'driving_license',
]);

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

// Document verification status
export const DocumentVerificationStatusSchema = z.enum([
  'pending',
  'under_review',
  'verified',
  'rejected',
  'expired'
]);

export type DocumentVerificationStatus = z.infer<typeof DocumentVerificationStatusSchema>;

// File upload constraints
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

// Document schema
export const DocumentSchema = z.object({
  id: z.string().optional(),
  touristId: z.number().optional(),
  type: DocumentTypeSchema,
  fileName: z.string().min(1, 'File name is required'),
  originalName: z.string().min(1, 'Original file name is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0').max(MAX_FILE_SIZE, 'File too large (max 5MB)'),
  mimeType: z.string().refine(
    (type) => ALLOWED_FILE_TYPES.includes(type),
    'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed'
  ),
  ipfsHash: z.string().optional(),
  uploadedAt: z.date().default(() => new Date()),
  verificationStatus: DocumentVerificationStatusSchema.default('pending'),
  verifiedAt: z.date().optional(),
  verifiedBy: z.number().optional(), // Authority ID
  rejectionReason: z.string().optional(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

export type Document = z.infer<typeof DocumentSchema>;

// Upload request schema
export const DocumentUploadRequestSchema = z.object({
  type: DocumentTypeSchema,
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'File too large (max 5MB)'
  ).refine(
    (file) => ALLOWED_FILE_TYPES.includes(file.type),
    'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed'
  ),
  expiryDate: z.date().optional(),
});

export type DocumentUploadRequest = z.infer<typeof DocumentUploadRequestSchema>;

// Upload response
export const DocumentUploadResponseSchema = z.object({
  success: z.boolean(),
  document: DocumentSchema.optional(),
  error: z.string().optional(),
});

export type DocumentUploadResponse = z.infer<typeof DocumentUploadResponseSchema>;

// Tourist document requirements
export const TouristDocumentRequirementsSchema = z.object({
  nationality: z.string(),
  requiredDocuments: z.array(DocumentTypeSchema),
  optionalDocuments: z.array(DocumentTypeSchema),
  description: z.string().optional(),
});

export type TouristDocumentRequirements = z.infer<typeof TouristDocumentRequirementsSchema>;

// Common document requirements by nationality
export const DOCUMENT_REQUIREMENTS: Record<string, TouristDocumentRequirements> = {
  'IN': {
    nationality: 'Indian',
    requiredDocuments: ['aadhar'],
    optionalDocuments: ['pan_card', 'voter_id', 'driving_license'],
    description: 'Indian citizens must provide Aadhaar card for verification'
  },
  'US': {
    nationality: 'American',
    requiredDocuments: ['passport', 'visa'],
    optionalDocuments: ['driving_license'],
    description: 'US citizens must provide passport and valid visa'
  },
  'UK': {
    nationality: 'British',
    requiredDocuments: ['passport', 'visa'],
    optionalDocuments: [],
    description: 'UK citizens must provide passport and valid visa'
  },
  'DEFAULT': {
    nationality: 'International',
    requiredDocuments: ['passport', 'visa'],
    optionalDocuments: [],
    description: 'International visitors must provide passport and valid visa'
  }
};

// Document validation utility type
export interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
