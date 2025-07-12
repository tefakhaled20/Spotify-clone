import { Song } from './spotifyService';

// Free-to-use audio URLs for testing
const FALLBACK_AUDIO_URLS = [
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-1.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-2.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-3.wav',
];

class FallbackAudioService {
  private urlIndex = 0;

  getFallbackAudioUrl(song: Song): string {
    // Cycle through available fallback URLs
    const url = FALLBACK_AUDIO_URLS[this.urlIndex % FALLBACK_AUDIO_URLS.length];
    this.urlIndex++;
    return url;
  }

  // Create a mock song with fallback audio
  createMockSong(title: string, artist: string): Song {
    return {
      id: `mock-${Date.now()}`,
      title,
      artist,
      album: 'Mock Album',
      duration: '0:30',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      audioUrl: this.getFallbackAudioUrl({} as Song),
      spotifyId: `mock-${Date.now()}`,
    };
  }

  // Test if audio URL is accessible
  async testAudioUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const fallbackAudioService = new FallbackAudioService(); 