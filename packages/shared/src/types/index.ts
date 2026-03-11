// ============================================================
// BeatBR — Shared TypeScript Types
// ============================================================

/** User roles in the BeatBR platform */
export type UserRole = 'ARTIST' | 'INDUSTRY' | 'ADMIN';

/** Possible user account statuses */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DELETED';

/** Core user entity */
export interface User {
    id: string;
    email: string;
    role: UserRole;
    verified: boolean;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

/** Artist profile — linked 1:1 to a User with role=ARTIST */
export interface ArtistProfile {
    id: string;
    userId: string;
    stageName: string;
    genres: string[];
    city: string;
    state: string;
    bio: string;
    avatarUrl?: string;
    coverUrl?: string;
    availableForBooking: boolean;
    contactVisibility: 'PUBLIC' | 'VERIFIED_ONLY' | 'PROPOSAL_ONLY' | 'PRIVATE';
    scoreBeet: number; // 0–100
    verified: boolean;
    followersCount: number;
    playsTotal: number;
    metrics: Metrics;

    // Novos campos BeeatBR
    realName?: string;
    pronouns?: string;
    birthDate?: string;
    bioFull?: string;
    subGenres: string[];
    complementaryStyles: string[];
    roles: string[];
    professionalQuestions?: ProfessionalQuestions;
    status?: string;
    mainGoal?: string;
    availabilityStatus?: string;
    opportunityTypes: string[];
    socialProofs?: SocialProof;
    portfolioPdfUrl?: string;
    portfolioPdfName?: string;
    ranking?: string;

