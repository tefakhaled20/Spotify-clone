interface YouTubeSearchResult {
  kind: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchResult[];
}

class YouTubeService {
  private apiKey: string = 'AIzaSyAxjwl9r0eWGpk73VbKL2_uDGOmHH0JX3Q';
  private baseUrl: string = 'https://www.googleapis.com/youtube/v3';

  async searchForSong(title: string, artist: string): Promise<string | null> {
    // This function now only searches for a YouTube video, but does not attempt to fetch or return any audio URL.
    // Always return null, as we do not support YouTube audio fallback anymore.
    return null;
  }

  async searchForVideo(title: string, artist: string): Promise<string | null> {
    try {
      const query = encodeURIComponent(`${title} ${artist} official music video`);
      const url = `${this.baseUrl}/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=1&key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search for video');
      }
      
      const data: YouTubeSearchResponse = await response.json();
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        return this.createEmbedUrl(videoId);
      }
      return null;
    } catch (error) {
      console.error('YouTube video search error:', error);
      return null;
    }
  }

  // Remove getDirectStreamUrl and related logic

  // Create a YouTube embed URL that can be used with iframe (if needed elsewhere)
  createEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1&showinfo=1&rel=0&modestbranding=1`;
  }
}

export const youtubeService = new YouTubeService();