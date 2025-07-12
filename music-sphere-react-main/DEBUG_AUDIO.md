# Audio System Debugging Guide

## 🐛 Common Issues and Solutions

### 1. **Songs Not Loading**
**Symptoms**: No songs appear in the search results
**Possible Causes**:
- Spotify API not configured properly
- Supabase function not deployed
- Network connectivity issues

**Debug Steps**:
1. Check browser console for errors
2. Verify Spotify client credentials are set
3. Test Supabase function directly
4. Check network tab for failed requests

### 2. **Play Button Not Working**
**Symptoms**: Clicking play button does nothing
**Possible Causes**:
- AudioContext not properly initialized
- Event handlers not connected
- State management issues

**Debug Steps**:
1. Check if `onPlay` prop is passed correctly
2. Verify AudioContext is working
3. Check console for JavaScript errors
4. Test with the AudioTest component

### 3. **Audio Not Playing**
**Symptoms**: Play button works but no sound
**Possible Causes**:
- No audio URL available
- Audio format not supported
- Browser autoplay restrictions
- CORS issues

**Debug Steps**:
1. Check if `song.audioUrl` exists
2. Verify audio URL is accessible
3. Check browser autoplay settings
4. Test with different audio sources

### 4. **Queue Not Working**
**Symptoms**: Can't add songs to queue
**Possible Causes**:
- useAudioQueue hook not working
- State not updating properly
- Component not re-rendering

**Debug Steps**:
1. Check queue state in AudioTest component
2. Verify addToQueue function is called
3. Check if queue updates are reflected in UI

## 🔧 Debugging Tools

### AudioTest Component
The AudioTest component provides:
- Test buttons for core functions
- Real-time state display
- Error logging
- Queue management testing

### Console Logging
Look for these log messages:
- `🎵 AudioContext: Playing song:` - Audio context working
- `🎵 AudioPlayer: Loading audio for song:` - Audio player loading
- `🎵 AudioPlayer: Starting playback for:` - Playback starting

### Browser DevTools
1. **Console Tab**: Check for errors and debug logs
2. **Network Tab**: Monitor API calls and audio requests
3. **Application Tab**: Check localStorage and session storage
4. **Elements Tab**: Verify component structure

## 🚀 Quick Fixes

### 1. **Reset Audio Context**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. **Test Audio URL**
```javascript
// In browser console
const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
audio.play();
```

### 3. **Check Spotify Token**
```javascript
// In browser console
fetch('/api/spotify-auth')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 📋 Checklist

### Environment Setup
- [ ] Supabase project configured
- [ ] Spotify API credentials set
- [ ] Supabase functions deployed
- [ ] Environment variables set

### Audio System
- [ ] AudioContext provider wrapping app
- [ ] useAudio hook working
- [ ] AudioPlayer component receiving props
- [ ] Audio URLs accessible

### User Interface
- [ ] Song cards rendering
- [ ] Play buttons visible
- [ ] Click handlers working
- [ ] State updates reflected in UI

### Browser Compatibility
- [ ] Audio API supported
- [ ] Autoplay policy allows audio
- [ ] CORS headers set correctly
- [ ] No console errors

## 🆘 Getting Help

If issues persist:
1. Check the browser console for specific error messages
2. Use the AudioTest component to isolate the problem
3. Verify all dependencies are installed
4. Test with different browsers
5. Check network connectivity and firewall settings 