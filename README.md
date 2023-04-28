# Auto Video Editor

The code in this repository was built _almost entirely_ by ChatGPT 4. This was a series of experiments to see how much ChatGPT 4 could do on its own without my changing a single line of code. I would describe a problem or goal I had, ChatGPT would give me some code, I'd run the code and feed ChatGPT the output if it error'd. If it worked, I'd describe the next freature/modification I wanted in the program. There were several places that ChatGPT just _could not_ figure out what was wrong or what to do that I had to step in and do it myself, but by-and-large, everything here was generated based on me writing the correct prompts/guidance to ChatGPT.

The documentation below _this line_ was (almost) entirely ChatGPT4 generated.

## Table of Contents
- [YT Playlist Download](#playlist-download-playlist_downloadmjs)
- [TV Edit Creator](#tv-edit-generator)
- [Robots Editing Video](#robots-editing-video)

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

1. Run the server by executing `node video_editor_server.cjs` in the terminal.
2. Open a web browser and visit `http://localhost:3000/video_editor.html` to view the video editor interface.
3. Use the video editor interface to create cuts by clicking the "Cut Start" and "Cut End" buttons. The cutlist will be displayed on the page.
4. Click the "Copy Cutlist" button to copy the cutlist to your clipboard.

### Step 2: Create a tv-edit-list.cjs file

1. Create a new file named "tv-edit-list.cjs" and paste the cutlist from your clipboard into this file, following the example provided.
2. Export the cutlist as a module using `module.exports = cutList;`.

### Step 3: Update edit_video.cjs

1. Make sure that "edit_video.cjs" and "tv-edit-list.cjs" are in the same directory.
2. Update the paths in "edit_video.cjs" to match the location of the input video (in this case, `./public/spiderman.mp4`), the output video (e.g., `spiderman-TV-Edit.mp4`), and the cutlist (e.g., `./tv-edit-list.cjs`).

### Step 4: Run the edit_video.cjs script

1. Run the "edit_video.cjs" script by executing `node edit_video.cjs` in the terminal.
2. The script processes the input video according to the cutlist, creating a new output video with the specified cuts.

The "edit_video.cjs" script reads the cutlist from "tv-edit-list.cjs", processes the input video by cutting the specified segments, and concatenates the remaining segments to create a new output video. The script uses the `fluent-ffmpeg` library to perform video editing operations, and the `async` library to handle asynchronous processing.


## Robots Editing Video

![Dystopian Muppet Editing Video](dystopian_muppet_editing_video_dcdba8f8-2808-4662-bb99-011401d36cc2.png)
![Dystopian Robot Editing Video](dystopian_robot_editing_video_76080b4f-eda8-4c9a-816d-c4c0e600c294.png)
![Grid 0](grid_0.webp)
![Pitted Rusty Robot Smiling Editing Video at Compu](pitted_rusty_robot_smiling_editing_video_at_compu_cb77ea93-2175-4ed1-a288-ba809b39c4c8.png)
![Robot Editing Video on Computer Camera Equipment 1](robot_editing_video_on_computer_camera_equipment__2029fdee-a433-4273-bc8b-713d1d9ab6b7.png)
![Robot Editing Video on Computer Camera Equipment 2](robot_editing_video_on_computer_camera_equipment__7174e172-f56a-4028-9792-1a57a4d156db.png)
![Robot Video Editor 1](robot_video_editor_8ab517b4-f9c7-43a7-be9b-bf98d7afd08a.png)
![Robot Video Editor 2](robot_video_editor_c24a3cbd-6053-4d4d-9329-f26a9d97cea5.png)
![Very Complicated Looking Robot with Film Lenses](very_complicated_looking_robot_with_film_lenses_a_04c8cd82-bf63-4300-b686-be77e8f06ee8.png)
