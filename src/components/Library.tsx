
import { useState } from "react";
import { useLikedSongs } from "@/hooks/useLikedSongs";
import { useUserPlaylists } from "@/hooks/useUserPlaylists";
import { usePlaylistSongs } from "@/hooks/usePlaylistSongs";
import { SongCard } from "./SongCard";
import { Song } from "@/services/spotifyService";
import { Music, Heart, Trash2, ChevronDown, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryProps {
  onPlaySong: (song: Song, songList?: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
  onPlaySong: (song: Song, songList?: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onDelete: (playlistId: string) => void;
}

function PlaylistCard({ playlist, onPlaySong, currentSong, isPlaying, onDelete }: PlaylistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { songs, loading } = usePlaylistSongs(isExpanded ? playlist.id : null);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      onPlaySong(songs[0], songs);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(playlist.id);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
      <div 
        className="flex items-start justify-between mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
            <Music className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium mb-1 truncate">{playlist.name}</h4>
            {playlist.description && (
              <p className="text-gray-400 text-sm mb-1 line-clamp-1">{playlist.description}</p>
            )}
            <p className="text-gray-500 text-xs">
              {songs.length} songs • Created {new Date(playlist.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {songs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAll();
              }}
              className="text-gray-400 hover:text-green-400"
              title="Play All"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-400"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="text-gray-400">Loading songs...</div>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400">No songs in this playlist</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map((song) => (
                <SongCard
                  key={song.spotifyId}
                  song={song}
                  onPlay={() => onPlaySong(song, songs)}
                  isCurrentSong={currentSong?.spotifyId === song.spotifyId}
                  isPlaying={isPlaying}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Library({ onPlaySong, currentSong, isPlaying }: LibraryProps) {
  const { likedSongs, loading: likedLoading } = useLikedSongs();
  const { playlists, loading: playlistsLoading, deletePlaylist } = useUserPlaylists();

  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      onPlaySong(likedSongs[0], likedSongs);
    }
  };

  if (likedLoading || playlistsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-8">Your Library</h2>
      
      {/* Liked Songs Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-green-400 rounded-lg flex items-center justify-center mr-4">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Liked Songs</h3>
              <p className="text-gray-400">{likedSongs.length} songs</p>
            </div>
          </div>
          {likedSongs.length > 0 && (
            <Button
              onClick={handlePlayLikedSongs}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Play All
            </Button>
          )}
        </div>
        
        {likedSongs.length === 0 ? (
          <p className="text-gray-400 ml-16">No liked songs yet. Start liking songs to see them here!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ml-16">
            {likedSongs.slice(0, 8).map((song) => (
              <SongCard
                key={song.spotifyId}
                song={song}
                onPlay={() => onPlaySong(song, likedSongs)}
                isCurrentSong={currentSong?.spotifyId === song.spotifyId}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        )}
      </div>

      {/* Playlists Section */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-6">Your Playlists</h3>
        
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No playlists yet</p>
            <p className="text-gray-500">Create your first playlist to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPlaySong={onPlaySong}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onDelete={deletePlaylist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
