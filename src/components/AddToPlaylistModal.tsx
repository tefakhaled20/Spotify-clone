
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserPlaylists } from "@/hooks/useUserPlaylists";
import { Song } from "@/services/spotifyService";
import { Music } from "lucide-react";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
}

export function AddToPlaylistModal({ isOpen, onClose, song }: AddToPlaylistModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { playlists } = useUserPlaylists();

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user || !song) return;

    setIsAdding(true);
    try {
      // Check if song already exists in playlist
      const { data: existingSongs, error: checkError } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('spotify_track_id', song.spotifyId);

      if (checkError) throw checkError;

      if (existingSongs && existingSongs.length > 0) {
        toast({
          title: "Song already in playlist",
          description: "This song is already in the selected playlist.",
          variant: "destructive",
        });
        return;
      }

      // Get the current highest position in the playlist
      const { data: positionData, error: positionError } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      if (positionError) throw positionError;

      const nextPosition = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;

      // Add song to playlist
      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          spotify_track_id: song.spotifyId,
          track_name: song.title,
          artist_name: song.artist,
          album_name: song.album,
          cover_image: song.coverImage,
          preview_url: song.audioUrl,
          duration_ms: song.duration ? parseInt(song.duration.split(':')[0]) * 60000 + parseInt(song.duration.split(':')[1]) * 1000 : null,
          position: nextPosition,
        });

      if (error) throw error;

      toast({
        title: "Song added to playlist",
        description: `"${song.title}" has been added to the playlist.`,
      });

      onClose();
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast({
        title: "Error",
        description: "Failed to add song to playlist",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            <img
              src={song?.coverImage}
              alt={song?.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <p className="font-medium text-white">{song?.title}</p>
              <p className="text-sm text-gray-400">{song?.artist}</p>
            </div>
          </div>

          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No playlists found</p>
              <p className="text-gray-500 text-sm">Create a playlist first to add songs</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={isAdding}
                  variant="ghost"
                  className="w-full justify-start text-left text-white hover:bg-gray-800"
                >
                  <Music className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">{playlist.name}</p>
                    {playlist.description && (
                      <p className="text-xs text-gray-400">{playlist.description}</p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
