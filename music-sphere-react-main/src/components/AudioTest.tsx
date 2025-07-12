import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/AudioContext';
import { Song } from '@/services/spotifyService';

// Mock song for testing YouTube videos
const mockSong: Song = {
  id: 'test-1',
  title: 'Test Video Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: '3:30',
  coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  audioUrl: null, // No audio URL since we're using YouTube videos
  spotifyId: 'test-1'
};

export function AudioTest() {
  const { currentSong, isPlaying, playSong, togglePlay, audioQueue } = useAudio();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testPlaySong = () => {
    try {
      addTestResult('Attempting to play mock song...');
      playSong(mockSong);
      addTestResult('Play song function called successfully');
    } catch (error) {
      addTestResult(`Error playing song: ${error}`);
    }
  };

  const testTogglePlay = () => {
    try {
      addTestResult('Attempting to toggle play...');
      togglePlay();
      addTestResult('Toggle play function called successfully');
    } catch (error) {
      addTestResult(`Error toggling play: ${error}`);
    }
  };

  const testAddToQueue = () => {
    try {
      addTestResult('Attempting to add to queue...');
      audioQueue.addToQueue(mockSong);
      addTestResult('Add to queue function called successfully');
    } catch (error) {
      addTestResult(`Error adding to queue: ${error}`);
    }
  };

  const testYouTubeVideo = () => {
    try {
      addTestResult('Testing YouTube video playback...');
      const videoSong: Song = {
        id: 'youtube-test',
        title: 'Despacito',
        artist: 'Luis Fonsi',
        album: 'Vida',
        duration: '4:41',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: null,
        spotifyId: 'youtube-test'
      };
      addTestResult(`Created video song: ${videoSong.title} by ${videoSong.artist}`);
      playSong(videoSong);
      addTestResult('YouTube video should now be loading');
    } catch (error) {
      addTestResult(`Error testing YouTube video: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-lg p-4 w-80 max-h-96 overflow-y-auto z-50">
      <h3 className="text-white font-semibold mb-4">Video Player Test</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={testPlaySong} className="w-full">
          Test Play Song
        </Button>
        <Button onClick={testTogglePlay} className="w-full">
          Test Toggle Play
        </Button>
        <Button onClick={testAddToQueue} className="w-full">
          Test Add to Queue
        </Button>
        <Button onClick={testYouTubeVideo} className="w-full">
          Test YouTube Video
        </Button>
      </div>

      <div className="text-xs text-gray-400 mb-4">
        <div>Current Song: {currentSong?.title || 'None'}</div>
        <div>Is Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Queue Length: {audioQueue.queue.length}</div>
      </div>

      <div className="text-xs">
        <h4 className="text-white mb-2">Test Results:</h4>
        {testResults.map((result, index) => (
          <div key={index} className="text-gray-400 mb-1">{result}</div>
        ))}
      </div>
    </div>
  );
} 