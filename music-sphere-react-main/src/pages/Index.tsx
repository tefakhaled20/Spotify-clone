
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { QueueManager } from "@/components/QueueManager";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Song } from "@/services/spotifyService";
import { useLikedSongs } from "@/hooks/useLikedSongs";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLikedSongs, setShowLikedSongs] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const { user, signOut, loading } = useAuth();
  const { isLiked, toggleLike } = useLikedSongs();
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    nextSong, 
    previousSong,
    audioQueue 
  } = useAudio();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handlePlaySong = (song: Song, songList?: Song[]) => {
    console.log('Playing song:', song.title, 'by', song.artist);
    playSong(song, songList);
    setShowVideo(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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
          showLibrary={showLibrary}
          onShowLibraryChange={setShowLibrary}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={setSelectedPlaylist}
          onClearSearch={handleClearSearch}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Welcome back, {user.user_metadata?.full_name || user.email}!
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white bg-transparent border-none"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <MainContent 
            onPlaySong={handlePlaySong}
            currentSong={currentSong}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showLikedSongs={showLikedSongs}
            onShowLikedSongsChange={setShowLikedSongs}
            showLibrary={showLibrary}
            selectedPlaylist={selectedPlaylist}
            onSelectPlaylist={setSelectedPlaylist}
          />
        </div>
        {currentSong && (
          <>
            {showVideo ? (
              <YouTubePlayer 
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={audioQueue.hasNext ? nextSong : undefined}
                onPrevious={audioQueue.hasPrevious ? previousSong : undefined}
                isLiked={isLiked(currentSong.spotifyId)}
                onToggleLike={() => toggleLike(currentSong)}
                onShowQueue={() => setShowQueue(true)}
                onExit={() => setShowVideo(false)}
              />
            ) : (
              <AudioPlayer 
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={audioQueue.hasNext ? nextSong : undefined}
                onPrevious={audioQueue.hasPrevious ? previousSong : undefined}
                isLiked={isLiked(currentSong.spotifyId)}
                onToggleLike={() => toggleLike(currentSong)}
                onShowQueue={() => setShowQueue(true)}
              />
            )}
            
            {/* Video minimized indicator */}
            {currentSong && !showVideo && (
              <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg p-3 z-40">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentSong.coverImage}
                    alt={currentSong.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="text-white">
                    <p className="text-sm font-medium">{currentSong.title}</p>
                    <p className="text-xs text-gray-300">{currentSong.artist}</p>
                  </div>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    title="Show Video"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        <QueueManager
          isOpen={showQueue}
          onClose={() => setShowQueue(false)}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={(song) => handlePlaySong(song)}
          onTogglePlay={togglePlay}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
