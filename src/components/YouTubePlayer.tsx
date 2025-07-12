import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, Loader2, Volume2, VolumeX, Maximize2, Minimize2, X } from "lucide-react";
import { Song } from "@/services/spotifyService";
import { youtubeService } from "@/services/youtubeService";

interface YouTubePlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onShowQueue?: () => void;
  onExit?: () => void;
}

export function YouTubePlayer({ 
  song, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrevious,
  isLiked = false,
  onToggleLike,
  onShowQueue,
  onExit
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load YouTube video when song changes
  useEffect(() => {
    const loadYouTubeVideo = async () => {
      if (!song) return;
      
      console.log('🎥 YouTubePlayer: Loading video for song:', song.title);
      setIsLoadingVideo(true);
      setError(null);
      
      try {
        // Search for the song on YouTube
        const searchQuery = `${song.title} ${song.artist} official`;
        const videoId = await youtubeService.searchForVideoId(searchQuery);
        
        if (videoId) {
          setVideoId(videoId);
          console.log('🎥 YouTubePlayer: Found video ID:', videoId);
        } else {
          setError('No video found for this song');
          console.log('🎥 YouTubePlayer: No video found for:', song.title);
        }
      } catch (error) {
        console.error('🎥 YouTubePlayer: Error loading video:', error);
        setError('Failed to load video');
      } finally {
        setIsLoadingVideo(false);
      }
    };

    loadYouTubeVideo();
  }, [song.spotifyId]);

  // Control YouTube player
  useEffect(() => {
    if (!iframeRef.current || !videoId) return;

    const iframe = iframeRef.current;
    const player = iframe.contentWindow;

    if (player) {
      try {
        if (isPlaying) {
          // Play video
          player.postMessage(JSON.stringify({
            event: 'command',
            func: 'playVideo'
          }), '*');
        } else {
          // Pause video
          player.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo'
          }), '*');
        }
      } catch (error) {
        console.error('🎥 YouTubePlayer: Error controlling player:', error);
      }
    }
  }, [isPlaying, videoId]);

  // Handle volume changes
  useEffect(() => {
    if (!iframeRef.current || !videoId) return;

    const iframe = iframeRef.current;
    const player = iframe.contentWindow;

    if (player) {
      try {
        const volumeLevel = isMuted ? 0 : Math.floor(volume * 100);
        player.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volumeLevel]
        }), '*');
      } catch (error) {
        console.error('🎥 YouTubePlayer: Error setting volume:', error);
      }
    }
  }, [volume, isMuted, videoId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onExit) {
        onExit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (!isFullscreen) {
        iframeRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const canPlay = videoId && !isLoadingVideo && !error;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-green-500/20 p-4">
      {/* YouTube Video Player */}
      {videoId && (
        <div className="mb-4">
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Exit Button */}
            {onExit && (
              <button
                onClick={onExit}
                className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
                title="Exit Video"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&autoplay=0`}
              className="w-full aspect-video rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* Loading overlay */}
            {isLoadingVideo && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            
            {/* Error overlay */}
            {error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <p className="text-lg font-semibold">Video Unavailable</p>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <img
            src={song.coverImage}
            alt={song.title}
            className="w-14 h-14 rounded-lg object-cover shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate text-lg">{song.title}</h4>
            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
            <p className="text-gray-500 text-xs truncate">{song.album}</p>
          </div>
          {onToggleLike && (
            <button
              onClick={onToggleLike}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'text-green-500 hover:text-green-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-6 flex-1 justify-center">
          <button 
            onClick={onPrevious}
            disabled={!onPrevious}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          
          <button
            onClick={onTogglePlay}
            disabled={!canPlay}
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isLoadingVideo ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            )}
          </button>
          
          <button 
            onClick={onNext}
            disabled={!onNext}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Volume and Fullscreen Controls */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {onShowQueue && (
            <button
              onClick={onShowQueue}
              className="text-gray-400 hover:text-white transition-colors relative"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleVolumeToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <button
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 