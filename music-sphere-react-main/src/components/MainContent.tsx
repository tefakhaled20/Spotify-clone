
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Song, spotifyService } from "@/services/spotifyService";
import { SongCard } from "./SongCard";
import { Library } from "./Library";
import { PlaylistView } from "./PlaylistView";
import { useLikedSongs } from "@/hooks/useLikedSongs";

interface MainContentProps {
  onPlaySong: (song: Song, songList?: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showLikedSongs: boolean;
  onShowLikedSongsChange: (show: boolean) => void;
  showLibrary?: boolean;
  selectedPlaylist?: string | null;
  onSelectPlaylist?: (playlistId: string | null) => void;
}

export function MainContent({
  onPlaySong,
  currentSong,
  isPlaying,
  searchQuery,
  onSearchChange,
  showLikedSongs,
  showLibrary = false,
  selectedPlaylist,
  onSelectPlaylist
}: MainContentProps) {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { likedSongs } = useLikedSongs();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await spotifyService.searchTracks(query);
      setSearchResults(results);
      console.log('Search results:', results.length, 'tracks found for:', query);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutoSearch = (query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500); // 500ms delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Clear timeout and search immediately on Enter
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      handleSearch();
    }
  };

  // Auto search effect
  useEffect(() => {
    if (searchQuery.trim()) {
      handleAutoSearch(searchQuery);
    } else {
      // Clear results when search query is empty
      setSearchResults([]);
      // Load popular tracks when no search query
      if (!showLikedSongs && !showLibrary && !selectedPlaylist) {
        const loadPopularTracks = async () => {
          try {
            const results = await spotifyService.searchTracks('top hits 2024');
            setSearchResults(results);
          } catch (error) {
            console.error('Error loading popular tracks:', error);
          }
        };
        loadPopularTracks();
      }
    }

    // Cleanup timeout on unmount or when searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, showLikedSongs, showLibrary, selectedPlaylist]);

  // Load popular tracks on initial load
  useEffect(() => {
    const loadPopularTracks = async () => {
      try {
        const results = await spotifyService.searchTracks('top hits 2024');
        setSearchResults(results);
      } catch (error) {
        console.error('Error loading popular tracks:', error);
      }
    };

    if (!showLikedSongs && !showLibrary && !selectedPlaylist && !searchQuery.trim()) {
      loadPopularTracks();
    }
  }, [showLikedSongs, showLibrary, selectedPlaylist, searchQuery]);

  // Show Library view
  if (showLibrary) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900/50 to-black/50 overflow-y-auto">
        <Library 
          onPlaySong={onPlaySong}
          currentSong={currentSong}
          isPlaying={isPlaying}
        />
      </div>
    );
  }

  // Show Playlist view
  if (selectedPlaylist) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900/50 to-black/50 overflow-y-auto">
        <PlaylistView 
          playlistId={selectedPlaylist}
          onPlaySong={onPlaySong}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaylistDeleted={() => onSelectPlaylist?.(null)}
        />
      </div>
    );
  }

  // Show Liked Songs view
  if (showLikedSongs) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900/50 to-black/50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-green-400 rounded-lg flex items-center justify-center mr-6">
              <span className="text-2xl">♥</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Liked Songs</h1>
              <p className="text-gray-400">{likedSongs.length} songs</p>
            </div>
          </div>

          {likedSongs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-white mb-4">No liked songs yet</h3>
              <p className="text-gray-400">Songs you like will appear here. Start exploring and like some music!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedSongs.map((song) => (
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
      </div>
    );
  }

  // Show Search/Home view
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900/50 to-black/50 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Discover Music"}
          </h1>
          <div className="flex gap-2 max-w-md">
            <Input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                // Auto search will be triggered by the useEffect
              }}
              onKeyPress={handleKeyPress}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-500"
            />
            <Button 
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
              title={isSearching ? "Searching..." : "Search (or press Enter)"}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((song) => (
              <SongCard
                key={song.spotifyId}
                song={song}
                onPlay={() => onPlaySong(song, searchResults)}
                isCurrentSong={currentSong?.spotifyId === song.spotifyId}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-white mb-4">No results found</h3>
            <p className="text-gray-400">Try searching with different keywords.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
