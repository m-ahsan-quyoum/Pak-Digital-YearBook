import { User, Post, Comment, University, Message, UniEvent, Notification, Report, Announcement, AppStats, AlumniUpdate } from '../types';

const API_BASE = '/api';

// Simple client auth token storage
let authToken = localStorage.getItem('pakyearbook_token') || '';

export const getAuthToken = () => authToken;

export const setAuthToken = (token: string) => {
  authToken = token;
  if (token) {
    localStorage.setItem('pakyearbook_token', token);
  } else {
    localStorage.removeItem('pakyearbook_token');
  }
};

// Generates headers dynamically with authorization
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// API handler helper
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    register: async (data: Partial<User>): Promise<{ user: User; token: string }> => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ user: User; token: string }>(res);
      setAuthToken(result.token);
      return result;
    },
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const result = await handleResponse<{ user: User; token: string }>(res);
      setAuthToken(result.token);
      return result;
    },
    logout: () => {
      setAuthToken('');
    },
    getMe: async (): Promise<{ user: User }> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse<{ user: User }>(res);
    },
    updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ user: User }>(res);
    },
    followUser: async (userId: string): Promise<{ following: boolean }> => {
      const res = await fetch(`${API_BASE}/auth/follow`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
      });
      return handleResponse<{ following: boolean }>(res);
    },
    getUsers: async (): Promise<User[]> => {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getHeaders(),
      });
      return handleResponse<User[]>(res);
    }
  },

  posts: {
    list: async (filters?: { query?: string; category?: string; university?: string; department?: string; isFeatured?: boolean }): Promise<Post[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            params.append(key, String(val));
          }
        });
      }
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/posts${queryStr}`, {
        headers: getHeaders(),
      });
      return handleResponse<Post[]>(res);
    },
    get: async (id: string): Promise<Post> => {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse<Post>(res);
    },
    create: async (data: Partial<Post>): Promise<Post> => {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Post>(res);
    },
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
    toggleLike: async (id: string): Promise<{ isLiked: boolean; likedCount: number }> => {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<{ isLiked: boolean; likedCount: number }>(res);
    },
    toggleSave: async (id: string): Promise<{ isSaved: boolean }> => {
      const res = await fetch(`${API_BASE}/posts/${id}/save`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<{ isSaved: boolean }>(res);
    },
    featurePost: async (id: string, isFeatured: boolean): Promise<Post> => {
      const res = await fetch(`${API_BASE}/posts/${id}/feature`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isFeatured }),
      });
      return handleResponse<Post>(res);
    }
  },

  comments: {
    list: async (postId: string): Promise<Comment[]> => {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        headers: getHeaders(),
      });
      return handleResponse<Comment[]>(res);
    },
    create: async (postId: string, content: string): Promise<Comment> => {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<Comment>(res);
    }
  },

  suggestions: {
    get: async (query: string): Promise<{ students: any[]; universities: any[]; events: any[]; posts: any[] }> => {
      const res = await fetch(`${API_BASE}/search/suggestions?query=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      });
      return handleResponse<{ students: any[]; universities: any[]; events: any[]; posts: any[] }>(res);
    }
  },

  universities: {
    list: async (): Promise<University[]> => {
      const res = await fetch(`${API_BASE}/universities`, {
        headers: getHeaders(),
      });
      return handleResponse<University[]>(res);
    },
    create: async (data: Partial<University>): Promise<University> => {
      const res = await fetch(`${API_BASE}/universities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<University>(res);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/universities/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    }
  },

  communities: {
    getFolder: async (universityName: string): Promise<{ students: User[]; posts: Post[]; events: UniEvent[] }> => {
      const res = await fetch(`${API_BASE}/communities/${encodeURIComponent(universityName)}`, {
        headers: getHeaders(),
      });
      return handleResponse<{ students: User[]; posts: Post[]; events: UniEvent[] }>(res);
    }
  },

  messages: {
    getChat: async (userId: string): Promise<Message[]> => {
      const res = await fetch(`${API_BASE}/messages/${userId}`, {
        headers: getHeaders(),
      });
      return handleResponse<Message[]>(res);
    },
    send: async (receiverId: string, content: string): Promise<Message> => {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiverId, content }),
      });
      return handleResponse<Message>(res);
    }
  },

  events: {
    list: async (): Promise<UniEvent[]> => {
      const res = await fetch(`${API_BASE}/events`, {
        headers: getHeaders(),
      });
      return handleResponse<UniEvent[]>(res);
    },
    create: async (data: Partial<UniEvent>): Promise<UniEvent> => {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<UniEvent>(res);
    },
    rsvp: async (id: string): Promise<{ rsvped: boolean; count: number }> => {
      const res = await fetch(`${API_BASE}/events/${id}/rsvp`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<{ rsvped: boolean; count: number }>(res);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    }
  },

  notifications: {
    list: async (): Promise<Notification[]> => {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getHeaders(),
      });
      return handleResponse<Notification[]>(res);
    },
    markRead: async (): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/notifications/read`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    }
  },

  reports: {
    list: async (): Promise<Report[]> => {
      const res = await fetch(`${API_BASE}/reports`, {
        headers: getHeaders(),
      });
      return handleResponse<Report[]>(res);
    },
    create: async (itemType: 'post' | 'comment' | 'user', itemId: string, content: string): Promise<Report> => {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ itemType, itemId, content }),
      });
      return handleResponse<Report>(res);
    },
    resolve: async (id: string): Promise<Report> => {
      const res = await fetch(`${API_BASE}/reports/${id}/resolve`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse<Report>(res);
    }
  },

  announcements: {
    list: async (): Promise<Announcement[]> => {
      const res = await fetch(`${API_BASE}/announcements`, {
        headers: getHeaders(),
      });
      return handleResponse<Announcement[]>(res);
    },
    create: async (title: string, content: string, university?: string): Promise<Announcement> => {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, content, university }),
      });
      return handleResponse<Announcement>(res);
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    }
  },

  alumni: {
    listUpdates: async (): Promise<AlumniUpdate[]> => {
      const res = await fetch(`${API_BASE}/alumni/updates`, {
        headers: getHeaders(),
      });
      return handleResponse<AlumniUpdate[]>(res);
    },
    createUpdate: async (data: Partial<AlumniUpdate>): Promise<AlumniUpdate> => {
      const res = await fetch(`${API_BASE}/alumni/updates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<AlumniUpdate>(res);
    },
    deleteUpdate: async (id: string): Promise<{ success: boolean }> => {
      const res = await fetch(`${API_BASE}/alumni/updates/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse<{ success: boolean }>(res);
    }
  },

  stats: {
    get: async (): Promise<AppStats> => {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: getHeaders(),
      });
      return handleResponse<AppStats>(res);
    }
  }
};