    instagram?: string;
    youtubeUrl?: string;
    spotifyUrl?: string;
    tiktokUrl?: string;
    soundcloudUrl?: string;
    deezerUrl?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
}

/** Structure for the 20+ professional artist questions */
export interface ProfessionalQuestions {
    availableForHire: 'YES' | 'NO' | 'CONSULT';
    liveShows: 'YES' | 'NO' | 'SOON';
    ownBand: 'YES' | 'PARTIAL' | 'NO';
    performanceFormat: 'SOLO' | 'DUO' | 'BANDA' | 'DJ_VOCAL' | 'OTHER';
    corporateEvents: 'YES' | 'NO' | 'ANALYSIS';
    venueTypes: 'YES' | 'NO' | 'ANALYSIS';
    featsAndCollabs: 'YES' | 'NO' | 'PROPOSAL';
    unpaidCollabs: 'YES' | 'NO' | 'DEPENDS';
    revShareCollabs: 'YES' | 'NO' | 'NEGOTIATION';
    pressMaterial: 'YES' | 'NO';
    hasPdfPortfolio: 'YES' | 'NO';
    officialReleases: 'YES' | 'NO' | 'RELEASING';
    digitalPlatforms: 'YES' | 'NO';
    stageExperience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
    travelAvailability: 'YES' | 'NO' | 'DEPENDS';
    autoralRepertoire: 'YES' | 'NO' | 'PARTIAL';
    singsCovers: 'YES' | 'NO';
    invoiceIssuance: 'YES' | 'NO' | 'PARTNER';
    hasManager: 'YES' | 'NO';
    preferredContract: 'FIXED' | 'COMBINE' | 'REV_SHARE' | 'PERMUTE' | 'OTHER';
}

/** Structure for social proofs (collaborations, venues, etc.) */
export interface SocialProof {
    collaboratedArtists: string[];
    venuesPlayed: string[];
    festivals: string[];
    partnerBrands: string[];
    playlists: string[];
    pressLinks: string[];
    testimonials: { author: string; text: string }[];
}

/** Industry / company profile — linked 1:1 to a User with role=INDUSTRY */
export interface IndustryProfile {
    id: string;
    userId: string;
    companyName: string;
    type: IndustryType;
    niches: string[];
    city: string;
    state: string;
    logoUrl?: string;
    coverUrl?: string;
    website?: string;
    instagram?: string;
    verified: boolean;
    cnpj?: string;
    createdAt: string;
    updatedAt: string;
}

export type IndustryType =
    | 'LABEL'
    | 'AGENCY'
    | 'BRAND'
    | 'PRODUCER'
    | 'EVENT'
    | 'OTHER';

/** Content post (music / video / lyric) */
export interface Post {
    id: string;
    artistId: string;
    artist?: Pick<ArtistProfile, 'stageName' | 'avatarUrl' | 'scoreBeet'>;
    type: 'TRACK' | 'VIDEO' | 'LYRIC' | 'AUDIO' | 'IMAGE';
    text?: string;
    mediaUrl?: string;
    thumbUrl?: string;
    duration?: number; // seconds
    hashtags: string[];
    plays: number;
    likes: number;
    comments: number;
    createdAt: string;
    liked?: boolean; // UI state
}

/** Story (expires in 24h) */
export interface Story {
    id: string;
    artistId: string;
    artist?: Pick<ArtistProfile, 'stageName' | 'avatarUrl' | 'scoreBeet'>;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    expiresAt: string;
    createdAt: string;
    seen?: boolean; // UI state
}

/** Engagement/performance metrics for an artist */
export interface Metrics {
    artistId: string;
    plays: number;
    views: number;
    engagement: number; // percentage (0–100)
    weeklyGrowth: number; // percentage change
    retention: number; // percentage (0–100)
    consistency: number; // 0–100 based on posting frequency
    viralIndex?: number;
    reach?: number;
    updatedAt: string;
    // BeetAI breakdown
    scoreBeet: number;
    breakdown: {
        growth: number;
        engagement: number;
        retention: number;
        consistency: number;
    };
}

/** Proposal from an Industry to an Artist */
export type ProposalStatus =
    | 'DRAFT'
    | 'SENT'
    | 'VIEWED'
    | 'NEGOTIATING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'EXPIRED';

export type ProposalType =
    | 'LIVE_SHOW'
    | 'RECORDING'
    | 'FEAT'
    | 'MUSIC_VIDEO'
    | 'EVENT'
    | 'OTHER';

export interface Proposal {
    id: string;
    industryId: string;
    artistId: string;
    industry?: Pick<IndustryProfile, 'companyName' | 'logoUrl'>;
    industryName?: string; // UI legacy field
    artist?: Pick<ArtistProfile, 'stageName' | 'avatarUrl'>;
    artistName?: string; // UI legacy field
    artistScore?: number; // UI legacy field
    type: ProposalType;
    amount: number; // BRL
    date?: string;
    location?: string;
    online: boolean;
    terms?: string;
    durationHours?: number;
    responseDeadline?: string;
    status: ProposalStatus;
    contractFileUrl?: string; // initial contract attachment
    messages: ProposalMessage[];
    contractVersions: ContractFileVersion[];
    createdAt: string;
    updatedAt: string;
}

/** Chat message inside a Deal Room */
export interface ProposalMessage {
    id: string;
    proposalId: string;
    senderUserId: string;
    senderId: string; // UI legacy alias
    senderName: string;
    senderRole: UserRole;
    message?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    systemMessage: boolean;
    isSystem?: boolean; // UI legacy alias
    createdAt: string;
}

/** Final contract linked to a Proposal */
export type ContractStatus = 'DRAFT' | 'UNDER_REVIEW' | 'SIGNED' | 'TERMINATED';

export interface Contract {
    id: string;
    proposalId: string;
    status: ContractStatus;
    versions: ContractFileVersion[];
    createdAt: string;
    updatedAt: string;
}

export interface ContractFileVersion {
    id: string;
    contractId: string;
    version: number;
    fileUrl: string;
    fileName: string;
    uploadedBy: string; // user ID
    uploaderName: string;
    uploaderRole: UserRole;
    createdAt: string;
}

/** Artist saved to an Industry's shortlist */
export interface SavedArtist {
    industryId: string;
    artistId: string;
    artist?: ArtistProfile;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    actorUserId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    ip?: string;
    userAgent?: string;
    createdAt: string;
}

// ============================================================
// Marketplace (Anúncios)
// ============================================================

export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD' | 'EXPIRED' | 'DELETED' | 'CLOSED';

export type MarketplaceCategory =
    | 'INSTRUMENT'
    | 'EQUIPMENT'
    | 'SERVICE'
    | 'STUDIO_TIME'
    | 'TICKET'
    | 'MERCH'
    | 'OTHER'
    | string;

export interface Listing {
    id: string;
    sellerId: string;
    sellerName: string;
    sellerAvatarUrl?: string;
    sellerVerified?: boolean;
    sellerScore?: number;
    sellerCity?: string;
    sellerState?: string;
    title: string;
    description: string;
    price: number;
    priceType?: 'fixed' | 'negotiable' | string;
    category: MarketplaceCategory;
    condition: 'NEW' | 'USED_LIKE_NEW' | 'USED_GOOD' | 'USED_FAIR' | string;
    location: string;
    images: string[];
    status: ListingStatus;
    views: number;
    chats: number;
    saves: number;
    rating?: number;
    reviewCount?: number;
    deliveryDays?: number;
    deliveryMethod?: string;
    revisions?: number;
    requiresBriefing?: boolean;
    hasSample?: boolean;
    tags: string[];
    type?: 'product' | 'service' | string;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// Collaborations
// ============================================================

export type CollabPostStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface CollabPost {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    authorVerified?: boolean;
    authorScore?: number;
    authorCity?: string;
    authorState?: string;
    title: string;
    description: string;
    type: 'FEAT' | 'PRODUCER' | 'MIX_MASTER' | 'SONGWRITER' | 'MUSICIAN' | 'OTHER' | string;
    genres: string[];
    location?: string;
    city?: string;
    state?: string;
    remote: boolean;
    compensation: 'PAID' | 'REV_SHARE' | 'FREE' | 'NEGOTIABLE';
    status: CollabPostStatus;
    views: number;
    interestCount: number;
    chatCount: number;
    coverUrl?: string;
    targetArtistId?: string;
    targetArtist?: Pick<ArtistProfile, 'stageName' | 'avatarUrl'>;
    deadline?: string;
    createdAt: string;
}

export interface CollabInterest {
    id: string;
    collabId: string;
    collabPostId?: string; // UI legacy alias
    userId: string;
    interestedUserId?: string; // UI legacy alias
    userName: string;
    interestedUserName?: string; // UI legacy alias
    interestedUserScore?: number; // UI legacy alias
    userAvatarUrl?: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

// ============================================================
// API Response Wrappers
// ============================================================

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
    };
}

// ============================================================
// Discover / Feed Filters
// ============================================================

export interface DiscoverFilters {
    states?: string[];
    genres?: string[];
    minScore?: number;
    availableForBooking?: boolean;
    verified?: boolean;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    perPage?: number;
    sortBy?: 'score' | 'plays' | 'growth' | 'recent';
}

export interface RankingsFilters {
    state?: string;
    genre?: string;
    period?: 'week' | 'month';
    limit?: 10 | 20 | 50;
}

// ============================================================
// WebSocket Messages (Deal Room)
// ============================================================

export type WsMessageType =
    | 'CHAT_MESSAGE'
    | 'FILE_UPLOAD'
    | 'STATUS_CHANGE'
    | 'USER_TYPING'
    | 'USER_JOINED'
    | 'USER_LEFT'
    | 'ERROR';

export interface WsMessage {
    type: WsMessageType;
    payload: unknown;
    timestamp: string;
}

export interface WsChatPayload {
    proposalId: string;
    message?: string;
    attachmentUrl?: string;
    attachmentName?: string;
}

export interface WsTypingPayload {
    proposalId: string;
    userId: string;
    isTyping: boolean;
}

// ============================================================
// Notifications & Connections
// ============================================================

export type NotificationType =
    | 'NEW_PROPOSAL'
    | 'PROPOSAL_RESPONSE'
    | 'NEW_MESSAGE'
    | 'COLLAB_INTEREST'
    | 'MARKETPLACE_INTERACT'
    | 'NEW_FOLLOWER'
    | 'NEW_LIKE'
    | 'SYSTEM';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export interface Follow {
    followerId: string;
    followingId: string;
    createdAt: string;
}

// ============================================================
// Marketplace Messages
// ============================================================

export interface ListingMessage {
    id: string;
    listingId: string;
    senderId: string;
    message: string;
    createdAt: string;
}

