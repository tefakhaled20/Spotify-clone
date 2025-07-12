
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface PlaylistCreatorProps {
  onPlaylistCreated: () => void;
}

export function PlaylistCreator({ onPlaylistCreated }: PlaylistCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreatePlaylist = async () => {
    if (!user || !name.trim()) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Playlist created",
        description: `"${name}" has been created successfully.`,
      });

      setName("");
      setDescription("");
      setIsOpen(false);
      onPlaylistCreated();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-black hover:text-green-400 hover:bg-white/10 transition-all duration-200 mb-2 text-base font-medium"
        >
          <Plus className="mr-3 h-4 w-4" />
          <span className="font-medium drop-shadow-sm">Create Playlist</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Playlist Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Description (optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter playlist description"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={!name.trim() || isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
