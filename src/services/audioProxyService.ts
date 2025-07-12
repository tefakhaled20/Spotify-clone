interface AudioProxy {
  getAudioUrl(videoId: string): Promise<string | null>;
  testUrl(url: string): Promise<boolean>;
}

class AudioProxyService implements AudioProxy {
  private proxies = [
    'https://api.cobalt.tools/api/json',
    'https://yt-dlp-api.vercel.app/api/info',
    'https://youtube-audio-api.vercel.app/api/extract'
  ];

  async getAudioUrl(videoId: string): Promise<string | null> {
    // Try different proxy services
    for (const proxy of this.proxies) {
      try {
        const audioUrl = await this.tryProxy(proxy, videoId);
        if (audioUrl && await this.testUrl(audioUrl)) {
          return audioUrl;
        }
      } catch (error) {
        console.error(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }

    // Fallback: Use a direct approach with ytdl-core-like service
    return this.getFallbackAudioUrl(videoId);
  }

  private async tryProxy(proxyUrl: string, videoId: string): Promise<string | null> {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    if (proxyUrl.includes('cobalt.tools')) {
      return this.tryCobaltProxy(proxyUrl, youtubeUrl);
    } else if (proxyUrl.includes('yt-dlp')) {
      return this.tryYtDlpProxy(proxyUrl, youtubeUrl);
    } else {
      return this.tryGenericProxy(proxyUrl, videoId);
    }
  }

  private async tryCobaltProxy(proxyUrl: string, youtubeUrl: string): Promise<string | null> {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        url: youtubeUrl,
        vQuality: 'lowest',
        aFormat: 'mp3',
        isAudioOnly: true
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.url || null;
  }

  private async tryYtDlpProxy(proxyUrl: string, youtubeUrl: string): Promise<string | null> {
    const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(youtubeUrl)}`);
    
    if (!response.ok) return null;

    const data = await response.json();
    return data.formats?.find((f: any) => f.acodec !== 'none')?.url || null;
  }

  private async tryGenericProxy(proxyUrl: string, videoId: string): Promise<string | null> {
    const response = await fetch(`${proxyUrl}?videoId=${videoId}`);
    
    if (!response.ok) return null;

    const data = await response.json();
    return data.audioUrl || data.url || null;
  }

  private async getFallbackAudioUrl(videoId: string): Promise<string | null> {
    // As a last resort, return a streamable URL that might work
    // This won't work for all browsers due to CORS, but it's better than nothing
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`;
  }

  async testUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const audioProxyService = new AudioProxyService();