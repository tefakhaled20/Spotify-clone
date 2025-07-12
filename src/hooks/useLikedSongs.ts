
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Song } from '@/services/spotifyService';
import { useToast } from '@/hooks/use-toast';

export function useLikedSongs() {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLikedSongs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const songs: Song[] = data.map(item => ({
        id: item.spotify_track_id,
        title: item.track_name,
        artist: item.artist_name,
        album: item.album_name || '',
        duration: item.duration_ms ? Math.floor(item.duration_ms / 60000) + ':' + Math.floor((item.duration_ms % 60000) / 1000).toString().padStart(2, '0') : '0:00',
        coverImage: item.cover_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: item.preview_url,
        spotifyId: item.spotify_track_id,
      }));

      setLikedSongs(songs);
      setLikedSongIds(new Set(songs.map(song => song.spotifyId)));
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch liked songs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (song: Song) => {
    if (!user) return;

    const isLiked = likedSongIds.has(song.spotifyId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('spotify_track_id', song.spotifyId);

        if (error) throw error;

        setLikedSongIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(song.spotifyId);
          return newSet;
        });
        setLikedSongs(prev => prev.filter(s => s.spotifyId !== song.spotifyId));

        toast({
          title: "Removed from liked songs",
          description: `${song.title} by ${song.artist}`,
        });
      } else {
        const { error } = await supabase
          .from('liked_songs')
          .insert({
            user_id: user.id,
            spotify_track_id: song.spotifyId,
            track_name: song.title,
            artist_name: song.artist,
            album_name: song.album,
            cover_image: song.coverImage,
            preview_url: song.audioUrl,
            duration_ms: song.duration ? parseInt(song.duration.split(':')[0]) * 60000 + parseInt(song.duration.split(':')[1]) * 1000 : null,
          });

        if (error) throw error;

        setLikedSongIds(prev => new Set([...prev, song.spotifyId]));
        setLikedSongs(prev => [song, ...prev]);

        toast({
          title: "Added to liked songs",
          description: `${song.title} by ${song.artist}`,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update liked songs",
        variant: "destructive",
      });
    }
  };

  const isLiked = (songId: string) => likedSongIds.has(songId);

  useEffect(() => {
    fetchLikedSongs();
  }, [user]);

  return {
    likedSongs,
    likedSongIds,
    loading,
    toggleLike,
    isLiked,
    fetchLikedSongs,
  };
}
