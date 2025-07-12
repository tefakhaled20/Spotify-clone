import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/AudioContext';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { Heart } from 'lucide-react';

interface MiniPlayerProps {
  onShowFullPlayer?: () => void;
}

export function MiniPlayer({ onShowFullPlayer }: MiniPlayerProps) {
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    setVolume, 
    togglePlay, 
    nextSong, 
    previousSong,
    audioQueue 
  } = useAudio();
  
  const { isLiked, toggleLike } = useLikedSongs();

  if (!currentSong) return null;

  const handleVolumeToggle = () => {
    setVolume(volume > 0 ? 0 : 0.7);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-green-500/20 p-2 z-40">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Song Info */}
        <div 
          className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
          onClick={onShowFullPlayer}
        >
          <img
            src={currentSong.coverImage}
            alt={currentSong.title}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate text-sm">{currentSong.title}</h4>
            <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={previousSong}
            disabled={!audioQueue.hasPrevious}
            className="text-gray-400 hover:text-white p-1 bg-transparent border-none"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={togglePlay}
            className="bg-white text-black rounded-full p-1 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
            )}
          </Button>
          
          <Button
            onClick={nextSong}
            disabled={!audioQueue.hasNext}
            className="text-gray-400 hover:text-white p-1 bg-transparent border-none"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume and Like */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleVolumeToggle}
            className="text-gray-400 hover:text-white p-1 bg-transparent border-none"
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => toggleLike(currentSong)}
            className={`p-1 bg-transparent border-none ${
              isLiked(currentSong.spotifyId) 
                ? 'text-green-500 hover:text-green-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" fill={isLiked(currentSong.spotifyId) ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
    </div>
  );
} 