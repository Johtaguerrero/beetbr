import { useStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {

    private async handleUnauthorized<T>(
        callback: (token: string) => Promise<T>,
        logoutOnFailure = true
    ): Promise<T> {
        const { refreshToken, setAccessToken, logout } = useStore.getState();
        if (refreshToken) {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newToken = data.data.accessToken;
                setAccessToken(newToken);
                return callback(newToken);
            }
        }

        if (logoutOnFailure) {
            logout();
            window.location.href = '/auth';
        }
        throw new Error('Sessão expirada');
    }

    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const { accessToken } = useStore.getState();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...options.headers,
        };

        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        if (res.status === 401) {
            return this.handleUnauthorized((newToken) => 
                fetch(`${API_BASE}${path}`, {
                    ...options,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` },
                }).then(r => r.json())
            );
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `Erro ${res.status}`);
        }

        return res.json();
    }

    async upload(file: File): Promise<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const executeUpload = async (token?: string | null) => {
            const headers: HeadersInit = {
                ...(token && { Authorization: `Bearer ${token}` }),
            };
            const res = await fetch(`${API_BASE}/uploads`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (res.status === 401) {
                return this.handleUnauthorized(async (newToken) => {
                    const retryRes = await fetch(`${API_BASE}/uploads`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${newToken}` },
                        body: formData,
                    });
                    if (!retryRes.ok) throw new Error('Falha no retry do upload');
                    const json = await retryRes.json();
                    return json.data;
                });
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || 'Erro no upload');
            }

            const json = await res.json();
            return json.data;
        };

        const { accessToken } = useStore.getState();
        return executeUpload(accessToken);
    }

    get = <T>(path: string) => this.request<T>(path, { method: 'GET' });

    post = <T>(path: string, body?: unknown) =>
        this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

    patch = <T>(path: string, body?: unknown) =>
        this.request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

    delete = <T>(path: string) => this.request<T>(path, { method: 'DELETE' });

    // ── Auth ────────────────────────────────────────────────────
    auth = {
        login: (data: { email: string; password: string }) => this.post('/auth/login', data),
        register: (data: object) => this.post('/auth/register', data),
        google: (data: { idToken: string; role?: string }) => this.post('/auth/google', data),
        logout: (refreshToken: string) => this.post('/auth/logout', { refreshToken }),
    };

    // ── Feed ────────────────────────────────────────────────────
    feed = {
        getFeed: (page = 1) => this.get(`/feed?page=${page}`),
        createPost: (data: object) => this.post('/feed/posts', data),
        getStories: () => this.get('/feed/stories'),
        createStory: (data: object) => this.post('/feed/stories', data),
    };

    // ── Artists ─────────────────────────────────────────────────
    artists = {
        getPublic: (id: string) => this.get<{ data: any }>(`/artists/${id}`),
        getPrivate: (id: string) => this.get<{ data: any }>(`/artists/${id}/private`),
        updateMe: (data: object) => this.patch<{ data: any }>('/artists/me', data),
        follow: (id: string) => this.post<{ success: boolean }>(`/artists/${id}/follow`),
        unfollow: (id: string) => this.post<{ success: boolean }>(`/artists/${id}/unfollow`),
        getFollowing: () => this.get<{ success: boolean; data: string[] }>('/artists/following'),
        getFollowingDetailed: () => this.get<{ success: boolean; data: any[] }>('/artists/following/detailed'),
    };

    // ── Industry ────────────────────────────────────────────────
    industry = {
        updateMe: (data: object) => this.patch('/industry/me', data),
    };

    // ── Discover & Rankings ──────────────────────────────────────
    discover = {
        search: (params: Record<string, string | number | boolean>) =>
            this.get(`/discover?${new URLSearchParams(params as any).toString()}`),
        getRankings: (params?: Record<string, string>) =>
            this.get(`/rankings${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    };

    // ── Proposals ───────────────────────────────────────────────
    proposals = {
        list: () => this.get('/proposals'),
        get: (id: string) => this.get(`/proposals/${id}`),
        create: (data: object) => this.post('/proposals', data),
        accept: (id: string) => this.post(`/proposals/${id}/accept`),
        reject: (id: string) => this.post(`/proposals/${id}/reject`),
        cancel: (id: string) => this.post(`/proposals/${id}/cancel`),
    };

    // ── Shortlist ───────────────────────────────────────────────
    shortlist = {
        get: () => this.get('/shortlist'),
        add: (artistId: string) => this.post(`/shortlist/${artistId}`),
        remove: (artistId: string) => this.delete(`/shortlist/${artistId}`),
    };



    // ── Contracts ───────────────────────────────────────────────
    contracts = {
        get: (proposalId: string) => this.get(`/contracts/${proposalId}`),
        uploadVersion: (proposalId: string, data: { fileUrl: string; fileName: string }) =>
            this.post(`/contracts/${proposalId}/upload`, data),
    };

    // ── Settings ────────────────────────────────────────────────
    settings = {
        get: () => this.get('/settings'),
        updateAccount: (data: object) => this.patch('/settings/account', data),
        deleteAccount: () => this.delete('/settings/account'),
    };

    // ── Marketplace ─────────────────────────────────────────────
    marketplace = {
        list: (params?: object) => this.get(`/marketplace${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
        get: (id: string) => this.get(`/marketplace/${id}`),
        create: (data: object) => this.post('/marketplace', data),
        inquiry: (id: string, message: string) => this.post(`/marketplace/${id}/inquiry`, { message }),
    };

    // ── Collaborations ──────────────────────────────────────────
    collaborations = {
        list: (params?: object) => this.get(`/collaborations${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
        get: (id: string) => this.get(`/collaborations/${id}`),
        create: (data: object) => this.post('/collaborations', data),
        expressInterest: (collabId: string, data: { message: string }) => this.post(`/collaborations/${collabId}/interest`, data),
        getInterests: () => this.get('/collaborations/interests'),
        updateInterestStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') => this.patch(`/collaborations/interests/${id}`, { status }),
    };
    
    // ── Chats ───────────────────────────────────────────────────
    chats = {
        list: () => this.get('/chats'),
        get: (id: string) => this.get(`/chats/${id}`),
        sendMessage: (id: string, data: { content: string; attachmentUrl?: string; attachmentName?: string }) => 
            this.post(`/chats/${id}/messages`, data),
        markAsRead: (id: string) => this.patch(`/chats/${id}/read`, {}),
    };
    getMediaUrl(path: string | null | undefined): string | undefined {
        if (!path) return undefined;
        if (path.startsWith('http') || path.startsWith('blob:')) return path;

        // Limpa o path para evitar barras duplas e redundâncias
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Se já começa com /api/uploads ou uploads/, padroniza para /api/uploads/
        if (cleanPath.startsWith('/api/uploads/')) {
            return cleanPath;
        }

        if (cleanPath.startsWith('/uploads/')) {
            return `/api${cleanPath}`;
        }

        // Fallback genérico: se for apenas o nome do arquivo, assume que está em uploads
        return `/api/uploads/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
    }
}

export const api = new ApiClient();
