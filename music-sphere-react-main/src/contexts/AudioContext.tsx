import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Song } from '@/services/spotifyService';
import { useAudioQueue } from '@/hooks/useAudioQueue';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  playSong: (song: Song, songList?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  audioQueue: ReturnType<typeof useAudioQueue>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioQueue = useAudioQueue();

  const playSong = useCallback((song: Song, songList?: Song[]) => {
    console.log('🎵 AudioContext: Playing song:', song.title, 'by', song.artist);
    
    if (currentSong?.spotifyId === song.spotifyId) {
      console.log('🎵 AudioContext: Same song, toggling play state');
      setIsPlaying(!isPlaying);
    } else {
      console.log('🎵 AudioContext: New song, setting current song and starting playback');
      setCurrentSong(song);
      setIsPlaying(true);
      
      // If this song is in the queue, set the current index
      const queueIndex = audioQueue.queue.findIndex(s => s.spotifyId === song.spotifyId);
      if (queueIndex !== -1) {
        audioQueue.setCurrentSongIndex(queueIndex);
        console.log('Found song in queue at index:', queueIndex);
      } else if (songList) {
        // If not in queue but we have a song list, add the list to queue
        songList.forEach(s => audioQueue.addToQueue(s));
        const index = songList.findIndex(s => s.spotifyId === song.spotifyId);
        audioQueue.setCurrentSongIndex(index);
        console.log('Added song list to queue, current index:', index);
      }
    }
  }, [currentSong, isPlaying, audioQueue]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (audioQueue.hasNext) {
      const nextSong = audioQueue.nextSong;
      if (nextSong) {
        setCurrentSong(nextSong);
        setIsPlaying(true);
        audioQueue.setCurrentSongIndex(audioQueue.currentIndex + 1);
        console.log('Next song:', nextSong.title);
      }
    }
  }, [audioQueue]);

  const previousSong = useCallback(() => {
    if (audioQueue.hasPrevious) {
      const prevSong = audioQueue.previousSong;
      if (prevSong) {
        setCurrentSong(prevSong);
        setIsPlaying(true);
        audioQueue.setCurrentSongIndex(audioQueue.currentIndex - 1);
        console.log('Previous song:', prevSong.title);
      }
    }
  }, [audioQueue]);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    setCurrentSong,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    audioQueue,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 