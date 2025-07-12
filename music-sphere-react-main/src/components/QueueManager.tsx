import { useState } from 'react';
import { Song } from '@/services/spotifyService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Trash2, MoveUp, MoveDown, X, ListMusic, Clock } from 'lucide-react';
import { useAudioQueue } from '@/hooks/useAudioQueue';

interface QueueManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
}

export function QueueManager({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay
}: QueueManagerProps) {
  const { 
    queue, 
    queueItems, 
    currentIndex, 
    removeFromQueue, 
    moveInQueue, 
    clearQueue,
    setCurrentSongIndex 
  } = useAudioQueue();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePlaySong = (song: Song, index: number) => {
    setCurrentSongIndex(index);
    onPlaySong(song);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveInQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      moveInQueue(index, index + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-end">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-tl-lg w-full max-w-md h-2/3 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ListMusic className="h-5 w-5 text-green-500" />
            <h2 className="text-white font-semibold">Queue</h2>
            <span className="text-gray-400 text-sm">({queue.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              className="text-gray-400 hover:text-white"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Queue List */}
        <ScrollArea className="flex-1 p-4">
          {queue.length === 0 ? (
            <div className="text-center py-8">
              <ListMusic className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your queue is empty</p>
              <p className="text-gray-500 text-sm">Add songs to start building your queue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((song, index) => {
                const isCurrent = index === currentIndex;
                const queueItem = queueItems[index];
                
                return (
                  <div
                    key={`${song.spotifyId}-${index}`}
                    className={`group flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isCurrent 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <img
                          src={song.coverImage}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-medium truncate ${
                            isCurrent ? 'text-green-400' : 'text-white'
                          }`}>
                            {song.title}
                          </h4>
                          <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCurrent ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onTogglePlay}
                          className="text-green-400 hover:text-green-300"
                        >
                          {isPlaying ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlaySong(song, index)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === queue.length - 1}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromQueue(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Added time */}
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(queueItem.addedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
} 