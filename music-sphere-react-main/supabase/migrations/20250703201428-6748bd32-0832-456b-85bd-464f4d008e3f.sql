
-- Create a table to store liked songs
CREATE TABLE public.liked_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  cover_image TEXT,
  preview_url TEXT,
  duration_ms INTEGER,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spotify_track_id)
);

-- Enable Row Level Security
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for liked_songs table
CREATE POLICY "Users can view their own liked songs" 
  ON public.liked_songs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liked songs" 
  ON public.liked_songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked songs" 
  ON public.liked_songs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX idx_liked_songs_spotify_id ON public.liked_songs(spotify_track_id);
