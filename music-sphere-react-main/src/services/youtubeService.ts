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
    try {
      // Create search query combining title and artist
      const query = `${title} ${artist} official audio`.trim();
      
      console.log('🔍 Searching YouTube for:', query);
      
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=1&key=${this.apiKey}`
      );

      if (!response.ok) {
        console.error('❌ YouTube API error:', response.status, await response.text());
        return null;
      }

      const data: YouTubeSearchResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const bestMatch = data.items[0];
        const videoId = bestMatch.id.videoId;
        
        console.log('✅ Found YouTube video:', bestMatch.snippet.title, 'ID:', videoId);
        
        // Create a streamable URL using a public audio extraction service
        const audioUrl = await this.getStreamableUrl(videoId);
        
        if (audioUrl) {
          console.log('🎵 Successfully created streamable URL for:', title);
          return audioUrl;
        }
      }

      console.log('❌ No suitable YouTube video found for:', title);
      return null;
    } catch (error) {
      console.error('❌ YouTube search error:', error);
      return null;
    }
  }

  async searchForVideoId(query: string): Promise<string | null> {
    try {
      console.log('🎥 Searching YouTube for video ID:', query);
      
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=1&key=${this.apiKey}`
      );

      if (!response.ok) {
        console.error('❌ YouTube API error:', response.status, await response.text());
        return null;
      }

      const data: YouTubeSearchResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const bestMatch = data.items[0];
        const videoId = bestMatch.id.videoId;
        
        console.log('✅ Found YouTube video ID:', videoId, 'Title:', bestMatch.snippet.title);
        return videoId;
      }

      console.log('❌ No YouTube video found for:', query);
      return null;
    } catch (error) {
      console.error('❌ YouTube search error:', error);
      return null;
    }
  }

  private async getStreamableUrl(videoId: string): Promise<string | null> {
    // Use a simple approach that creates a proxy URL
    // This will be handled by our audio service
    const proxyUrl = `https://cors-anywhere.herokuapp.com/https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      // Test if the URL is accessible
      const testResponse = await fetch(proxyUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        return proxyUrl;
      }
    } catch (error) {
      console.error('Proxy test failed:', error);
    }

    // Fallback: Use embedded audio approach
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`;
  }

  // Alternative: Get direct stream URL using a public service
  async getDirectStreamUrl(videoId: string): Promise<string | null> {
    try {
      // Use a public YouTube to MP3 converter API
      const apiUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Return the direct MP3 URL if available
      if (data.url) {
        console.log('🎵 Found direct stream URL for video:', videoId);
        return data.url;
      }

      return null;
    } catch (error) {
      console.error('Direct stream extraction failed:', error);
      return null;
    }
  }

  // Create a YouTube embed URL that can be used with iframe
  createEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
  }
}

export const youtubeService = new YouTubeService();