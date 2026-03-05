import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const RegisterSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    role: z.enum(['ARTIST', 'INDUSTRY']),
    stageName: z.string().min(2).max(60).optional(),   // required if ARTIST
    companyName: z.string().min(2).max(120).optional(), // required if INDUSTRY
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
    email: z.string().email(),
});

export const ChangePasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8),
});

// ============================================================
// Artist Profile Schemas
// ============================================================

export const ArtistProfileUpdateSchema = z.object({
    stageName: z.string().min(2).max(60).optional(),
    genres: z.array(z.string()).max(5).optional(),
    city: z.string().max(80).optional(),
    state: z.string().length(2).optional(),
    bio: z.string().max(300).optional(),
    availableForBooking: z.boolean().optional(),
    contactVisibility: z
        .enum(['PUBLIC', 'VERIFIED_ONLY', 'PROPOSAL_ONLY', 'PRIVATE'])
        .optional(),
    instagram: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
});
export type ArtistProfileUpdateInput = z.infer<typeof ArtistProfileUpdateSchema>;

// ============================================================
// Industry Profile Schemas
// ============================================================

export const IndustryProfileUpdateSchema = z.object({
    companyName: z.string().min(2).max(120).optional(),
    type: z
        .enum(['LABEL', 'AGENCY', 'BRAND', 'PRODUCER', 'EVENT', 'OTHER'])
        .optional(),
    niches: z.array(z.string()).max(8).optional(),
    city: z.string().max(80).optional(),
    state: z.string().length(2).optional(),
    website: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    cnpj: z
        .string()
        .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos')
        .optional(),
});
export type IndustryProfileUpdateInput = z.infer<typeof IndustryProfileUpdateSchema>;

// ============================================================
// Post / Story Schemas
// ============================================================

export const CreatePostSchema = z.object({
    type: z.enum(['TRACK', 'VIDEO', 'IMAGE', 'LYRIC']),
    text: z.string().max(500).optional(),
    hashtags: z.array(z.string()).max(10).default([]),
    // mediaUrl and thumbUrl are set server-side after upload
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const CreateStorySchema = z.object({
    mediaType: z.enum(['IMAGE', 'VIDEO']),
    // mediaUrl set server-side after upload
});

// ============================================================
// Marketplace Schemas
// ============================================================

export const CreateListingSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    price: z.number().min(0),
    priceType: z.enum(['fixed', 'negotiable']).optional().default('fixed'),
    category: z.string().min(1),
    condition: z.string().min(1),
    location: z.string().min(2),
    images: z.array(z.string()).min(0), // allow empty for now, handle in UI
    type: z.enum(['product', 'service']).optional().default('service'),
    deliveryDays: z.number().min(0).optional(),
    deliveryMethod: z.string().optional(),
    revisions: z.number().min(0).optional(),
    requiresBriefing: z.boolean().optional(),
    hasSample: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'SOLD', 'EXPIRED', 'DELETED', 'CLOSED']).optional().default('ACTIVE'),
});
export type CreateListingInput = z.infer<typeof CreateListingSchema>;

// ============================================================
// Collaboration Schemas
// ============================================================

export const CreateCollabPostSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    type: z.enum(['FEAT', 'PRODUCER', 'MIX_MASTER', 'SONGWRITER', 'MUSICIAN', 'OTHER']),
    genres: z.array(z.string()).min(1),
    location: z.string().optional(),
    remote: z.boolean().default(false),
    compensation: z.enum(['PAID', 'REV_SHARE', 'FREE', 'NEGOTIABLE']),
});
export type CreateCollabPostInput = z.infer<typeof CreateCollabPostSchema>;

export const CreateCollabInterestSchema = z.object({
    collabId: z.string().uuid(),
    message: z.string().min(1).max(500),
});
export type CreateCollabInterestInput = z.infer<typeof CreateCollabInterestSchema>;

// ============================================================
// Proposal Schemas
// ============================================================

export const CreateProposalSchema = z.object({
    artistId: z.string().uuid(),
    type: z.enum(['LIVE_SHOW', 'RECORDING', 'FEAT', 'MUSIC_VIDEO', 'EVENT', 'OTHER']),
    amount: z.number().min(0).max(10_000_000),
    date: z.string().datetime({ offset: true }).optional(),
    location: z.string().max(200).optional(),
    online: z.boolean().default(false),
    terms: z.string().max(5000).optional(),
    durationHours: z.number().min(0).max(1000).optional(),
    responseDeadline: z.string().datetime({ offset: true }).optional(),
    // contractFileUrl set server-side after upload
});
export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;

export const UpdateProposalStatusSchema = z.object({
    status: z.enum(['SENT', 'VIEWED', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
});

// ============================================================
// Chat / WS Message Schemas
// ============================================================

export const SendMessageSchema = z.object({
    message: z.string().max(2000).optional(),
    // attachmentUrl set server-side after upload
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

// ============================================================
// Filter / Query Schemas
// ============================================================

export const DiscoverFiltersSchema = z.object({
    states: z.array(z.string().length(2)).optional(),
    genres: z.array(z.string()).optional(),
    minScore: z.coerce.number().min(0).max(100).optional(),
    availableForBooking: z.coerce.boolean().optional(),
    verified: z.coerce.boolean().optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
    sortBy: z.enum(['score', 'plays', 'growth', 'recent']).default('score'),
});

export const RankingsFiltersSchema = z.object({
    state: z.string().length(2).optional(),
    genre: z.string().optional(),
    period: z.enum(['week', 'month']).default('week'),
    limit: z.coerce.number().refine((v) => [10, 20, 50].includes(v)).default(10),
});

export const PaginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
});
