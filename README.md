# Auto Video Editor

The code in this repository was built _almost entirely_ by ChatGPT 4. This was a series of experiments to see how much ChatGPT 4 could do on its own without my changing a single line of code. I would describe a problem or goal I had, ChatGPT would give me some code, I'd run the code and feed ChatGPT the output if it error'd. If it worked, I'd describe the next freature/modification I wanted in the program. There were several places that ChatGPT just _could not_ figure out what was wrong or what to do that I had to step in and do it myself, but by-and-large, everything here was generated based on me writing the correct prompts/guidance to ChatGPT.

Even the documentation below _this line_ was (almost) entirely ChatGPT4 generated.

## Playlist Download (playlist_download.mjs)

This is a script to download video playlists from YouTube using Node.js. It downloads the videos and stores them in the specified folder with season and episode numbers (optional).

### Requirements

- Node.js 12.x or higher
- ffmpeg

### Dependencies

To install the necessary dependencies, run the following command:

```bash
npm install axios node-fetch yt-dlp
```

### Usage

1. Place the `playlist_download.mjs` file in your project folder.

2. Change `const defaultRoot = "/volume1/McCullohShare/Plex/TV";` to fit your environment needs.

3. Create a file named `cookies.txt` in the same folder as `playlist_download.mjs`. This file should contain your YouTube login cookies to allow the script to access restricted content.

4. Run the script using the following command:

```bash
node playlist_download.mjs [playlist_URL] [folder_name] [--no-season] [--no-episode]
```

Replace `[playlist_URL]` with the URL of the YouTube playlist or channel you want to download. Replace `[folder_name]` with the name of the folder where you want to store the downloaded videos. If you want to skip adding season and/or episode numbers to the video file names, add the `--no-season` and/or `--no-episode` flags.

### Examples

- To download a playlist and store the videos in a folder called "MyPlaylist" without adding season and episode numbers:

```bash
node playlist_download.mjs "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx" "MyPlaylist" --no-episode
```

- To download a playlist and store the videos in a folder called "MyPlaylist" without adding season numbers:

```bash
node playlist_download.mjs "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx" "MyPlaylist" --no-season
```

- To download a channel's videos and store them in a folder called "MyChannel" with season and episode numbers:

```bash
node playlist_download.mjs "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxx/videos" "MyChannel"
```

### Notes

- This script uses the following directory structure for storing downloaded videos: `/volume1/Plex/TV/[folder_name]`
- The downloaded videos will be saved in MP4 format.
