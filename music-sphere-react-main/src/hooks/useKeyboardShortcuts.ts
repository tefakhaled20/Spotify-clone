import { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';

export function useKeyboardShortcuts() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    nextSong, 
    previousSong, 
    setVolume, 
    volume 
  } = useAudio();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Prevent default behavior for our shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      switch (event.code) {
        case 'Space':
          if (currentSong) {
            preventDefault();
            togglePlay();
          }
          break;

        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            nextSong();
          }
          break;

        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            previousSong();
          }
          break;

        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            setVolume(Math.min(1, volume + 0.1));
          }
          break;

        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            setVolume(Math.max(0, volume - 0.1));
          }
          break;

        case 'KeyM':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            setVolume(volume > 0 ? 0 : 0.7);
          }
          break;

        case 'KeyN':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            nextSong();
          }
          break;

        case 'KeyP':
          if (event.ctrlKey || event.metaKey) {
            preventDefault();
            previousSong();
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSong, isPlaying, togglePlay, nextSong, previousSong, setVolume, volume]);

  // Return keyboard shortcuts info for UI display
  return {
    shortcuts: [
      { key: 'Space', description: 'Play/Pause' },
      { key: 'Ctrl/Cmd + →', description: 'Next Song' },
      { key: 'Ctrl/Cmd + ←', description: 'Previous Song' },
      { key: 'Ctrl/Cmd + ↑', description: 'Volume Up' },
      { key: 'Ctrl/Cmd + ↓', description: 'Volume Down' },
      { key: 'Ctrl/Cmd + M', description: 'Mute/Unmute' },
      { key: 'Ctrl/Cmd + N', description: 'Next Song' },
      { key: 'Ctrl/Cmd + P', description: 'Previous Song' },
    ]
  };
} 