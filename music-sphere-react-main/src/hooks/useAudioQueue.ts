import { useState, useCallback } from 'react';
import { Song } from '@/services/spotifyService';

interface QueueItem {
  song: Song;
  addedAt: Date;
}

export function useAudioQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, { song, addedAt: new Date() }]);
  }, []);

  const addToQueueNext = useCallback((song: Song) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const nextIndex = currentIndex + 1;
      newQueue.splice(nextIndex, 0, { song, addedAt: new Date() });
      return newQueue;
    });
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      if (index <= currentIndex && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
      return newQueue;
    });
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  const moveInQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      
      // Adjust current index if needed
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(prev => prev + 1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);

  const getCurrentSong = useCallback(() => {
    return currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex].song : null;
  }, [queue, currentIndex]);

  const getNextSong = useCallback(() => {
    return currentIndex + 1 < queue.length ? queue[currentIndex + 1].song : null;
  }, [queue, currentIndex]);

  const getPreviousSong = useCallback(() => {
    return currentIndex - 1 >= 0 ? queue[currentIndex - 1].song : null;
  }, [queue, currentIndex]);

  const hasNext = useCallback(() => {
    return currentIndex + 1 < queue.length;
  }, [queue, currentIndex]);

  const hasPrevious = useCallback(() => {
    return currentIndex - 1 >= 0;
  }, [queue, currentIndex]);

  const setCurrentSongIndex = useCallback((index: number) => {
    if (index >= -1 && index < queue.length) {
      setCurrentIndex(index);
    }
  }, [queue.length]);

  return {
    queue: queue.map(item => item.song),
    queueItems: queue,
    currentIndex,
    currentSong: getCurrentSong(),
    nextSong: getNextSong(),
    previousSong: getPreviousSong(),
    hasNext: hasNext(),
    hasPrevious: hasPrevious(),
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    setCurrentSongIndex,
  };
} 