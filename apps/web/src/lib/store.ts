import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import {
    User,
    ArtistProfile,
    IndustryProfile,
    Post,
    PostStatus,
    PublishTarget,
    Story,
    Proposal,
    ProposalStatus,
    ProposalType,
    ChatMessage,
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
    PostStatus,
    PublishTarget,
    Story,
    Proposal,
    ProposalStatus,
    ProposalType,
    ChatMessage as Message,
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

export type UserRole = 'ARTIST' | 'INDUSTRY' | 'ADMIN';

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


export interface ChatThread {
    id: string;
    type: 'PROPOSAL' | 'COLLAB' | 'MARKETPLACE' | 'DIRECT';
    status: string;
    lastMessage?: string;
    participants: any[];
    messages?: ChatMessage[];
    proposal?: any;
    collab?: any;
    listing?: any;
    updatedAt: string;
    metadata?: {
        buyerId?: string;
        sellerId?: string;
        listingId?: string;
        collabId?: string;
        proposalId?: string;
    };
}

// ── Mock Data (Empty for Real Persistence) ───────────────────────────

export const MOCK_LISTINGS: Listing[] = [];
export const MOCK_ARTISTS: ArtistProfile[] = [];
export const MOCK_POSTS: Post[] = [];
export const MOCK_STORIES: Story[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [];
export const MOCK_COLLAB_POSTS: CollabPost[] = [];

export const MOCK_INDUSTRY: IndustryProfile = null as any;

export const MARKETPLACE_CATEGORIES = [
    { slug: 'beats', label: 'Beats & Instrumentais', icon: '🥁', color: '#00FF66' },
    { slug: 'mixagem', label: 'Mixagem & Master', icon: '🎛️', color: '#0057FF' },
    { slug: 'composicao', label: 'Composição & Letras', icon: '📝', color: '#FFD400' },
    { slug: 'videoclipe', label: 'Videoclipes & Edição', icon: '🎬', color: '#FF0055' },
    { slug: 'design', label: 'Capa & Identidade', icon: '🎨', color: '#8B5CF6' },
    { slug: 'assessoria', label: 'Marketing & Assessoria', icon: '📈', color: '#059669' },
    { slug: 'outros', label: 'Outros Serviços', icon: '💼', color: '#64748B' },
];
export type MarketplaceCategory = 'beats' | 'mixagem' | 'composicao' | 'videoclipe' | 'design' | 'assessoria' | 'equipamentos' | 'SERVICE' | string;

export const COLLAB_TYPE_CONFIG: Record<string, { label: string; chip: string; color: string; icon: string }> = {
    BEATMAKER: { label: 'Beatmaker', chip: 'Beatmakers', color: '#00FF66', icon: '🥁' },
    PRODUCER: { label: 'Produtor', chip: 'Produtores', color: '#059669', icon: '🎛️' },
    MC: { label: 'MC', chip: 'MCs', color: '#FFD400', icon: '🎤' },
    SINGER: { label: 'Cantor(a)', chip: 'Cantores', color: '#FF0055', icon: '🎙️' },
    SONGWRITER: { label: 'Compositor', chip: 'Compositores', color: '#DB2777', icon: '✍️' },
    DJ: { label: 'DJ', chip: 'DJs', color: '#8257e5', icon: '💿' },
    INSTRUMENTALIST: { label: 'Instrumentista', chip: 'Instrumentistas', color: '#8B5CF6', icon: '🎸' },
    VIDEO_EDITOR: { label: 'Editor de vídeo', chip: 'Editores', color: '#FF0055', icon: '🎬' },
    VIDEOMAKER: { label: 'Videomaker', chip: 'Videomakers', color: '#0057FF', icon: '🎥' },
    DESIGNER: { label: 'Designer / capa', chip: 'Designers', color: '#ec4899', icon: '🎨' },
    FEAT: { label: 'Feat', chip: 'Feat', color: '#00FF66', icon: '🤝' },
    MIX_MASTER: { label: 'Mix & Master', chip: 'Mix & Master', color: '#D97706', icon: '🎧' },
    OTHER: { label: 'Outro', chip: 'Outros', color: '#64748B', icon: '💼' },
};

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
    shortlists: Record<string, string[]>;
    artistNotes: Record<string, string>;
    likedPosts: Set<string>;
    followings: string[];
    followingProfiles: ArtistProfile[];

    listings: Listing[];
    savedListings: string[];
    myListings: Listing[];

    collabPosts: CollabPost[];
    collabInterests: CollabInterest[];
    
    // Unified Chat
    chatThreads: ChatThread[];
    activeThread: ChatThread | null;

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

    updateArtistProfile: (data: Partial<ArtistProfile>) => Promise<void>;
    updateIndustryProfile: (data: Partial<IndustryProfile>) => Promise<void>;
    submitIndustryVerification: (data: Partial<IndustryProfile>) => Promise<void>;
    updateIndustryScouting: (data: Partial<IndustryProfile>) => Promise<void>;

    togglePostLike: (postId: string) => void;
    fetchFeed: (page?: number) => Promise<void>;
    fetchStories: () => Promise<void>;
    createPost: (data: { type: Post['type']; text?: string; hashtags?: string[]; file?: File; mediaUrl?: string; publishTarget?: PublishTarget; listingId?: string; collabId?: string }) => Promise<string>;
    createStory: (file: File) => Promise<void>;
    addPostComment: (postId: string, text: string) => void;

    // ── Post Lifecycle Actions ─────────────────────────
    editPost: (postId: string, data: Partial<Pick<Post, 'text' | 'hashtags' | 'type'>>) => void;
    archivePost: (postId: string) => void;
    deletePost: (postId: string) => void;
    pinPost: (postId: string) => void;
    unpinPost: (postId: string) => void;
    restorePost: (postId: string) => void;
    getProfilePosts: (artistId: string, type?: Post['type']) => Post[];
    getFeedPosts: () => Post[];

    toggleShortlist: (artistId: string) => void;
    isInShortlist: (artistId: string) => boolean;
    createShortlist: (name: string) => void;
    addArtistToShortlist: (listName: string, artistId: string) => void;
    removeArtistFromShortlist: (listName: string, artistId: string) => void;
    setArtistNote: (artistId: string, note: string) => void;

    createProposal: (data: any) => string;
    acceptProposal: (proposalId: string) => void;
    rejectProposal: (proposalId: string) => void;
    cancelProposal: (proposalId: string) => void;
    uploadContract: (proposalId: string, fileName: string) => void;

    fetchListings: (params?: object) => Promise<void>;
    createListing: (data: any) => Promise<boolean>;
    toggleSaveListing: (listingId: string) => void;
    isListingSaved: (listingId: string) => boolean;
    updateListingStatus: (listingId: string, status: ListingStatus) => void;

    fetchCollabPosts: (params?: object) => Promise<void>;
    fetchMyCollabs: () => Promise<void>;
    createCollabPost: (data: CreateCollabPostInput) => Promise<string>;
    expressInterest: (collabId: string, message: string) => Promise<void>;
    acceptInterest: (interestId: string) => void;
    rejectInterest: (interestId: string) => void;
    updateCollabStatus: (collabId: string, status: CollabPostStatus) => void;

    // Unified Chat Actions
    fetchChatThreads: () => Promise<void>;
    fetchThreadMessages: (threadId: string) => Promise<void>;
    sendChatMessage: (threadId: string, content: string, attachment?: { url: string, name: string }) => Promise<void>;
    sendMessage: (threadId: string, content: string) => Promise<void>;
    startMarketplaceInquiry: (listingId: string, message?: string) => Promise<string>;

    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    addNotification: (notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markNotificationAsRead: (id: string) => void;
    clearAllNotifications: () => void;

    fetchReceivedInterests: () => Promise<void>;
    updateInterestStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
    toggleFollow: (artistId: string) => Promise<void>;
    isFollowing: (artistId: string) => boolean;
    fetchFollowing: () => Promise<void>;
    fetchFollowingDetailed: () => Promise<void>;
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
            shortlists: { 'Interesse': [], 'Shortlist': [], 'Contratados': [] },
            artistNotes: {},
            likedPosts: new Set(),
            toasts: [],
            notifications: [],
            postComments: {},
            listings: MOCK_LISTINGS,
            savedListings: [],
            followings: [],
            followingProfiles: [],
            myListings: [],
            collabPosts: MOCK_COLLAB_POSTS,
            collabInterests: [],
            chatThreads: [],
            activeThread: null,

            loginAsArtist: async (email, password) => {
                const res: any = await api.auth.login({ email, password });
                const { user, accessToken, refreshToken, profile } = res.data;
                // Limpa perfis antigos para evitar misturar estados
                set({
                    currentUser: user,
                    artistProfile: profile,
                    industryProfile: null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });
                    await get().fetchFollowing();
                    get().addToast({ message: `Bem-vindo, ${res.data.user.stageName || 'Beetr'}!`, type: 'success' });
            },

            loginAsIndustry: async (email, password) => {
                const res: any = await api.auth.login({ email, password });
                const { user, accessToken, refreshToken, profile } = res.data;
                // Limpa perfis antigos para evitar misturar estados
                set({
                    currentUser: user,
                    industryProfile: profile,
                    artistProfile: null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });
                get().addToast({ message: `Bem-vindo, ${profile.companyName}!`, type: 'success' });
            },

            loginWithGoogle: async (idToken, role) => {
                const res: any = await api.auth.google({ idToken, role });
                const { user, accessToken, refreshToken, profile } = res.data;

                // Limpa perfis antigos para evitar misturar estados
                set({
                    currentUser: user,
                    artistProfile: user.role === 'ARTIST' ? profile : null,
                    industryProfile: user.role === 'INDUSTRY' ? profile : null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });

                const name = profile?.stageName || profile?.companyName || user.email;
                get().addToast({ message: `Bem-vindo, ${name}!`, type: 'success' });
            },

            registerArtist: async (data) => {
                const res: any = await api.auth.register({ ...data, role: 'ARTIST' });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({
                    currentUser: user,
                    artistProfile: profile,
                    industryProfile: null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });
                get().addToast({ message: 'Conta criada!', type: 'success' });
            },

            registerIndustry: async (data) => {
                const res: any = await api.auth.register({ ...data, role: 'INDUSTRY' });
                const { user, accessToken, refreshToken, profile } = res.data;
                set({
                    currentUser: user,
                    industryProfile: profile,
                    artistProfile: null,
                    isAuthenticated: true,
                    accessToken,
                    refreshToken
                });
                get().addToast({ message: 'Empresa registrada!', type: 'success' });
            },

            setCurrentUser: (user: User | null) => {
                set({ currentUser: user });
                if (user) {
                    get().fetchFollowing();
                }
            },
            logout: () => set({ currentUser: null, artistProfile: null, industryProfile: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
            setAccessToken: (token) => set({ accessToken: token }),

            updateArtistProfile: async (data: any) => {
                const res: any = await api.artists.updateMe(data);
                set((state) => ({
                    artistProfile: state.artistProfile ? { ...state.artistProfile, ...res.data } : null
                }));
                get().addToast({ message: 'Perfil atualizado!', type: 'success' });
            },

            updateIndustryProfile: async (data: any) => {
                await api.industry.updateMe(data);
                set((state) => ({
                    industryProfile: state.industryProfile ? { ...state.industryProfile, ...data } : null
                }));
                get().addToast({ message: 'Perfil da empresa atualizado!', type: 'success' });
            },

            submitIndustryVerification: async (data: any) => {
                await api.industry.updateMe({ ...data, verificationStatus: 'PENDING' });
                set((state) => ({
                    industryProfile: state.industryProfile ? { ...state.industryProfile, ...data, verificationStatus: 'PENDING' } : null
                }));
                get().addToast({ message: 'Documentos enviados para análise!', type: 'success' });
            },

            updateIndustryScouting: async (data: any) => {
                await api.industry.updateMe(data);
                set((state) => ({
                    industryProfile: state.industryProfile ? { ...state.industryProfile, ...data } : null
                }));
                get().addToast({ message: 'Preferências de scouting atualizadas!', type: 'success' });
            },

            fetchFeed: async (page = 1) => {
                const { accessToken } = get();
                if (accessToken === 'demo-token') return;
                try {
                    const res: any = await api.feed.getFeed(page);
                    const BOOST_MS = 48 * 60 * 60 * 1000;
                    const enriched: Post[] = (res.data || []).map((p: any) => {
                        const createdMs = new Date(p.createdAt).getTime();
                        const boostExpires = new Date(createdMs + BOOST_MS).toISOString();
                        const isBoosted = Date.now() < createdMs + BOOST_MS;
                        return {
                            ...p,
                            status: p.status || (isBoosted ? 'BOOSTED_48H' : 'PUBLISHED') as PostStatus,
                            publishTarget: p.publishTarget || 'FEED' as PublishTarget,
                            visibleInFeed: p.visibleInFeed ?? true,
                            visibleInProfile: p.visibleInProfile ?? true,
                            visibleInExplore: p.visibleInExplore ?? true,
                            boostExpiresAt: p.boostExpiresAt || boostExpires,
                        };
                    });
                    const sorted = enriched.sort((a, b) => {
                        const aFollowing = get().followings.includes(a.artistId);
                        const bFollowing = get().followings.includes(b.artistId);
                        if (aFollowing && !bFollowing) return -1;
                        if (!aFollowing && bFollowing) return 1;
                        return 0; // maintain original time-order otherwise
                    });

                    set({ posts: sorted });
                } catch (error: any) {
                    console.error('Failed to fetch feed:', error);
                }
            },

            fetchStories: async () => {
                const { accessToken } = get();
                if (accessToken === 'demo-token') return;
                try {
                    const res: any = await api.feed.getStories();
                    // Redundância: Expira stories baseando-se no timestamp expiresAt
                    const validStories = (res.data || []).filter((s: any) => new Date(s.expiresAt).getTime() > Date.now());
                    set({ stories: validStories });
                } catch (error: any) {
                    console.error('Failed to fetch stories:', error);
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

            createPost: async (data: any) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return '';
                const file = data.file;
                const publishTarget: PublishTarget = data.publishTarget || 'FEED';

                if (accessToken === 'demo-token') {
                    get().addToast({ message: 'Modo demo: Upload desativado para garantir persistência real.', type: 'info' });
                    return '';
                }

                try {
                    let mediaUrl = data.mediaUrl;
                    if (file) {
                        const res = await api.upload(file);
                        mediaUrl = res.url;
                    }
                    const res: any = await api.feed.createPost({ ...data, mediaUrl, artistId: artistProfile.id, listingId: data.listingId, collabId: data.collabId });

                    const BOOST_MS = 48 * 60 * 60 * 1000;
                    const now = new Date();
                    const enrichedPost: Post = {
                        ...res.data,
                        status: publishTarget === 'PROFILE_ONLY' ? 'PUBLISHED' : 'BOOSTED_48H',
                        publishTarget,
                        visibleInFeed: publishTarget !== 'PROFILE_ONLY' && publishTarget !== 'STORY',
                        visibleInProfile: true,
                        visibleInExplore: publishTarget !== 'PROFILE_ONLY',
                        boostExpiresAt: new Date(now.getTime() + BOOST_MS).toISOString(),
                    };

                    set((s) => ({ posts: [enrichedPost, ...s.posts] }));

                    // If target includes story, also create one. 
                    // Support creating from the newly uploaded mediaUrl if no file is present
                    if (publishTarget === 'STORY' || publishTarget === 'FEED_AND_STORY') {
                        try { 
                            await get().createStory(file || mediaUrl); 
                        } catch { /* story creation is best-effort */ }
                    }

                    get().addToast({ message: 'Post publicado! 🚀', type: 'success' });
                    return enrichedPost.id;
                } catch (error: any) {
                    console.error('API createPost failed:', error);
                    get().addToast({ message: 'Erro ao publicar post. Tente novamente.', type: 'error' });
                    return '';
                }
            },

            createStory: async (fileOrUrl) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return;

                if (accessToken === 'demo-token') {
                    get().addToast({ message: 'Modo demo: Upload desativado para garantir persistência real.', type: 'info' });
                    return;
                }

                try {
                    let mediaUrl = '';
                    let mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' = 'IMAGE';

                    if (typeof fileOrUrl === 'string') {
                        mediaUrl = fileOrUrl;
                        // Guess media type from URL extension if possible
                        if (mediaUrl.match(/\.(mp3|wav|ogg)$/i)) mediaType = 'AUDIO';
                        else if (mediaUrl.match(/\.(mp4|webm|mov)$/i)) mediaType = 'VIDEO';
                    } else if (fileOrUrl instanceof File) {
                        const uploadRes = await api.upload(fileOrUrl);
                        mediaUrl = uploadRes.url;
                        mediaType = fileOrUrl.type.startsWith('video') ? 'VIDEO' : fileOrUrl.type.startsWith('audio') ? 'AUDIO' : 'IMAGE';
                    } else {
                        return;
                    }

                    const res: any = await api.feed.createStory({
                        mediaUrl,
                        artistId: artistProfile.id,
                        mediaType
                    });
                    set((s) => ({ stories: [res.data, ...s.stories] }));
                    get().addToast({ message: 'Story publicado!', type: 'success' });
                } catch (error: any) {
                    console.error('API createStory failed:', error);
                    get().addToast({ message: 'Erro ao publicar story.', type: 'error' });
                }
            },

            // ── Post Lifecycle Actions ───────────────────────────────────
            editPost: (postId, data) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? { ...p, ...data } : p),
            })),

            archivePost: (postId) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? {
                    ...p,
                    status: 'ARCHIVED' as PostStatus,
                    visibleInFeed: false,
                    visibleInExplore: false,
                    visibleInProfile: true,
                    archivedAt: new Date().toISOString(),
                } : p),
            })),

            deletePost: (postId) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? {
                    ...p,
                    status: 'DELETED' as PostStatus,
                    visibleInFeed: false,
                    visibleInExplore: false,
                    visibleInProfile: false,
                } : p),
            })),

            pinPost: (postId) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? {
                    ...p,
                    status: 'PINNED' as PostStatus,
                    pinnedAt: new Date().toISOString(),
                    visibleInProfile: true,
                } : p),
            })),

            unpinPost: (postId) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? {
                    ...p,
                    status: (Date.now() < new Date(p.boostExpiresAt || 0).getTime() ? 'BOOSTED_48H' : 'PUBLISHED') as PostStatus,
                    pinnedAt: undefined,
                } : p),
            })),

            restorePost: (postId) => set((s) => ({
                posts: s.posts.map(p => p.id === postId ? {
                    ...p,
                    status: (Date.now() < new Date(p.boostExpiresAt || 0).getTime() ? 'BOOSTED_48H' : 'PUBLISHED') as PostStatus,
                    visibleInFeed: p.publishTarget !== 'PROFILE_ONLY',
                    visibleInProfile: true,
                    visibleInExplore: p.publishTarget !== 'PROFILE_ONLY',
                    archivedAt: undefined,
                } : p),
            })),

            getProfilePosts: (artistId, type) => {
                const posts = get().posts.filter(p =>
                    p.artistId === artistId &&
                    p.status !== 'DELETED' &&
                    p.visibleInProfile !== false
                );
                if (type) return posts.filter(p => p.type === type);
                return posts;
            },

            getFeedPosts: () => {
                const BOOST_MS = 48 * 60 * 60 * 1000;
                const now = Date.now();
                return get().posts
                    .filter(p => p.visibleInFeed && p.status !== 'DELETED' && p.status !== 'ARCHIVED')
                    .sort((a, b) => {
                        const aCreated = new Date(a.createdAt).getTime();
                        const bCreated = new Date(b.createdAt).getTime();
                        const aBoosted = now < aCreated + BOOST_MS ? 1 : 0;
                        const bBoosted = now < bCreated + BOOST_MS ? 1 : 0;
                        // Pinned first, then boosted, then by recency
                        if (a.status === 'PINNED' && b.status !== 'PINNED') return -1;
                        if (b.status === 'PINNED' && a.status !== 'PINNED') return 1;
                        if (aBoosted !== bBoosted) return bBoosted - aBoosted;
                        return bCreated - aCreated;
                    });
            },

            toggleShortlist: (artistId) => set((s) => ({ shortlist: s.shortlist.includes(artistId) ? s.shortlist.filter((id) => id !== artistId) : [...s.shortlist, artistId] })),
            isInShortlist: (artistId) => get().shortlist.includes(artistId),

            createShortlist: (name) => set((s) => ({ shortlists: { ...s.shortlists, [name]: [] } })),
            addArtistToShortlist: (listName, artistId) => set((s) => {
                const list = s.shortlists[listName] || [];
                if (list.includes(artistId)) return s;
                return { shortlists: { ...s.shortlists, [listName]: [...list, artistId] } };
            }),
            removeArtistFromShortlist: (listName, artistId) => set((s) => ({
                shortlists: { ...s.shortlists, [listName]: (s.shortlists[listName] || []).filter(id => id !== artistId) }
            })),
            setArtistNote: (artistId, note) => set((s) => ({
                artistNotes: { ...s.artistNotes, [artistId]: note }
            })),

            createProposal: (data) => {
                const id = `proposal-${Date.now()}`;
                const now = new Date().toISOString();
                const proposal: Proposal = { ...data, id, messages: [], contractVersions: [], createdAt: now, updatedAt: now };
                set((s) => ({ proposals: [...s.proposals, proposal] }));
                get().addToast({ message: 'Proposta enviada!', type: 'success' });
                return id;
            },

            sendMessage: async (threadId: string, content: string) => {
                await get().sendChatMessage(threadId, content);
            },

            acceptProposal: async (proposalId) => {
                try {
                    await api.proposals.accept(proposalId);
                    const proposal = get().proposals.find(p => p.id === proposalId);
                    set((s) => ({
                        proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'ACCEPTED' as any } : p)
                    }));
                    get().addToast({ message: 'Proposta aceita!', type: 'success' });
                    if (proposal) {
                        get().addNotification({
                            title: 'Proposta Aceita!',
                            message: `O artista ${(proposal as any).artistName || 'Artista'} aceitou sua proposta.`,
                            type: 'deal',
                            link: `/deals/${proposalId}`
                        });
                    }
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                }
            },

            rejectProposal: async (proposalId) => {
                try {
                    await api.proposals.reject(proposalId);
                    set((s) => ({
                        proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'REJECTED' as any } : p)
                    }));
                    get().addToast({ message: 'Proposta recusada.', type: 'info' });
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                }
            },

            cancelProposal: async (proposalId) => {
                try {
                    await api.proposals.cancel(proposalId);
                    set((s) => ({
                        proposals: s.proposals.map((p) => p.id === proposalId ? { ...p, status: 'CANCELLED' as any } : p)
                    }));
                    get().addToast({ message: 'Proposta cancelada.', type: 'info' });
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                }
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

            createListing: async (data: any) => {
                const { currentUser, accessToken } = get();
                if (!currentUser) return false;

                // Debug log for token issues reported by user
                if (!accessToken) {
                    console.error('[Marketplace] createListing blocked: accessToken is missing from state');
                    get().addToast({ message: 'Sessão inválida. Por favor, saia e entre novamente.', type: 'error' });
                    return false;
                }

                try {
                    const res: any = await api.marketplace.create({ 
                        ...data, 
                        sellerId: currentUser.id 
                    });
                    
                    if (res.success) {
                        set((s) => ({ 
                            listings: [res.data, ...s.listings] 
                        }));
                        
                        if (currentUser.role === 'ARTIST' && get().artistProfile) {
                            set(s => ({
                                artistProfile: s.artistProfile ? {
                                    ...s.artistProfile,
                                    scoreBeet: (s.artistProfile.scoreBeet || 0) + 5
                                } : null
                            }));
                        }

                        // Use the target selected by the user in the form
                        try {
                            await get().createPost({
                                type: 'MARKETPLACE' as any,
                                text: data.title,
                                listingId: res.data.id,
                                mediaUrl: data.images && data.images.length > 0 ? data.images[0] : undefined,
                                publishTarget: data.announcementTarget || 'FEED'
                            });
                        } catch (e) {
                            console.error('Failed to create marketplace post announcement:', e);
                        }

                        return true;
                    }
                    return false;
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                    return false;
                }
            },

            toggleSaveListing: (listingId) => {
                const { savedListings } = get();
                const isSaved = savedListings.includes(listingId);
                set({ savedListings: isSaved ? savedListings.filter((id) => id !== listingId) : [...savedListings, listingId] });
            },

            isListingSaved: (listingId) => get().savedListings.includes(listingId),

            startMarketplaceInquiry: async (listingId, message) => {
                try {
                    const res: any = await api.marketplace.inquiry(listingId, message || 'Tenho interesse neste anúncio');
                    if (res.success) {
                        get().addToast({ message: 'Iniciando conversa...', type: 'success' });
                        await get().fetchChatThreads();
                        return res.data.id;
                    }
                    return '';
                } catch (error: any) {
                    get().addToast({ message: error.message, type: 'error' });
                    return '';
                }
            },

            updateListingStatus: (listingId, status) => {
                set((s) => ({ listings: s.listings.map((l) => l.id === listingId ? { ...l, status } : l) }));
            },

            fetchCollabPosts: async (params) => {
                try {
                    const res: any = await api.collaborations.list(params);
                    set({ collabPosts: res.data });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            fetchMyCollabs: async () => {
                const { artistProfile } = get();
                if (!artistProfile) return;
                try {
                    const res: any = await api.collaborations.list({ authorId: artistProfile.id });
                    // Optionally set a separate state or just reuse collabPosts
                    set({ collabPosts: res.data });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            createCollabPost: async (data: CreateCollabPostInput) => {
                try {
                    const res: any = await api.collaborations.create(data);
                    set((s) => ({ collabPosts: [res.data, ...s.collabPosts] }));
                    
                    // Social Integration (Feed/Story)
                    try {
                        if (data.publishedInFeed || data.publishedInStory) {
                            await get().createPost({
                                type: 'COLLAB' as any,
                                text: data.title,
                                collabId: res.data.id,
                                mediaUrl: data.coverUrl,
                                publishTarget: data.publishedInStory && data.publishedInFeed ? 'FEED_AND_STORY' : data.publishedInStory ? 'STORY' : 'FEED'
                            });
                        }
                    } catch (e) {
                        console.error('Failed to create social announcement for collab:', e);
                    }

                    get().addToast({ message: 'Colaboração publicada! 🚀', type: 'success' });
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

            fetchReceivedInterests: async () => {
                try {
                    const res: any = await api.collaborations.getInterests();
                    set({ collabInterests: res.data });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            updateInterestStatus: async (id, status) => {
                try {
                    await api.collaborations.updateInterestStatus(id, status);
                    set((s) => ({
                        collabInterests: s.collabInterests.map((i) => i.id === id ? { ...i, status: status as any } : i)
                    }));
                    get().addToast({ message: `Status atualizado para ${status === 'ACCEPTED' ? 'Aceito' : 'Recusado'}`, type: 'success' });
                } catch (error: any) { get().addToast({ message: error.message, type: 'error' }); }
            },

            acceptInterest: (interestId) => {
                set((s) => ({ collabInterests: s.collabInterests.map((i) => i.id === interestId ? { ...i, status: 'ACCEPTED' as any } : i) }));
            },

            rejectInterest: (interestId) => {
                set((s) => ({ collabInterests: s.collabInterests.map((i) => i.id === interestId ? { ...i, status: 'REJECTED' as any } : i) }));
            },

            sendCollabMessage: async (threadId: string, text: string) => {
                await get().sendChatMessage(threadId, text);
            },

            updateCollabStatus: (id, status) => {
                set((s) => ({ collabPosts: s.collabPosts.map((p) => p.id === id ? { ...p, status } : p) }));
            },

            // ── Unified Chat Actions Implementation ─────────────────────
            fetchChatThreads: async () => {
                try {
                    const res: any = await api.chats.list();
                    set({ chatThreads: res.data });
                } catch (error: any) {
                    console.error('Failed to fetch chat threads:', error);
                }
            },

            fetchThreadMessages: async (threadId) => {
                try {
                    const res: any = await api.chats.get(threadId);
                    set((s) => ({
                        activeThread: res.data,
                        chatThreads: s.chatThreads.map(t => t.id === threadId ? res.data : t)
                    }));
                } catch (error: any) {
                    get().addToast({ message: 'Erro ao carregar mensagens', type: 'error' });
                }
            },

            sendChatMessage: async (threadId, content, attachment) => {
                try {
                    const res: any = await api.chats.sendMessage(threadId, { 
                        content, 
                        attachmentUrl: attachment?.url, 
                        attachmentName: attachment?.name 
                    });
                    
                    // Optimistic or just re-fetch thread messages
                    await get().fetchThreadMessages(threadId);
                } catch (error: any) {
                    get().addToast({ message: 'Erro ao enviar mensagem', type: 'error' });
                }
            },

            clearAllNotifications: () => set({ notifications: [] }),

            toggleFollow: async (artistId) => {
                const { followings, isAuthenticated } = get();
                if (!isAuthenticated) return;
                
                const isCurrentlyFollowing = followings.includes(artistId);
                try {
                    if (isCurrentlyFollowing) {
                        await api.artists.unfollow(artistId);
                        set({ followings: followings.filter(id => id !== artistId) });
                        get().addToast({ message: 'Você deixou de seguir o artista', type: 'info' });
                    } else {
                        await api.artists.follow(artistId);
                        set({ followings: [...followings, artistId] });
                        get().addToast({ message: 'Seguindo artista! 🚀', type: 'success' });
                    }
                } catch (error: any) {
                    get().addToast({ message: 'Erro ao processar seguimento', type: 'error' });
                    console.error('Follow error:', error);
                }
            },

            isFollowing: (artistId) => get().followings.includes(artistId),

            fetchFollowing: async () => {
                try {
                    const res = await api.artists.getFollowing();
                    if (res.success) {
                        set({ followings: res.data });
                    }
                } catch (error) {
                    console.error('Failed to fetch followings:', error);
                }
            },
            
            fetchFollowingDetailed: async () => {
                try {
                    const res: any = await api.artists.getFollowingDetailed();
                    if (res.success) {
                        set({ followingProfiles: res.data });
                    }
                } catch (error) {
                    console.error('Failed to fetch following detailed:', error);
                }
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
        }),
        {
            name: 'beatbr-store-v2',
            partialize: (s) => ({
                currentUser: s.currentUser,
                artistProfile: s.artistProfile,
                industryProfile: s.industryProfile,
                isAuthenticated: s.isAuthenticated,
                accessToken: s.accessToken,
                refreshToken: s.refreshToken,
                shortlist: s.shortlist,
                proposals: s.proposals,
                posts: s.posts,
                savedListings: s.savedListings,
                myListings: s.myListings,
                collabPosts: s.collabPosts,
                notifications: s.notifications,
                chatThreads: s.chatThreads,
                likedPosts: Array.from(s.likedPosts),
                followings: s.followings,
            }),
            merge: (persisted: any, current) => ({
                ...current,
                ...persisted,
                likedPosts: new Set(persisted.likedPosts || []),
            }),
        }
    )
);
