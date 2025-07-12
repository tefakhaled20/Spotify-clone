
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Song } from '@/services/spotifyService';

export function usePlaylistSongs(playlistId: string | null) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlaylistSongs = async () => {
    if (!user || !playlistId) {
      setSongs([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (error) throw error;

      const formattedSongs: Song[] = (data || []).map(song => ({
        id: song.spotify_track_id, // Use spotify_track_id as id
        spotifyId: song.spotify_track_id,
        title: song.track_name,
        artist: song.artist_name,
        album: song.album_name || '',
        duration: song.duration_ms ? Math.floor(song.duration_ms / 60000) + ':' + Math.floor((song.duration_ms % 60000) / 1000).toString().padStart(2, '0') : '0:00',
        coverImage: song.cover_image || '/placeholder.svg',
        audioUrl: song.preview_url || null,
      }));

      setSongs(formattedSongs);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playlist songs",
        variant: "destructive",
      });
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistSongs();
  }, [user, playlistId]);

  return {
    songs,
    loading,
    refetch: fetchPlaylistSongs,
  };
}
