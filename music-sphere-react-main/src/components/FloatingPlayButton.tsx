import { Play, Pause, Loader2 } from 'lucide-react';
import { Song } from '@/services/spotifyService';
import { useAudio } from '@/contexts/AudioContext';

interface FloatingPlayButtonProps {
  song: Song;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingPlayButton({ song, size = 'md', className = '' }: FloatingPlayButtonProps) {
  const { currentSong, isPlaying, playSong } = useAudio();
  
  const isCurrentSong = currentSong?.spotifyId === song.spotifyId;
  const isLoading = false; // You can add loading state logic here

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        bg-green-500 hover:bg-green-400 text-black rounded-full 
        flex items-center justify-center transition-all duration-300 
        shadow-lg hover:scale-110 hover:shadow-xl
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isCurrentSong && isPlaying ? (
        <Pause className={`${iconSizes[size]} fill-current`} />
      ) : (
        <Play className={`${iconSizes[size]} fill-current ml-0.5`} />
      )}
    </button>
  );
} 