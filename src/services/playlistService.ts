import { supabase } from '@/integrations/supabase/client';
import { Song } from './spotifyService';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  songCount: number;
}

export interface PlaylistSong extends Song {
  addedAt: string;
  position: number;
}

class PlaylistService {
  // Temporary storage until database is set up
  private mockPlaylists: Playlist[] = [];
  private mockPlaylistSongs: { [playlistId: string]: PlaylistSong[] } = {};

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    try {
      const storedPlaylists = localStorage.getItem('mock_playlists');
      const storedSongs = localStorage.getItem('mock_playlist_songs');
      
      if (storedPlaylists) {
        this.mockPlaylists = JSON.parse(storedPlaylists);
        console.log('Loaded mock playlists from localStorage:', this.mockPlaylists.length);
      }
      
      if (storedSongs) {
        this.mockPlaylistSongs = JSON.parse(storedSongs);
        console.log('Loaded mock songs from localStorage');
      }
    } catch (error) {
      console.error('Error loading mock data from localStorage:', error);
    }
  }

  private saveMockData() {
    try {
      localStorage.setItem('mock_playlists', JSON.stringify(this.mockPlaylists));
      localStorage.setItem('mock_playlist_songs', JSON.stringify(this.mockPlaylistSongs));
      console.log('Saved mock data to localStorage');
    } catch (error) {
      console.error('Error saving mock data to localStorage:', error);
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    try {
      console.log('Fetching playlists...');
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }
      
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }

      console.log('User authenticated:', user.id);

      // For now, return mock data until database is set up
      console.log('Database tables not set up yet, returning mock data');
      return this.mockPlaylists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description?: string, isPublic: boolean = false): Promise<Playlist> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create mock playlist
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name,
        description,
        coverImage: undefined,
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        songCount: 0,
      };

      this.mockPlaylists.unshift(newPlaylist);
      this.mockPlaylistSongs[newPlaylist.id] = [];

      this.saveMockData();
      console.log('Created mock playlist:', newPlaylist);
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
    try {
      console.log('Fetching songs for playlist:', playlistId);
      console.log('Available playlist IDs:', Object.keys(this.mockPlaylistSongs));
      console.log('Available playlists:', this.mockPlaylists.map(p => ({ id: p.id, name: p.name })));
      
      const songs = this.mockPlaylistSongs[playlistId] || [];
      console.log('Found songs for playlist:', songs.length);
      return songs;
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      throw error;
    }
  }

  async addSongToPlaylist(playlistId: string, song: Song): Promise<void> {
    try {
      console.log('Adding song to playlist:', playlistId, song.title);
      
      if (!this.mockPlaylistSongs[playlistId]) {
        this.mockPlaylistSongs[playlistId] = [];
      }

      const playlistSong: PlaylistSong = {
        ...song,
        addedAt: new Date().toISOString(),
        position: this.mockPlaylistSongs[playlistId].length,
      };

      this.mockPlaylistSongs[playlistId].push(playlistSong);

      // Update song count
      const playlist = this.mockPlaylists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.songCount = this.mockPlaylistSongs[playlistId].length;
        playlist.updatedAt = new Date().toISOString();
      }

      this.saveMockData();
      console.log('Added song to mock playlist');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      console.log('Removing song from playlist:', playlistId, songId);
      
      if (this.mockPlaylistSongs[playlistId]) {
        this.mockPlaylistSongs[playlistId] = this.mockPlaylistSongs[playlistId]
          .filter(song => song.spotifyId !== songId)
          .map((song, index) => ({ ...song, position: index }));

        // Update song count
        const playlist = this.mockPlaylists.find(p => p.id === playlistId);
        if (playlist) {
          playlist.songCount = this.mockPlaylistSongs[playlistId].length;
          playlist.updatedAt = new Date().toISOString();
        }
      }

      this.saveMockData();
      console.log('Removed song from mock playlist');
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      console.log('Deleting playlist:', playlistId);
      
      this.mockPlaylists = this.mockPlaylists.filter(p => p.id !== playlistId);
      delete this.mockPlaylistSongs[playlistId];

      this.saveMockData();
      console.log('Deleted mock playlist');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(playlistId: string, updates: Partial<{ name: string; description: string; isPublic: boolean }>): Promise<void> {
    try {
      console.log('Updating playlist:', playlistId, updates);
      
      const playlist = this.mockPlaylists.find(p => p.id === playlistId);
      if (playlist) {
        Object.assign(playlist, updates);
        playlist.updatedAt = new Date().toISOString();
      }

      this.saveMockData();
      console.log('Updated mock playlist');
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private parseDuration(duration: string): number {
    const [minutes, seconds] = duration.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  }

  // Debug method to clear all mock data
  clearMockData() {
    this.mockPlaylists = [];
    this.mockPlaylistSongs = {};
    localStorage.removeItem('mock_playlists');
    localStorage.removeItem('mock_playlist_songs');
    console.log('Cleared all mock data');
  }

  // Debug method to get current state
  getDebugInfo() {
    return {
      playlists: this.mockPlaylists,
      playlistSongs: this.mockPlaylistSongs,
      playlistCount: this.mockPlaylists.length,
      songCount: Object.values(this.mockPlaylistSongs).reduce((total, songs) => total + songs.length, 0)
    };
  }
}

export const playlistService = new PlaylistService(); 