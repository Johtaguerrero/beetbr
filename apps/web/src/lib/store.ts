import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import {
    User,
    ArtistProfile,
    IndustryProfile,
    Post,
    Story,
    Proposal,
    ProposalStatus,
    ProposalType,
    ProposalMessage as Message,
    ContractFileVersion as ContractVersion,
    Listing,
    ListingStatus,
    CollabPost,
    CollabPostStatus,
    CollabInterest,
    CreateListingInput,
    CreateCollabPostInput,
    CreateCollabInterestInput,
} from '@beetbr/shared';

export type {
    User,
    ArtistProfile,
    IndustryProfile,
    Post,
    Story,
    Proposal,
    ProposalStatus,
    ProposalType,
    Message,
    ContractVersion,
    Listing,
    ListingStatus,
    CollabPost,
    CollabPostStatus,
    CollabInterest,
    CreateListingInput,
    CreateCollabPostInput,
    CreateCollabInterestInput,
};

export type CollabType = CollabPost['type'];
export type CollabMode = 'online' | 'presencial' | 'hibrido';

export type UserRole = 'ARTIST' | 'INDUSTRY';

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface Metrics {
    plays: number;
    views: number;
    engagement: number;
    weeklyGrowth: number;
    retention: number;
    consistency: number;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface Notification {
    id: string;
    type: 'PROPOSAL' | 'MESSAGE' | 'CONTRACT' | 'SYSTEM' | 'deal';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface MarketplaceChat {
    id: string;
    listingId: string;
    listingTitle: string;
    sellerId: string;
    sellerName: string;
    buyerId: string;
    buyerName: string;
    messages: { id: string; senderId: string; text: string; createdAt: string }[];
}

export interface CollabMessage {
    id: string;
    senderId: string;
    text: string;
    createdAt: string;
}

export interface CollabThread {
    id: string;
    collabId: string;
    collabPostTitle: string;
    authorUserId: string;
    authorName: string;
    authorScore?: number;
    interestedUserId: string;
    interestedUserName: string;
    interestedUserScore?: number;
    messages: CollabMessage[];
    status: 'ACTIVE' | 'ARCHIVED' | string;
    updatedAt: string;
}

// ── Mock Data ───────────────────────────────────────────────────

export const MOCK_LISTINGS: Listing[] = [
    {
        id: 'listing-1',
        sellerId: 'artist-1',
        sellerName: 'MC Vibrante',
        sellerVerified: true,
        sellerScore: 94,
        sellerCity: 'São Paulo',
        sellerState: 'SP',
        title: 'Beats Trap/Drill - Pack 5 Unid',
        description: 'Pack com 5 beats exclusivos nos estilos que estão dominando a cena.',
        price: 450,
        priceType: 'fixed',
        category: 'beats',
        condition: 'NEW',
        location: 'São Paulo, SP',
        images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'],
        status: 'ACTIVE',
        views: 1250, chats: 12, saves: 45,
        rating: 4.8,
        reviewCount: 24,
        deliveryDays: 3,
        deliveryMethod: 'digital',
        revisions: 2,
        requiresBriefing: true,
        hasSample: true,
        tags: ['beats', 'trap', 'exclusive'],
        type: 'service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
];

export const MOCK_ARTISTS: ArtistProfile[] = [
    {
        id: 'artist-1',
        userId: 'user-artist-1',
        stageName: 'MC Vibrante',
        genres: ['Funk', 'Trap'],
        city: 'São Paulo',
        state: 'SP',
        bio: 'Funk carioca com influências do trap newyorkino.',
        availableForBooking: true,
        contactVisibility: 'PUBLIC',
        scoreBeet: 94,
        verified: true,
        followersCount: 45200,
        playsTotal: 2100000,
        metrics: {
            artistId: 'artist-1',
            plays: 2100000,
            views: 2400000,
            engagement: 8.7,
            weeklyGrowth: 4.2,
            retention: 72,
            consistency: 89,
            updatedAt: new Date().toISOString(),
            scoreBeet: 94,
            breakdown: { growth: 95, engagement: 87, retention: 72, consistency: 89 }
        },
        instagram: '@mcvibrante',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
];

export const MOCK_POSTS: Post[] = [
    {
        id: 'post-1',
        artistId: 'artist-1',
        artist: { stageName: 'MC Vibrante', avatarUrl: 'https://i.pravatar.cc/150?u=artist-1', scoreBeet: 94 },
        type: 'TRACK',
        text: '🔥 Single novo chegando! Aguardem o drop de sexta-feira.',
        hashtags: ['FunkBR', 'TrapNacional', 'BeatBR', 'SingleNovo'],
        plays: 14200,
        likes: 980,
        comments: 142,
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_STORIES: Story[] = [
    {
        id: 'story-1',
        artistId: 'artist-1',
        artist: { stageName: 'MC Vibrante', avatarUrl: 'https://i.pravatar.cc/150?u=artist-1', scoreBeet: 94 },
        mediaUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400',
        mediaType: 'IMAGE',
        expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
        createdAt: new Date().toISOString()
    },
];

export const MOCK_INDUSTRY: IndustryProfile = {
    id: 'industry-1',
    userId: 'user-industry-1',
    companyName: 'Label One Music',
    type: 'LABEL' as any,
    niches: ['Funk', 'Trap', 'R&B'],
    city: 'São Paulo',
    state: 'SP',
    verified: true,
    instagram: '@labelonemusic',
    website: 'labelonemusic.com.br',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
} as any;

export const MARKETPLACE_CATEGORIES = [
    { slug: 'beats', label: 'Beats & Instrumentais', icon: '🥁', color: '#00FF66' },
    { slug: 'mixagem', label: 'Mixagem & Master', icon: '🎛️', color: '#0057FF' },
    { slug: 'composicao', label: 'Composição & Letras', icon: '📝', color: '#FFD400' },
    { slug: 'videoclipe', label: 'Videoclipes & Edição', icon: '🎬', color: '#FF0055' },
    { slug: 'design', label: 'Capa & Identidade', icon: '🎨', color: '#8B5CF6' },
    { slug: 'assessoria', label: 'Marketing & Assessoria', icon: '📈', color: '#059669' },
];
export type MarketplaceCategory = 'beats' | 'mixagem' | 'composicao' | 'videoclipe' | 'design' | 'assessoria' | 'equipamentos' | 'SERVICE' | string;

export const INITIAL_PROPOSALS: Proposal[] = [
    {
        id: 'proposal-1',
        industryId: 'industry-1',
        industry: { companyName: 'Label One Music', logoUrl: '' } as any,
        industryName: 'Label One Music',
        artistId: 'artist-1',
        artistName: 'MC Vibrante',
        artistScore: 94,
        type: 'LIVE_SHOW' as any,
        amount: 15000,
        status: 'SENT',
        online: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        contractVersions: [],
    },
];

export const COLLAB_TYPE_CONFIG: Record<string, { label: string; chip: string; color: string; icon: string }> = {
    PRODUCER: { label: 'Produtor', chip: 'Produtores', color: '#059669', icon: '🎛️' },
    FEAT: { label: 'Feat', chip: 'Feat', color: '#00FF66', icon: '🤝' },
    MIX_MASTER: { label: 'Mix & Master', chip: 'Mix & Master', color: '#D97706', icon: '🎧' },
    MUSICIAN: { label: 'Músico', chip: 'Músicos', color: '#8B5CF6', icon: '🎸' },
    SONGWRITER: { label: 'Compositor', chip: 'Compositores', color: '#DB2777', icon: '✍️' },
    OTHER: { label: 'Outro', chip: 'Outros', color: '#64748B', icon: '💼' },
};

export const MOCK_COLLAB_POSTS: CollabPost[] = [
    {
        id: 'collab-1',
        authorId: 'artist-1',
        authorName: 'MC Vibrante',
        authorVerified: true,
        authorScore: 94,
        authorCity: 'São Paulo',
        authorState: 'SP',
        type: 'FEAT',
        title: 'Feat Trap Pesado',
        description: 'Buscando alguém para verso agressivo.',
        genres: ['Trap'],
        remote: true,
        compensation: 'REV_SHARE',
        status: 'ACTIVE',
        views: 150,
        interestCount: 5,
        chatCount: 2,
        createdAt: new Date().toISOString(),
    },
];

// ── Main Store ────────────────────────────────────────────────

interface BeetrStore {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    sidebarExpanded: boolean;
    toggleSidebar: () => void;
    showNotifications: boolean;
    toggleNotifications: (val?: boolean) => void;

    currentUser: AuthUser | null;
    artistProfile: ArtistProfile | null;
    industryProfile: IndustryProfile | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;

    artists: ArtistProfile[];
    posts: Post[];
    stories: Story[];
    proposals: Proposal[];
    shortlist: string[];
    likedPosts: Set<string>;

    listings: Listing[];
    savedListings: string[];
    marketplaceChats: MarketplaceChat[];
    myListings: Listing[];

    collabPosts: CollabPost[];
    collabInterests: CollabInterest[];
    collabThreads: CollabThread[];

    toasts: Toast[];
    notifications: Notification[];
    postComments: Record<string, { id: string; authorName: string; authorAvatarUrl?: string; text: string; createdAt: string }[]>;

    loginAsArtist: (email: string, password: string) => Promise<void>;
    loginAsIndustry: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string, role?: UserRole) => Promise<void>;
    registerArtist: (data: { email: string; password: string; stageName: string }) => Promise<void>;
    registerIndustry: (data: { email: string; password: string; companyName: string }) => Promise<void>;
    logout: () => void;
    setAccessToken: (token: string) => void;

    updateArtistProfile: (data: Partial<ArtistProfile>) => void;
    togglePostLike: (postId: string) => void;
    fetchFeed: (page?: number) => Promise<void>;
    fetchStories: () => Promise<void>;
    createPost: (data: { type: Post['type']; text?: string; hashtags?: string[]; file?: File }) => Promise<string>;
    createStory: (file: File) => Promise<void>;
    addPostComment: (postId: string, text: string) => void;

    toggleShortlist: (artistId: string) => void;
    isInShortlist: (artistId: string) => boolean;

    createProposal: (data: any) => string;
    sendMessage: (proposalId: string, message: string) => void;
    acceptProposal: (proposalId: string) => void;
    rejectProposal: (proposalId: string) => void;
    cancelProposal: (proposalId: string) => void;
    uploadContract: (proposalId: string, fileName: string) => void;

    fetchListings: (params?: object) => Promise<void>;
    createListing: (data: Omit<CreateListingInput, 'images'>, files: File[]) => Promise<string>;
    toggleSaveListing: (listingId: string) => void;
    isListingSaved: (listingId: string) => boolean;
    startMarketplaceChat: (listingId: string, listingTitle: string, sellerId: string, sellerName: string) => string;
    sendMarketMessage: (chatId: string, text: string) => void;
    updateListingStatus: (listingId: string, status: ListingStatus) => void;

    fetchCollabPosts: () => Promise<void>;
    createCollabPost: (data: CreateCollabPostInput) => Promise<string>;
    expressInterest: (collabId: string, message: string) => Promise<void>;
    acceptInterest: (interestId: string) => void;
    rejectInterest: (interestId: string) => void;
    sendCollabMessage: (threadId: string, text: string) => void;
    updateCollabStatus: (collabId: string, status: CollabPostStatus) => void;

    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markNotificationAsRead: (id: string) => void;
    clearAllNotifications: () => void;
}

export const useStore = create<BeetrStore>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
            sidebarExpanded: true,
            toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
            showNotifications: false,
            toggleNotifications: (val) => set((state) => ({ showNotifications: val !== undefined ? val : !state.showNotifications })),
            currentUser: null,
            artistProfile: null,
            industryProfile: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            artists: MOCK_ARTISTS,
            posts: MOCK_POSTS,
            stories: MOCK_STORIES,
            proposals: INITIAL_PROPOSALS,
            shortlist: [],
            likedPosts: new Set(),
            toasts: [],
            notifications: [],
            postComments: {},
            listings: MOCK_LISTINGS,
            savedListings: [],
            marketplaceChats: [],
            myListings: [],
            collabPosts: MOCK_COLLAB_POSTS,
            collabInterests: [],
            collabThreads: [],

            loginAsArtist: async (email, password) => {
                const res: any = await api.auth.login({ email, password });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({ currentUser: user, artistProfile: profile, isAuthenticated: true, accessToken, refreshToken });
                get().addToast({ message: `Bem-vindo, ${profile.stageName}!`, type: 'success' });
            },

            loginAsIndustry: async (email, password) => {
                const res: any = await api.auth.login({ email, password });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({ currentUser: user, industryProfile: profile, isAuthenticated: true, accessToken, refreshToken });
                get().addToast({ message: `Bem-vindo, ${profile.companyName}!`, type: 'success' });
            },

            loginWithGoogle: async (idToken, role) => {
                const res: any = await api.auth.google({ idToken, role });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({
                    currentUser: user,
                    artistProfile: user.role === 'ARTIST' ? profile : null,
                    industryProfile: user.role === 'INDUSTRY' ? profile : null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });
                const name = profile.stageName || profile.companyName;
                get().addToast({ message: `Bem-vindo, ${name}!`, type: 'success' });
            },

            registerArtist: async (data) => {
                const res: any = await api.auth.register({ ...data, role: 'ARTIST' });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({ currentUser: user, artistProfile: profile, isAuthenticated: true, accessToken, refreshToken });
                get().addToast({ message: 'Conta criada!', type: 'success' });
            },

            registerIndustry: async (data) => {
                const res: any = await api.auth.register({ ...data, role: 'INDUSTRY' });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({ currentUser: user, industryProfile: profile, isAuthenticated: true, accessToken, refreshToken });
                get().addToast({ message: 'Empresa registrada!', type: 'success' });
            },

            logout: () => set({ currentUser: null, artistProfile: null, industryProfile: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
            setAccessToken: (token) => set({ accessToken: token }),

            updateArtistProfile: (data) => set((s) => ({ artistProfile: s.artistProfile ? { ...s.artistProfile, ...data } : null })),

            fetchFeed: async (page = 1) => {
                const { accessToken } = get();
                if (accessToken === 'demo-token') return;
                try {
                    const res: any = await api.feed.getFeed(page);
                    set({ posts: res.data });
                } catch (error: any) {
                    console.error('Failed to fetch feed:', error);
                    // Silently fail to prevent toast spam when API is down
                }
            },

            fetchStories: async () => {
                const { accessToken } = get();
                if (accessToken === 'demo-token') return;
                try {
                    const res: any = await api.feed.getStories();
                    set({ stories: res.data });
                } catch (error: any) {
                    console.error('Failed to fetch stories:', error);
                    // Silently fail to prevent toast spam when API is down
                }
            },

            togglePostLike: (postId) => set((s) => {
                const liked = new Set(s.likedPosts);
                const posts = s.posts.map((p) => {
                    if (p.id !== postId) return p;
                    const wasLiked = liked.has(postId);
                    if (wasLiked) { liked.delete(postId); return { ...p, likes: p.likes - 1, liked: false }; }
                    liked.add(postId);
                    return { ...p, likes: p.likes + 1, liked: true };
                });
                return { posts, likedPosts: liked };
            }),

            addPostComment: (postId, text) => set((s) => {
                const currentUser = s.currentUser;
                const authorName = currentUser?.role === 'ARTIST' ? s.artistProfile?.stageName : s.industryProfile?.companyName;
                const newComment = {
                    id: `comment-${Date.now()}`,
                    authorName: authorName || 'Você',
                    text,
                    createdAt: new Date().toISOString()
                };

                const currentComments = s.postComments[postId] || [];
                const updatedPosts = s.posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p);

                return {
                    postComments: { ...s.postComments, [postId]: [...currentComments, newComment] },
                    posts: updatedPosts
                };
            }),

            createPost: async (data) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return '';
                const file = data.file;

                // Helper to create locally
                const createLocally = (mediaUrl?: string) => {
                    const newPost: Post = {
                        id: `post-${Date.now()}`,
                        artistId: artistProfile.id,
                        artist: { stageName: artistProfile.stageName, avatarUrl: '', scoreBeet: artistProfile.scoreBeet },
                        type: data.type,
                        text: data.text,
                        hashtags: data.hashtags || [],
                        mediaUrl,
                        likes: 0,
                        comments: 0,
                        plays: 0,
                        liked: false,
                        createdAt: new Date().toISOString(),
                    };
                    set((s) => ({ posts: [newPost, ...s.posts] }));
                    get().addToast({ message: 'Post publicado! 🚀', type: 'success' });
                    return newPost.id;
                };

                if (accessToken === 'demo-token') {
                    if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        return createLocally(objectUrl);
                    } else {
                        return createLocally();
                    }
                }

                try {
                    let mediaUrl = undefined;
                    if (file) {
                        const res = await api.upload(file);
                        mediaUrl = res.url;
                    }
                    const res: any = await api.feed.createPost({ ...data, mediaUrl, artistId: artistProfile.id });
                    set((s) => ({ posts: [res.data, ...s.posts] }));
                    get().addToast({ message: 'Post publicado! 🚀', type: 'success' });
                    return res.data.id;
                } catch (error: any) {
                    console.error('API createPost failed, falling back locally:', error);
                    // Fallback locally if API is down
                    if (file) {
                        return createLocally(URL.createObjectURL(file));
                    } else {
                        return createLocally();
                    }
                }
            },

            createStory: async (file) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return;

                const createLocally = () => {
                    const objectUrl = URL.createObjectURL(file);
                    const newStory: Story = {
                        id: `story-${Date.now()}`,
                        artistId: artistProfile.id,
                        artist: { stageName: artistProfile.stageName, avatarUrl: '', scoreBeet: artistProfile.scoreBeet },
                        mediaUrl: objectUrl,
                        mediaType: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
                        expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
                        createdAt: new Date().toISOString(),
                    };
                    set((s) => ({ stories: [newStory, ...s.stories] }));
                    get().addToast({ message: 'Story publicado! 📸', type: 'success' });
                };

                // Demo mode: create story locally without API
                if (accessToken === 'demo-token') {
                    createLocally();
                    return;
                }

                try {
                    const uploadRes = await api.upload(file);
                    const res: any = await api.feed.createStory({ mediaUrl: uploadRes.url, artistId: artistProfile.id, mediaType: 'IMAGE' });
                    set((s) => ({ stories: [res.data, ...s.stories] }));
                    get().addToast({ message: 'Story publicado!', type: 'success' });
                } catch (error: any) {
                    console.error('API createStory failed, falling back locally:', error);
                    createLocally();
                }
            },

            toggleShortlist: (artistId) => set((s) => ({ shortlist: s.shortlist.includes(artistId) ? s.shortlist.filter((id) => id !== artistId) : [...s.shortlist, artistId] })),
            isInShortlist: (artistId) => get().shortlist.includes(artistId),

            createProposal: (data) => {
                const id = `proposal-${Date.now()}`;
                const now = new Date().toISOString();
                const proposal: Proposal = { ...data, id, messages: [], contractVersions: [], createdAt: now, updatedAt: now };
                set((s) => ({ proposals: [...s.proposals, proposal] }));
                get().addToast({ message: 'Proposta enviada!', type: 'success' });
                return id;
            },

            sendMessage: (proposalId, message) => {
                const { currentUser, artistProfile, industryProfile } = get();
                if (!currentUser) return;
                const msg: Message = {
                    id: `msg-${Date.now()}`,
                    proposalId,
                    senderUserId: currentUser.id,
                    senderId: currentUser.id,
                    senderName: artistProfile?.stageName || industryProfile?.companyName || 'Usuário',
                    senderRole: currentUser.role,
                    message,
                    systemMessage: false,
                    isSystem: false,
                    createdAt: new Date().toISOString()
                };
                set((s) => ({
                    proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, messages: [...((p as any).messages || []), msg], updatedAt: new Date().toISOString() } : p)
                }));
            },

            acceptProposal: (proposalId) => {
                const proposal = get().proposals.find(p => p.id === proposalId);
                const sysMsg: Message = {
                    id: `msg-sys-${Date.now()}`,
                    proposalId,
                    senderUserId: 'system',
                    senderId: 'system',
                    senderName: 'Sistema',
                    senderRole: 'ARTIST' as any,
                    message: '✅ Proposta aceita.',
                    systemMessage: true,
                    isSystem: true,
                    createdAt: new Date().toISOString()
                };
                set((s) => ({
                    proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'ACCEPTED', messages: [...((p as any).messages || []), sysMsg] } : p)
                }));
                get().addToast({ message: 'Proposta aceita!', type: 'success' });
                if (proposal) {
                    get().addNotification({ title: 'Proposta Aceita!', message: `O artista ${(proposal as any).artistName} aceitou sua proposta.`, type: 'deal', link: `/deals/${proposalId}` });
                }
            },

            rejectProposal: (proposalId) => {
                set((s) => ({
                    proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'REJECTED' } : p)
                }));
            },

            cancelProposal: (proposalId) => {
                set((s) => ({
                    proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'CANCELLED' } : p)
                }));
            },

            uploadContract: (proposalId, fileName) => {
                const { currentUser } = get();
                if (!currentUser) return;
                set((s) => ({
                    proposals: s.proposals.map((p) => {
                        if (p.id !== proposalId) return p;
                        const version = p.contractVersions?.length + 1 || 1;
                        const newVersion: ContractVersion = {
                            id: `cv-${Date.now()}`,
                            contractId: proposalId,
                            version,
                            fileName,
                            fileUrl: '#',
                            uploadedBy: currentUser.id,
                            uploaderName: (get().artistProfile?.stageName || get().industryProfile?.companyName || 'Usuário'),
                            uploaderRole: currentUser.role,
                            createdAt: new Date().toISOString()
                        };
                        return { ...p, contractVersions: [...(p.contractVersions || []), newVersion] };
                    }),
                }));
                get().addToast({ message: 'Contrato enviado!', type: 'success' });
            },

            fetchListings: async (params) => {
                try {
                    const res: any = await api.marketplace.list(params);
                    set({ listings: res.data });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            createListing: async (data, files) => {
                const { currentUser } = get();
                if (!currentUser) return '';
                try {
                    const imageUrls: string[] = [];
                    for (const file of files) {
                        const res = await api.upload(file);
                        imageUrls.push(res.url);
                    }
                    const res: any = await api.marketplace.create({ ...data, images: imageUrls, sellerId: currentUser.id });
                    set((s) => ({ listings: [res.data, ...s.listings] }));
                    get().addToast({ message: 'Anúncio publicado!', type: 'success' });
                    return res.data.id;
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                    return '';
                }
            },

            toggleSaveListing: (listingId) => {
                const { savedListings } = get();
                const isSaved = savedListings.includes(listingId);
                set({ savedListings: isSaved ? savedListings.filter((id) => id !== listingId) : [...savedListings, listingId] });
            },

            isListingSaved: (listingId) => get().savedListings.includes(listingId),

            startMarketplaceChat: (listingId, listingTitle, sellerId, sellerName) => {
                const id = `chat-${Date.now()}`;
                const { currentUser } = get();
                const newChat: MarketplaceChat = {
                    id,
                    listingId,
                    listingTitle,
                    sellerId,
                    sellerName,
                    buyerId: currentUser?.id || 'guest',
                    buyerName: currentUser?.role === 'ARTIST' ? (get().artistProfile?.stageName || 'Visitante') : (get().industryProfile?.companyName || 'Empresa'),
                    messages: []
                };
                set((s) => ({ marketplaceChats: [newChat, ...s.marketplaceChats] }));
                return id;
            },

            sendMarketMessage: (chatId, text) => {
                const { currentUser } = get();
                if (!currentUser) return;
                set((s) => ({
                    marketplaceChats: s.marketplaceChats.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, { id: `msg-${Date.now()}`, senderId: currentUser.id, text, createdAt: new Date().toISOString() }] } : c)
                }));
            },

            updateListingStatus: (listingId, status) => {
                set((s) => ({ listings: s.listings.map((l) => l.id === listingId ? { ...l, status } : l) }));
            },

            fetchCollabPosts: async () => {
                try {
                    const res: any = await api.collaborations.list();
                    set({ collabPosts: res.data });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            createCollabPost: async (data) => {
                try {
                    const res: any = await api.collaborations.create(data);
                    set((s) => ({ collabPosts: [res.data, ...s.collabPosts] }));
                    get().addToast({ message: 'Colaboração publicada!', type: 'success' });
                    return res.data.id;
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                    return '';
                }
            },

            expressInterest: async (collabId, message) => {
                try {
                    await api.collaborations.expressInterest(collabId, { message });
                    get().addToast({ message: 'Interesse enviado!', type: 'success' });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            acceptInterest: (interestId) => {
                set((s) => ({ collabInterests: s.collabInterests.map((i) => i.id === interestId ? { ...i, status: 'ACCEPTED' as any } : i) }));
            },

            rejectInterest: (interestId) => {
                set((s) => ({ collabInterests: s.collabInterests.map((i) => i.id === interestId ? { ...i, status: 'REJECTED' as any } : i) }));
            },

            sendCollabMessage: (threadId, text) => {
                const { currentUser } = get();
                if (!currentUser) return;
                set((s) => ({
                    collabThreads: s.collabThreads.map((t) => t.id === threadId ? { ...t, messages: [...t.messages, { id: `msg-${Date.now()}`, senderId: currentUser.id, text, createdAt: new Date().toISOString() }] } : t)
                }));
            },

            updateCollabStatus: (id, status) => {
                set((s) => ({ collabPosts: s.collabPosts.map((p) => p.id === id ? { ...p, status } : p) }));
            },

            addToast: (toast) => {
                const id = `toast-${Date.now()}`;
                set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
                setTimeout(() => get().removeToast(id), 4000);
            },

            removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

            addNotification: (notif) => {
                const id = `notif-${Date.now()}`;
                set((s) => ({ notifications: [{ ...notif, id, read: false, createdAt: new Date().toISOString() }, ...s.notifications] }));
            },

            markNotificationAsRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
            clearAllNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'beatbr-store-v2',
            partialize: (s) => ({
                currentUser: s.currentUser,
                artistProfile: s.artistProfile,
                industryProfile: s.industryProfile,
                isAuthenticated: s.isAuthenticated,
                shortlist: s.shortlist,
                proposals: s.proposals,
                posts: s.posts,
                savedListings: s.savedListings,
                marketplaceChats: s.marketplaceChats,
                myListings: s.myListings,
                collabPosts: s.collabPosts,
                notifications: s.notifications,
                likedPosts: Array.from(s.likedPosts),
            }),
            merge: (persisted: any, current) => ({
                ...current,
                ...persisted,
                likedPosts: new Set(persisted.likedPosts || []),
            }),
        }
    )
);
