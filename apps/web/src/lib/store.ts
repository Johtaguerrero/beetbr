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
    PostStatus,
    PublishTarget,
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
];
export type MarketplaceCategory = 'beats' | 'mixagem' | 'composicao' | 'videoclipe' | 'design' | 'assessoria' | 'equipamentos' | 'SERVICE' | string;

export const COLLAB_TYPE_CONFIG: Record<string, { label: string; chip: string; color: string; icon: string }> = {
    PRODUCER: { label: 'Produtor', chip: 'Produtores', color: '#059669', icon: '🎛️' },
    FEAT: { label: 'Feat', chip: 'Feat', color: '#00FF66', icon: '🤝' },
    MIX_MASTER: { label: 'Mix & Master', chip: 'Mix & Master', color: '#D97706', icon: '🎧' },
    MUSICIAN: { label: 'Músico', chip: 'Músicos', color: '#8B5CF6', icon: '🎸' },
    SONGWRITER: { label: 'Compositor', chip: 'Compositores', color: '#DB2777', icon: '✍️' },
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

    updateArtistProfile: (data: Partial<ArtistProfile>) => Promise<void>;
    updateIndustryProfile: (data: Partial<IndustryProfile>) => Promise<void>;
    submitIndustryVerification: (data: Partial<IndustryProfile>) => Promise<void>;
    updateIndustryScouting: (data: Partial<IndustryProfile>) => Promise<void>;

    togglePostLike: (postId: string) => void;
    fetchFeed: (page?: number) => Promise<void>;
    fetchStories: () => Promise<void>;
    createPost: (data: { type: Post['type']; text?: string; hashtags?: string[]; file?: File; publishTarget?: PublishTarget }) => Promise<string>;
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

    toggleFollow: (userId: string) => Promise<void>;
    isFollowing: (userId: string) => boolean;
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
            marketplaceChats: [],
            followings: [],
            myListings: [],
            collabPosts: MOCK_COLLAB_POSTS,
            collabInterests: [],
            collabThreads: [],

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
                get().addToast({ message: `Bem-vindo, ${profile.stageName}!`, type: 'success' });
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
                    set({ posts: enriched });
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

            createPost: async (data) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return '';
                const file = data.file;
                const publishTarget: PublishTarget = data.publishTarget || 'FEED';

                if (accessToken === 'demo-token') {
                    get().addToast({ message: 'Modo demo: Upload desativado para garantir persistência real.', type: 'info' });
                    return '';
                }

                try {
                    let mediaUrl = undefined;
                    if (file) {
                        const res = await api.upload(file);
                        mediaUrl = res.url;
                    }
                    const res: any = await api.feed.createPost({ ...data, mediaUrl, artistId: artistProfile.id });

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

                    // If target includes story, also create one
                    if ((publishTarget === 'STORY' || publishTarget === 'FEED_AND_STORY') && file) {
                        try { await get().createStory(file); } catch { /* story creation is best-effort */ }
                    }

                    get().addToast({ message: 'Post publicado! 🚀', type: 'success' });
                    return enrichedPost.id;
                } catch (error: any) {
                    console.error('API createPost failed:', error);
                    get().addToast({ message: 'Erro ao publicar post. Tente novamente.', type: 'error' });
                    return '';
                }
            },

            createStory: async (file) => {
                const { artistProfile, accessToken } = get();
                if (!artistProfile) return;

                if (accessToken === 'demo-token') {
                    get().addToast({ message: 'Modo demo: Upload desativado para garantir persistência real.', type: 'info' });
                    return;
                }

                try {
                    const uploadRes = await api.upload(file);
                    const res: any = await api.feed.createStory({
                        mediaUrl: uploadRes.url,
                        artistId: artistProfile.id,
                        mediaType: file.type.startsWith('video') ? 'VIDEO' : file.type.startsWith('audio') ? 'AUDIO' : 'IMAGE'
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

            clearAllNotifications: () => set({ notifications: [] }),

            toggleFollow: async (userId) => {
                const { followings } = get();
                const following = followings.includes(userId);
                try {
                    if (following) {
                        await api.social.unfollow(userId);
                        set({ followings: followings.filter(id => id !== userId) });
                    } else {
                        await api.social.follow(userId);
                        set({ followings: [...followings, userId] });
                    }
                } catch (error: any) {
                    // Silently fail or toast if critical
                    console.error('Follow error:', error);
                }
            },

            isFollowing: (userId) => get().followings.includes(userId),

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
