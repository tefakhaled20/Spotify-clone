
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Song } from "@/services/spotifyService";
import { useLikedSongs } from "@/hooks/useLikedSongs";
import { useUserPlaylists } from "@/hooks/useUserPlaylists";

const Index = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikedSongs, setShowLikedSongs] = useState(false);
  
  const { user, signOut, loading } = useAuth();
  const { isLiked, toggleLike } = useLikedSongs();
  const { currentPlaylist } = useUserPlaylists();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handlePlaySong = (song: Song, songList?: Song[]) => {
    console.log('Playing song:', song.title, 'by', song.artist);
    
    if (currentSong?.spotifyId === song.spotifyId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      
      if (songList) {
        setPlaylist(songList);
        const index = songList.findIndex(s => s.spotifyId === song.spotifyId);
        setCurrentIndex(index);
        console.log('Setting playlist with', songList.length, 'songs, current index:', index);
      }
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
    console.log('Next song:', playlist[nextIndex].title);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
    console.log('Previous song:', playlist[prevIndex].title);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-green-900 text-white flex w-full">
        <Sidebar 
          showLikedSongs={showLikedSongs}
          onShowLikedSongsChange={setShowLikedSongs}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <div className="text-sm text-gray-300">
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <MainContent 
            songs={[]}
            onPlaySong={handlePlaySong}
            currentSong={currentSong}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showLikedSongs={showLikedSongs}
            onShowLikedSongsChange={setShowLikedSongs}
          />
        </div>
        {currentSong && (
          <AudioPlayer 
            song={currentSong}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNext={playlist.length > 1 ? handleNext : undefined}
            onPrevious={playlist.length > 1 ? handlePrevious : undefined}
            isLiked={isLiked(currentSong.spotifyId)}
            onToggleLike={() => toggleLike(currentSong)}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;
