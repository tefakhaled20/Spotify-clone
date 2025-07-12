
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  cover_image: string | null;
  is_public: boolean | null;
  user_id: string;
}

export function useUserPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlaylists = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playlists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      toast({
        title: "Playlist deleted",
        description: "Playlist has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  return {
    playlists,
    loading,
    fetchPlaylists,
    deletePlaylist,
  };
}
