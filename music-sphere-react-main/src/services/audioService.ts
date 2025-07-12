import { Song } from './spotifyService';
import { youtubeService } from './youtubeService';

interface AudioSource {
  type: 'spotify' | 'youtube' | 'fallback';
  url: string;
  quality: 'high' | 'medium' | 'low';
  description?: string;
}

class AudioService {
  private audioCache = new Map<string, AudioSource>();
  private loadingCache = new Set<string>();

  async getBestAudioUrl(song: Song): Promise<string | null> {
    const cacheKey = `${song.spotifyId}`;
    
    // Check if already loading
    if (this.loadingCache.has(cacheKey)) {
      return null;
    }

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      const cached = this.audioCache.get(cacheKey)!;
      return cached.url;
    }

    // Primary source: Spotify preview
    if (song.audioUrl) {
      const spotifySource: AudioSource = {
        type: 'spotify',
        url: song.audioUrl,
        quality: 'high',
        description: 'Spotify Preview'
      };
      this.audioCache.set(cacheKey, spotifySource);
      return song.audioUrl;
    }

    // Mark as loading
    this.loadingCache.add(cacheKey);

    try {
      // Fallback source: YouTube
      console.log('Spotify preview not available, searching YouTube for:', song.title, 'by', song.artist);
      
      const youtubeUrl = await youtubeService.searchForSong(song.title, song.artist);
      
      if (youtubeUrl) {
        const youtubeSource: AudioSource = {
          type: 'youtube',
          url: youtubeUrl,
          quality: 'medium',
          description: 'YouTube Audio'
        };
        this.audioCache.set(cacheKey, youtubeSource);
        
        console.log('Found YouTube audio for:', song.title);
        return youtubeUrl;
      }

      // No audio source found
      console.log('No audio source found for:', song.title);
      return null;

    } catch (error) {
      console.error('Error getting audio URL for', song.title, ':', error);
      return null;
    } finally {
      // Remove from loading cache
      this.loadingCache.delete(cacheKey);
    }
  }

  async getAudioSourceInfo(song: Song): Promise<AudioSource | null> {
    const cacheKey = `${song.spotifyId}`;
    
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Try to get audio URL first
    const audioUrl = await this.getBestAudioUrl(song);
    
    if (audioUrl && this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    return null;
  }

  isLoading(song: Song): boolean {
    return this.loadingCache.has(`${song.spotifyId}`);
  }

  clearCache() {
    this.audioCache.clear();
    this.loadingCache.clear();
  }

  getCacheSize(): number {
    return this.audioCache.size;
  }
}

export const audioService = new AudioService();