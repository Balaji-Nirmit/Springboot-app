import { Note } from '@/types';
import { authService } from './auth';
import { config } from './config';

const API_BASE_URL = config.apiBaseUrl;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshToken = authService.getRefreshToken();
    if (refreshToken) {
      try {
        const tokens = await authService.refreshToken(refreshToken);
        authService.saveTokens(tokens);
        
        // Retry original request
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        authService.clearTokens();
        window.location.href = '/login';
        throw error;
      }
    }
  }

  return response;
}

export const notesApi = {
  async getNotes(ownerId?: string): Promise<Note[]> {
    const url = ownerId 
      ? `${API_BASE_URL}/notes?ownerId=${ownerId}`
      : `${API_BASE_URL}/notes`;
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    
    return response.json();
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    const response = await fetchWithAuth(`${API_BASE_URL}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    return response.json();
  },

  async deleteNote(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  },
};