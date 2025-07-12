
import { SongCard } from "./SongCard";
import { Song } from "@/services/spotifyService";
import { useUserPlaylists } from "@/hooks/useUserPlaylists";
import { usePlaylistSongs } from "@/hooks/usePlaylistSongs";
import { Music, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaylistViewProps {
  playlistId: string;
  onPlaySong: (song: Song, songList?: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaylistDeleted?: () => void;
}

export function PlaylistView({ playlistId, onPlaySong, currentSong, isPlaying, onPlaylistDeleted }: PlaylistViewProps) {
  const { playlists, deletePlaylist } = useUserPlaylists();
  const { songs, loading } = usePlaylistSongs(playlistId);

  const playlist = playlists.find(p => p.id === playlistId);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      onPlaySong(songs[0], songs);
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlistId);
      onPlaylistDeleted?.();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mr-6">
          <Music className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-400 mb-2">{playlist.description}</p>
          )}
          <p className="text-gray-400">{songs.length} songs</p>
        </div>
        <div className="flex items-center space-x-3">
          {songs.length > 0 && (
            <Button
              onClick={handlePlayAll}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Play All
            </Button>
          )}
          <Button
            onClick={handleDeletePlaylist}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-4">No songs in this playlist</h3>
          <p className="text-gray-400">Add some songs to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
}
