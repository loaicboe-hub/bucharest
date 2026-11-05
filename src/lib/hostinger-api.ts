/**
 * BucharestEgyAgro - Hostinger Native API Client
 * Connects directly to the Hostinger PHP + MySQL backend.
 * Provides offline fallback to localStorage when running in local dev without PHP.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'hostinger_admin_token';
const USER_KEY = 'hostinger_admin_user';

export type HostingerUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

// -----------------------------------------------------------------------------
// Token & Session Helpers
// -----------------------------------------------------------------------------
export function getSavedToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, user: HostingerUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSavedUser(): HostingerUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Universal Request Helper
// -----------------------------------------------------------------------------
async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSavedToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Admin-Token', token);
  }

  const url = `${API_BASE}/${endpoint.replace(/^\//, '')}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

// -----------------------------------------------------------------------------
// 1. Auth API
// -----------------------------------------------------------------------------
export const apiAuth = {
  async login(email: string, password: string) {
    const data = await request<{ success: boolean; token: string; user: HostingerUser }>('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveSession(data.token, data.user);
    return data.user;
  },

  async me() {
    return request<{ success: boolean; user: HostingerUser }>('auth.php?action=me');
  },

  logout() {
    clearSession();
  },

  async listUsers() {
    const data = await request<{ success: boolean; users: HostingerUser[] }>('auth.php?action=users');
    return data.users;
  },

  async createUser(input: { email: string; password: string; fullName: string; superAdmin?: boolean }) {
    return request<{ success: boolean; id: string }>('auth.php?action=create-user', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async deleteUser(userId: string) {
    return request<{ success: boolean }>(`auth.php?action=delete-user&id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  },

  async setPassword(userId: string, password: string) {
    return request<{ success: boolean }>('auth.php?action=set-password', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });
  },

  async setRole(userId: string, value: boolean) {
    return request<{ success: boolean }>('auth.php?action=set-role', {
      method: 'POST',
      body: JSON.stringify({ userId, value }),
    });
  },

  async getPermissions(userId: string) {
    const data = await request<{ success: boolean; permissions: any[] }>(`auth.php?action=permissions&userId=${encodeURIComponent(userId)}`);
    return data.permissions;
  },

  async savePermissions(userId: string, permissions: any[]) {
    return request<{ success: boolean }>('auth.php?action=save-permissions', {
      method: 'POST',
      body: JSON.stringify({ userId, permissions }),
    });
  },
};

// -----------------------------------------------------------------------------
// 2. Products API
// -----------------------------------------------------------------------------
export const apiProducts = {
  async list(params?: { trade?: string; all?: boolean }) {
    const qs = new URLSearchParams();
    if (params?.trade) qs.set('trade', params.trade);
    if (params?.all) qs.set('all', '1');
    const data = await request<{ success: boolean; products: any[] }>(`products.php?${qs.toString()}`);
    return data.products;
  },

  async get(idOrSlug: string) {
    const data = await request<{ success: boolean; product: any }>(`products.php?slug=${encodeURIComponent(idOrSlug)}`);
    return data.product;
  },

  async save(product: any) {
    const method = product.id ? 'PUT' : 'POST';
    return request<{ success: boolean; id?: string }>('products.php', {
      method,
      body: JSON.stringify(product),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`products.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 3. Categories API
// -----------------------------------------------------------------------------
export const apiCategories = {
  async list(onlyActive = false) {
    const qs = onlyActive ? '?onlyActive=true' : '';
    const data = await request<{ success: boolean; categories: any[] }>(`categories.php${qs}`);
    return data.categories;
  },

  async save(category: any) {
    return request<{ success: boolean; id: string }>('categories.php', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`categories.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 4. News API
// -----------------------------------------------------------------------------
export const apiNews = {
  async list(all = false) {
    const qs = all ? '?all=1' : '';
    const data = await request<{ success: boolean; articles: any[] }>(`news.php${qs}`);
    return data.articles;
  },

  async get(slug: string) {
    const data = await request<{ success: boolean; article: any }>(`news.php?slug=${encodeURIComponent(slug)}`);
    return data.article;
  },

  async save(article: any) {
    const method = article.id ? 'PUT' : 'POST';
    return request<{ success: boolean; id?: string }>('news.php', {
      method,
      body: JSON.stringify(article),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`news.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 5. Partners API
// -----------------------------------------------------------------------------
export const apiPartners = {
  async list(all = false) {
    const qs = all ? '?all=1' : '';
    const data = await request<{ success: boolean; partners: any[] }>(`partners.php${qs}`);
    return data.partners;
  },

  async save(partner: any) {
    return request<{ success: boolean; id: string }>('partners.php', {
      method: 'POST',
      body: JSON.stringify(partner),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`partners.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 6. Site Settings API
// -----------------------------------------------------------------------------
export const apiSettings = {
  async get() {
    try {
      const data = await request<{ success: boolean; settings?: any; data?: any }>('settings.php');
      return data.settings || data.data || null;
    } catch {
      return null;
    }
  },

  async save(settings: any) {
    return request<{ success: boolean }>('settings.php', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
};

// -----------------------------------------------------------------------------
// 7. Quotes & Contacts API
// -----------------------------------------------------------------------------
export const apiQuotes = {
  async submit(quote: any) {
    return request<{ success: boolean; id: string }>('quotes.php', {
      method: 'POST',
      body: JSON.stringify(quote),
    });
  },

  async list() {
    const data = await request<{ success: boolean; quotes: any[] }>('quotes.php');
    return data.quotes;
  },

  async updateStatus(id: string, status: string) {
    return request<{ success: boolean }>('quotes.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`quotes.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export const apiContacts = {
  async submit(contact: any) {
    return request<{ success: boolean; id: string }>('contacts.php', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  },

  async list() {
    const data = await request<{ success: boolean; contacts: any[] }>('contacts.php');
    return data.contacts;
  },

  async updateStatus(id: string, status: string) {
    return request<{ success: boolean }>('contacts.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`contacts.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 8. Invoices API
// -----------------------------------------------------------------------------
export const apiInvoices = {
  async list() {
    const data = await request<{ success: boolean; invoices: any[] }>('invoices.php');
    return data.invoices;
  },

  async get(id: string) {
    const data = await request<{ success: boolean; invoice: any }>(`invoices.php?id=${encodeURIComponent(id)}`);
    return data.invoice;
  },

  async save(invoice: any) {
    return request<{ success: boolean; id: string }>('invoices.php', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean }>(`invoices.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// -----------------------------------------------------------------------------
// 9. File & Image Upload API (Saves directly to Hostinger /uploads/)
// -----------------------------------------------------------------------------
export async function uploadToHostinger(
  file: File,
  folder: 'branding' | 'hero' | 'about' | 'partners' | 'products' | 'news' | 'sections' | 'general' = 'general',
  fixedName?: string
): Promise<{ url: string; path: string }> {
  const token = getSavedToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (fixedName) formData.append('fixed_name', fixedName);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Admin-Token'] = token;
  }

  const res = await fetch(`${API_BASE}/upload.php`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Upload to Hostinger failed');
  }

  return { url: data.url, path: data.path };
}
