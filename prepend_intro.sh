#!/bin/bash

# Check if the right number of arguments are provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./prepend_intro.sh <episode>"
    exit 1
fi

INTRO_VIDEO="./public/PR_INTRO.mp4"
EPISODE_STRING="$1"
EPISODE_VIDEO="${EPISODE_STRING}-TV-Edit.m4v"
OUTPUT="${EPISODE_STRING}.mp4"

echo "Concatenating $INTRO_VIDEO and $EPISODE_VIDEO to $OUTPUT..."

# Rescale both videos to a standard resolution of 720x456
ffmpeg -i "$INTRO_VIDEO" -vf "scale=720:456" intro_rescaled.mp4
ffmpeg -i "$EPISODE_VIDEO" -vf "scale=720:456" episode_rescaled.mp4

# Concatenate the rescaled videos
ffmpeg -f concat -safe 0 -i <(echo "file '$PWD/intro_rescaled.mp4'"; echo "file '$PWD/episode_rescaled.mp4'") -c copy "$OUTPUT"

# Clean up temporary files
rm intro_rescaled.mp4 episode_rescaled.mp4

echo "Videos concatenated successfully to $OUTPUT!"
