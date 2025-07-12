
import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, Loader2, ListMusic } from "lucide-react";
import { Song } from "@/services/spotifyService";
import { audioService } from "@/services/audioService";
import { useAudioQueue } from "@/hooks/useAudioQueue";

interface AudioPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onShowQueue?: () => void;
}

export function AudioPlayer({ 
  song, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrevious,
  isLiked = false,
  onToggleLike,
  onShowQueue
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioSourceType, setAudioSourceType] = useState<'spotify' | 'youtube' | 'fallback' | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Load audio URL when song changes
  useEffect(() => {
    const loadAudioUrl = async () => {
      if (!song) return;
      
      console.log('🎵 AudioPlayer: Loading audio for song:', song.title);
      setIsLoadingAudio(true);
      setAudioError(null);
      
      try {
        // First try the existing audioUrl (Spotify preview)
        if (song.audioUrl) {
          console.log('🎵 AudioPlayer: Found Spotify preview URL:', song.audioUrl);
          setCurrentAudioUrl(song.audioUrl);
          setAudioSourceType('spotify');
          console.log('Using Spotify preview for:', song.title);
        } else {
          // If no Spotify preview, try to get alternative audio
          console.log('No Spotify preview available, searching for alternative audio for:', song.title);
          const alternativeUrl = await audioService.getBestAudioUrl(song);
          
          if (alternativeUrl) {
            setCurrentAudioUrl(alternativeUrl);
            setAudioSourceType('youtube');
            console.log('Using YouTube audio for:', song.title);
          } else {
            setCurrentAudioUrl(null);
            setAudioSourceType(null);
            setAudioError('No audio preview available');
            console.log('No audio source found for:', song.title);
          }
        }
      } catch (error) {
        console.error('Error loading audio for', song.title, ':', error);
        setCurrentAudioUrl(null);
        setAudioSourceType(null);
        setAudioError('Failed to load audio');
      } finally {
        setIsLoadingAudio(false);
      }
    };

    loadAudioUrl();
  }, [song.spotifyId]); // Only reload when song changes

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentAudioUrl) {
      console.log('🎵 AudioPlayer: Starting playback for:', song.title, 'Source:', audioSourceType, 'URL:', currentAudioUrl);
      audio.play().catch((error) => {
        console.error('🎵 AudioPlayer: Playback error:', error);
        setAudioError('Playback failed');
      });
    } else {
      console.log('🎵 AudioPlayer: Pausing audio for:', song.title);
      audio.pause();
    }
  }, [isPlaying, currentAudioUrl, audioSourceType, song.title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      console.log('Song ended:', song.title);
      if (onNext) {
        onNext();
      } else {
        onTogglePlay();
      }
    };

    const handleError = () => {
      console.error('Audio error for:', song.title);
      setAudioError('Audio playback error');
    };

    const handleCanPlay = () => {
      setAudioError(null);
      console.log('Audio can play:', song.title);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [song, onNext, onTogglePlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const getAudioStatusMessage = () => {
    if (isLoadingAudio) return "Loading audio...";
    if (audioError) return audioError;
    if (!currentAudioUrl) return "No audio preview available";
    if (audioSourceType === 'spotify') return "Playing Spotify preview";
    if (audioSourceType === 'youtube') return "Playing YouTube audio";
    return "Audio ready";
  };

  const canPlay = currentAudioUrl && !isLoadingAudio && !audioError;
  const { queue } = useAudioQueue();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-green-500/20 p-4">
      {currentAudioUrl && (
        <audio
          ref={audioRef}
          src={currentAudioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Song Info - Enhanced display */}
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

        {/* Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
          <div className="flex items-center space-x-6">
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
              {isLoadingAudio ? (
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

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              disabled={!canPlay}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Audio Status */}
          <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500">{getAudioStatusMessage()}</p>
            {audioSourceType === 'youtube' && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                YouTube
              </span>
            )}
            {audioSourceType === 'spotify' && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Spotify
              </span>
            )}
          </div>
        </div>

        {/* Volume and Queue */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {onShowQueue && (
            <button
              onClick={onShowQueue}
              className="text-gray-400 hover:text-white transition-colors relative"
            >
              <ListMusic className="h-5 w-5" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>
          )}
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
}
