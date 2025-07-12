
import { Home, Search, Library, Heart, Music } from "lucide-react";
import { Sidebar as SidebarWrapper, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { PlaylistCreator } from "./PlaylistCreator";
import { useUserPlaylists } from "@/hooks/useUserPlaylists";

const menuItems = [
  { title: "Home", icon: Home, url: "/" },
  { title: "Search", icon: Search, url: "/search" },
  { title: "Your Library", icon: Library, url: "/library" },
];

interface SidebarProps {
  showLikedSongs?: boolean;
  onShowLikedSongsChange?: (show: boolean) => void;
  showLibrary?: boolean;
  onShowLibraryChange?: (show: boolean) => void;
  selectedPlaylist?: string | null;
  onSelectPlaylist?: (playlistId: string | null) => void;
  onClearSearch?: () => void;
}

export function Sidebar({ 
  showLikedSongs = false, 
  onShowLikedSongsChange,
  showLibrary = false,
  onShowLibraryChange,
  selectedPlaylist,
  onSelectPlaylist,
  onClearSearch
}: SidebarProps) {
  const { playlists, fetchPlaylists } = useUserPlaylists();

  const handleLibraryClick = () => {
    onShowLibraryChange?.(!showLibrary);
    onShowLikedSongsChange?.(false);
    onSelectPlaylist?.(null);
  };

  const handleLikedSongsClick = () => {
    onShowLikedSongsChange?.(!showLikedSongs);
    onShowLibraryChange?.(false);
    onSelectPlaylist?.(null);
  };

  const handleHomeClick = () => {
    // Clear all states to return to home page
    onShowLikedSongsChange?.(false);
    onShowLibraryChange?.(false);
    onSelectPlaylist?.(null);
    onClearSearch?.();
  };

  const handlePlaylistClick = (playlistId: string) => {
    onSelectPlaylist?.(playlistId);
    onShowLikedSongsChange?.(false);
    onShowLibraryChange?.(false);
  };

  return (
    <SidebarWrapper className="w-64 bg-black/80 backdrop-blur-sm border-r border-green-500/30 text-black">
      <SidebarContent className="p-6">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <img src="/spotify-logo.svg" alt="Music Sphere Logo" className="w-10 h-10 mr-3 rounded-full bg-white" />
            <h1 className="text-2xl font-bold text-green-400 drop-shadow-lg">Music Sphere</h1>
          </div>
        </div>

        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={
                    item.title === "Home" ? handleHomeClick :
                    item.title === "Your Library" ? handleLibraryClick : 
                    undefined
                  }
                  className={`w-full justify-start transition-all duration-200 mb-2 text-base font-medium ${
                    (item.title === "Home" && !showLikedSongs && !showLibrary && !selectedPlaylist) ||
                    (item.title === "Your Library" && showLibrary) 
                      ? 'text-green-400 bg-white/20 font-semibold shadow-md' 
                      : 'text-black hover:text-green-400 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="font-medium text-base drop-shadow-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <div className="my-6 border-t border-gray-600/50"></div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black uppercase text-sm font-bold mb-4 drop-shadow-sm tracking-wide">
            My Music
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <PlaylistCreator onPlaylistCreated={fetchPlaylists} />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLikedSongsClick}
                  className={`w-full justify-start transition-all duration-200 mb-2 text-base font-medium ${
                    showLikedSongs 
                      ? 'text-green-400 bg-white/20 font-semibold shadow-md' 
                      : 'text-black hover:text-green-400 hover:bg-white/10'
                  }`}
                >
                  <Heart className="mr-3 h-4 w-4" fill={showLikedSongs ? "currentColor" : "none"} />
                  <span className="text-base font-medium drop-shadow-sm">Liked Songs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {playlists.map((playlist) => (
                <SidebarMenuItem key={playlist.id}>
                  <SidebarMenuButton 
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className={`w-full justify-start transition-all duration-200 mb-1 text-sm font-medium ${
                      selectedPlaylist === playlist.id
                        ? 'text-green-400 bg-white/20 font-semibold shadow-md'
                        : 'text-black hover:text-green-400 hover:bg-white/10'
                    }`}
                  >
                    <Music className="mr-3 h-4 w-4" />
                    <span className="text-sm truncate font-medium drop-shadow-sm">{playlist.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarWrapper>
  );
}
