import axios, { AxiosInstance } from 'axios';
import type {
  User,
  WeaponConfig,
  KnifeConfig,
  GloveConfig,
  AgentConfig,
  MusicConfig,
  PinConfig,
  WeaponSkin,
  Glove,
  Agent,
  MusicKit,
  Pin,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authentication API
 */
export const authApi = {
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/auth/user');
      return response.data.user || null;
    } catch (error) {
      return null;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Get Steam login URL
  getSteamLoginUrl: (): string => {
    return `${API_BASE_URL}/auth/steam`;
  },
};

/**
 * Weapons API
 */
export const weaponsApi = {
  // Get all weapons
  getAll: async (): Promise<WeaponConfig[]> => {
    const response = await apiClient.get('/player/weapons');
    return response.data.weapons;
  },

  // Update weapon configuration
  update: async (team: number, defindex: number, config: Partial<WeaponConfig>): Promise<WeaponConfig> => {
    const response = await apiClient.put(`/player/weapons/${team}/${defindex}`, config);
    return response.data.weapon;
  },

  // Delete weapon configuration
  delete: async (team: number, defindex: number): Promise<void> => {
    await apiClient.delete(`/player/weapons/${team}/${defindex}`);
  },
};

/**
 * Knife API
 */
export const knifeApi = {
  // Get knife for team
  get: async (team: number): Promise<KnifeConfig | null> => {
    const response = await apiClient.get(`/player/knife/${team}`);
    return response.data.knife;
  },

  // Update knife
  update: async (team: number, knife: string): Promise<KnifeConfig> => {
    const response = await apiClient.put(`/player/knife/${team}`, { knife });
    return response.data.knife;
  },

  // Delete knife
  delete: async (team: number): Promise<void> => {
    await apiClient.delete(`/player/knife/${team}`);
  },
};

/**
 * Gloves API
 */
export const glovesApi = {
  // Get gloves for team
  get: async (team: number): Promise<GloveConfig | null> => {
    const response = await apiClient.get(`/player/gloves/${team}`);
    return response.data.gloves;
  },

  // Update gloves
  update: async (team: number, defindex: number): Promise<GloveConfig> => {
    const response = await apiClient.put(`/player/gloves/${team}`, { defindex });
    return response.data.gloves;
  },

  // Delete gloves
  delete: async (team: number): Promise<void> => {
    await apiClient.delete(`/player/gloves/${team}`);
  },
};

/**
 * Agents API
 */
export const agentsApi = {
  // Get agents
  get: async (): Promise<AgentConfig> => {
    const response = await apiClient.get('/player/agents');
    return response.data.agents;
  },

  // Update agent for team
  update: async (team: number, agent: string): Promise<void> => {
    await apiClient.put(`/player/agents/${team}`, { agent });
  },

  // Delete agent for team
  delete: async (team: number): Promise<void> => {
    await apiClient.delete(`/player/agents/${team}`);
  },
};

/**
 * Music API
 */
export const musicApi = {
  // Get music for team
  get: async (team: number): Promise<MusicConfig | null> => {
    const response = await apiClient.get(`/player/music/${team}`);
    return response.data.music;
  },

  // Update music
  update: async (team: number, musicId: number): Promise<MusicConfig> => {
    const response = await apiClient.put(`/player/music/${team}`, { musicId });
    return response.data.music;
  },

  // Delete music
  delete: async (team: number): Promise<void> => {
    await apiClient.delete(`/player/music/${team}`);
  },
};

/**
 * Pins API
 */
export const pinsApi = {
  // Get pin for team
  get: async (team: number): Promise<PinConfig | null> => {
    const response = await apiClient.get(`/player/pins/${team}`);
    return response.data.pin;
  },

  // Update pin
  update: async (team: number, pinId: number): Promise<PinConfig> => {
    const response = await apiClient.put(`/player/pins/${team}`, { pinId });
    return response.data.pin;
  },

  // Delete pin
  delete: async (team: number): Promise<void> => {
    await apiClient.delete(`/player/pins/${team}`);
  },
};

/**
 * Items API (read-only data)
 */
export const itemsApi = {
  // Get all weapon skins
  getSkins: async (): Promise<WeaponSkin[]> => {
    const response = await apiClient.get('/items/skins');
    return Array.isArray(response.data.skins) ? response.data.skins : [];
  },

  // Get all gloves
  getGloves: async (): Promise<Glove[]> => {
    const response = await apiClient.get('/items/gloves');
    return Array.isArray(response.data.gloves) ? response.data.gloves : [];
  },

  // Get all agents
  getAgents: async (): Promise<Agent[]> => {
    const response = await apiClient.get('/items/agents');
    return Array.isArray(response.data.agents) ? response.data.agents : [];
  },

  // Get all music kits
  getMusic: async (): Promise<MusicKit[]> => {
    const response = await apiClient.get('/items/music');
    return Array.isArray(response.data.music) ? response.data.music : [];
  },

  // Get all pins
  getPins: async (): Promise<Pin[]> => {
    const response = await apiClient.get('/items/pins');
    return Array.isArray(response.data.pins) ? response.data.pins : [];
  },
};

/**
 * Bulk Operations API
 */
export const bulkApi = {
  // Copy team configuration
  copyTeam: async (sourceTeam: number, targetTeam: number, categories: string[]): Promise<void> => {
    await apiClient.post('/player/copy-team', {
      sourceTeam,
      targetTeam,
      categories,
    });
  },

  // Reset configuration
  reset: async (categories: string[], team?: number): Promise<void> => {
    await apiClient.post('/player/reset', {
      categories,
      team: team || null,
    });
  },
};

export default apiClient;
