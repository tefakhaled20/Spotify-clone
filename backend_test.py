import requests
import sys
import json
from datetime import datetime

class MusicStreamingAPITester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_spotify_search(self, query):
        """Test Spotify search functionality"""
        success, response = self.run_test(
            "Spotify Search",
            "GET",
            f"api/search?q={query}",
            200
        )
        
        if success:
            print(f"Found {len(response.get('tracks', []))} tracks")
            # Check if we have tracks with and without preview URLs
            has_preview = False
            missing_preview = False
            
            for track in response.get('tracks', []):
                if track.get('preview_url'):
                    has_preview = True
                else:
                    missing_preview = True
                    
            print(f"Tracks with Spotify previews: {has_preview}")
            print(f"Tracks without Spotify previews: {missing_preview}")
            
        return success, response

    def test_youtube_fallback(self, song_title, artist):
        """Test YouTube fallback functionality"""
        success, response = self.run_test(
            "YouTube Fallback",
            "GET",
            f"api/youtube?title={song_title}&artist={artist}",
            200
        )
        
        if success:
            print(f"YouTube URL found: {bool(response.get('url'))}")
            
        return success, response

def main():
    # Setup
    tester = MusicStreamingAPITester("http://localhost:8080")
    
    # Test popular song (likely to have Spotify preview)
    print("\n=== Testing Popular Song (likely to have Spotify preview) ===")
    success1, response1 = tester.test_spotify_search("Blinding Lights")
    
    # Test older/obscure song (less likely to have Spotify preview)
    print("\n=== Testing Older/Obscure Song (less likely to have Spotify preview) ===")
    success2, response2 = tester.test_spotify_search("Moonlight Sonata Beethoven")
    
    # Test YouTube fallback
    print("\n=== Testing YouTube Fallback ===")
    success3, response3 = tester.test_youtube_fallback("Moonlight Sonata", "Beethoven")
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())