import { useStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
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

        // Token expired — try refresh
        if (res.status === 401) {
            const { refreshToken, setAccessToken, logout } = useStore.getState();
            if (refreshToken) {
                const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    setAccessToken(data.data.accessToken);
                    // Retry original request with new token
                    const retryRes = await fetch(`${API_BASE}${path}`, {
                        ...options,
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${data.data.accessToken}`,
                        },
                    });
                    if (!retryRes.ok) {
                        const err = await retryRes.json();
                        throw new Error(err.error?.message || 'Erro desconhecido');
                    }
                    return retryRes.json();
                } else {
                    logout();
                    window.location.href = '/auth';
                    throw new Error('Sessão expirada');
                }
            }
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

        const { accessToken } = useStore.getState();
        const headers: HeadersInit = {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        };

        const res = await fetch(`${API_BASE}/uploads`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Erro no upload');
        }

        const json = await res.json();
        return json.data;
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
        getPublic: (id: string) => this.get(`/artists/${id}`),
        getPrivate: (id: string) => this.get(`/artists/${id}/private`),
        updateMe: (data: object) => this.patch('/artists/me', data),
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
    };

    // ── Collaborations ──────────────────────────────────────────
    collaborations = {
        list: () => this.get('/collaborations'),
        create: (data: object) => this.post('/collaborations', data),
        expressInterest: (collabId: string, data: { message: string }) => this.post(`/collaborations/${collabId}/interest`, data),
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
