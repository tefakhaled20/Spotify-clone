
import { Play, Pause, Heart, Youtube, Music, Plus, ListPlus, Clock } from "lucide-react";
import { Song } from "@/services/spotifyService";
import { useState } from "react";
import { AddToPlaylistModal } from "./AddToPlaylistModal";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

export function SongCard({ song, onPlay, isCurrentSong, isPlaying, isLiked = false, onToggleLike }: SongCardProps) {
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const hasSpotifyPreview = !!song.audioUrl;
  const { addToQueue, addToQueueNext } = useAudioQueue();
  
  return (
    <>
      <div className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-lg p-4 transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10 hover:border-green-400/30">
        <div className="relative mb-4">
          <img
            src={song.coverImage}
            alt={`${song.title} cover`}
            className="w-full aspect-square object-cover rounded-lg shadow-lg"
          />
          
          {/* Video source indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Youtube className="h-3 w-3" />
              Video
            </div>
          </div>
          
          <div className="absolute bottom-2 right-2 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/20 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110 hover:bg-white/30"
                >
                  <ListPlus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-white/10">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(song);
                  }}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Queue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueueNext(song);
                  }}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Play Next
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddToPlaylist(true);
                  }}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onToggleLike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike();
                }}
                className={`rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110 ${
                  isLiked 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('🎵 SongCard: Play button clicked for:', song.title);
                onPlay();
              }}
              className="bg-green-500 hover:bg-green-400 text-black rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:scale-110"
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className={`font-semibold truncate ${isCurrentSong ? 'text-green-400' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-gray-400 text-sm truncate">{song.artist}</p>
          <p className="text-gray-500 text-xs truncate">{song.album}</p>
          
          {/* Video source info */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              YouTube video
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Youtube className="h-3 w-3" />
              <span>Video available</span>
            </div>
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        song={song}
      />
    </>
  );
}
