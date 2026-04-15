# Auto Video Editor

![Very Complicated Looking Robot with Film Lenses](./public/imgs/very_complicated_looking_robot_with_film_lenses_a_04c8cd82-bf63-4300-b686-be77e8f06ee8.png)

The code in this repository was built _almost entirely_ by ChatGPT 4. This was a series of experiments to see how much ChatGPT 4 could do on its own without my changing a single line of code. I would describe a problem or goal I had, ChatGPT would give me some code, I'd run the code and feed ChatGPT the output if it error'd. If it worked, I'd describe the next freature/modification I wanted in the program. There were several places that ChatGPT just _could not_ figure out what was wrong or what to do that I had to step in and do it myself, but by-and-large, everything here was generated based on me writing the correct prompts/guidance to ChatGPT.

The documentation below _this line_ was (almost) entirely ChatGPT4 generated.

## Table of Contents
- [Repo Layout](#repo-layout)
- [YT Playlist Download](#playlist-download)
- [TV Edit Creator](#tv-edit-generator)

## Repo Layout

- `src/` contains the web server and shared cutlist configuration.
- `scripts/video/` contains command-line video processing tools.
- `scripts/download/` contains playlist/channel download tools.
- `scripts/helpers/` contains one-off shell helpers.
- `data/` contains sample cut-list data used by older scripts.
- `cutlists/` contains saved TV edit cutlists.
- `public/` contains the web UI and static image assets.
- `archive/` contains older experimental scripts kept for reference.

## Playlist Download

This is a script to download video playlists from YouTube using Node.js. It downloads the videos and stores them in the specified folder with season and episode numbers (optional). Previous downloads are cached, so if more videos are added to the playlist and you run it again, it will only download the new videos.

### Requirements

- Node.js 12.x or higher
- ffmpeg

### Dependencies

To install the necessary dependencies, run the following command:

```bash
npm install axios node-fetch yt-dlp
```

### Usage

1. Update `defaultRoot` in `scripts/download/playlist-download.mjs` to fit your environment.

2. Create a `www.youtube.com_cookies.txt` file in the repo root. This file should contain your YouTube login cookies to allow the script to access restricted content.

3. Run the script using the following command:

```bash
npm run download:playlist -- [playlist_URL] [folder_name] [--no-season] [--no-episode]
```

Replace `[playlist_URL]` with the URL of the YouTube playlist or channel you want to download. Replace `[folder_name]` with the name of the folder where you want to store the downloaded videos. If you want to skip adding season and/or episode numbers to the video file names, add the `--no-season` and/or `--no-episode` flags.

### Examples

- To download a playlist and store the videos in a folder called "MyPlaylist" without adding season and episode numbers:

```bash
npm run download:playlist -- "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx" "MyPlaylist" --no-episode
```

- To download a playlist and store the videos in a folder called "MyPlaylist" without adding season numbers:

```bash
npm run download:playlist -- "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx" "MyPlaylist" --no-season
```

- To download a channel's videos and store them in a folder called "MyChannel" with season and episode numbers:

```bash
npm run download:playlist -- "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxx/videos" "MyChannel"
```

### Notes

- This script uses the following directory structure for storing downloaded videos: `/volume1/Plex/TV/[folder_name]`
- The downloaded videos will be saved in MP4 format.


# TV Edit Generator

This project provides a simple video editor web interface to create a cutlist for a video file, and a script to process the input video according to the cutlist.

## Prerequisites

- Node.js (v12 or later)
- FFmpeg

### Installing FFmpeg

On macOS, you can install FFmpeg using Homebrew:

```bash
brew install ffmpeg
```

For other platforms, follow the installation instructions on the [FFmpeg website](https://ffmpeg.org/download.html).

## Dependencies

To install required Node.js dependencies, run:

```bash
npm install
```

## Usage

### Step 1: Create a cutlist

1. Run the server by executing `npm start` or `node src/server.cjs` in the terminal.
2. Open a web browser and visit `http://localhost:3000/` to view the video editor interface.
3. Choose a local video, then use the "Cut Start" and "Cut End" buttons to create ranges.
4. Select a cut to choose its reason category, VidAngel-style filter, and optional note.
5. Before sharing a cutlist, use "Episode Match" to search TVmaze and choose the canonical show episode for the file.
6. Click "Save Cutlist" to save the local cuts, intro/outro choices, episode identity, and cut reasons.

Saved cutlists can include per-cut `reason` objects, plus an `episodeIdentity` object with a canonical ID like `tvmaze:episode:163555`, the TVmaze show and episode IDs, season and episode numbers, and external show IDs such as IMDb or TheTVDB when TVmaze provides them. This gives shared cutlists a stable episode key instead of relying only on the local filename.

### Step 2: Save or edit a cutlist

1. Use the web UI to save cutlists under `cutlists/`.
2. Edit the JSON files directly when you need to refine saved cut metadata.

### Step 3: Run the edit script

1. Run the edit script with `npm run editvideo -- <selected-video-filename>`.
2. The script processes the input video according to the cutlist, creating a new output video with the specified cuts.

The edit script reads saved cutlists from `cutlists/`, processes the input video by cutting the specified segments, and concatenates the remaining segments to create a new output video. The script uses the `fluent-ffmpeg` library to perform video editing operations, and the `async` library to handle asynchronous processing.

### BONUS STEP: Custom Intro

You can add a custom intro to your TV edits so that when you start watching one you know immediately whether you are watching the TV edit or not.

1. Create an `./public/INTRO.mp4` file
