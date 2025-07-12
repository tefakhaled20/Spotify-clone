
import { supabase } from '@/integrations/supabase/client';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverImage: string;
  audioUrl: string | null;
  spotifyId: string;
}

class SpotifyService {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const { data, error } = await supabase.functions.invoke('spotify-auth');
      
      if (error) {
        console.error('Error calling spotify-auth function:', error);
        throw new Error('Failed to get Spotify access token');
      }

      if (!data || !data.access_token) {
        throw new Error('Invalid response from Spotify authentication');
      }

      this.accessToken = data.access_token;
      // Set expiry to 50 minutes (tokens expire in 1 hour)
      this.tokenExpiry = Date.now() + (data.expires_in - 600) * 1000;
      
      console.log('Successfully obtained Spotify access token');
      return this.accessToken;

    } catch (error) {
      console.error('Failed to get Spotify access token:', error);
      throw error;
    }
  }

  async searchTracks(query: string): Promise<Song[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search Spotify tracks');
      }

      const data: SpotifySearchResponse = await response.json();
      
      return data.tracks.items.map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        duration: this.formatDuration(track.duration_ms),
        coverImage: track.album.images[0]?.url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: track.preview_url,
        spotifyId: track.id,
      }));
    } catch (error) {
      console.error('Spotify search error:', error);
      throw error;
    }
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const spotifyService = new SpotifyService();
