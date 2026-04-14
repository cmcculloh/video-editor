#!/bin/bash

# Check if the right number of arguments are provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./prepend_intro.sh <episode>"
    exit 1
fi

PROMO_STRING="kid-buu-premiered"
PROMO_VIDEO="./public/${PROMO_STRING}.mp4"

INTRO_STRING="teen-gohan-intro"
# INTRO_STRING="rtd_blueray_final" # This intro was made by downloading the intro from youtube, importing an episode into premiere, putting it on the timeline, bringing the intro in, deleting the episode, and exporting the intro.
# INTRO_VIDEO="./public/rtddbzintro.mp4" # This intro was made by importing an episode into premiere, putting it on the timeline, bringing the intro in, deleting the episode, and exporting the intro.
INTRO_VIDEO="./public/${INTRO_STRING}.mp4" # This was downloaded from youtube
EPISODE_STRING="$1"
EPISODE_VIDEO="${EPISODE_STRING}-TV-Edit.mp4"
OUTPUT="${EPISODE_STRING}.mp4"

OUTRO_STRING="Buu_outro_japanese_premiered"
OUTRO_VIDEO="./public/${OUTRO_STRING}.mp4"

echo "Concatenating $INTRO_VIDEO and $EPISODE_VIDEO to $OUTPUT..."

# Rescale both videos to a standard resolution of 720x456
# ffmpeg -i "$PROMO_VIDEO" -vf "scale=720:456" "${PROMO_STRING}_rescaled.mp4"
# ffmpeg -i "$INTRO_VIDEO" -vf "scale=720:456" "${INTRO_STRING}_rescaled.mp4"
ffmpeg -i "$EPISODE_VIDEO" -vf "scale=720:456" -vcodec libx264 -acodec aac "${EPISODE_STRING}_rescaled.mp4"
# ffmpeg -i "$OUTRO_VIDEO" -vf "scale=720:456" "${OUTRO_STRING}_rescaled.mp4"

# Concatenate the rescaled videos
# ffmpeg -f concat -safe 0 -i <(echo "file '$PWD/public/intro_rescaled.mp4'"; echo "file '$PWD/episode_rescaled.mp4'") -c copy "$OUTPUT"
# ffmpeg -f concat -safe 0 -i <(echo "file '$PWD/public/${PROMO_STRING}_rescaled.mp4'"; echo "file '$PWD/public/${INTRO_STRING}_rescaled.mp4'"; echo "file '$PWD/${EPISODE_STRING}_rescaled.mp4'"; echo "file '$PWD/public/${OUTRO_STRING}_rescaled.mp4'") -c copy "$OUTPUT"
# ffmpeg -f concat -safe 0 -i <(echo "file '$PWD/public/${PROMO_STRING}_rescaled.mp4'"; echo "file '$PWD/${EPISODE_STRING}_rescaled.mp4'"; echo "file '$PWD/public/${OUTRO_STRING}_rescaled.mp4'") -c copy "$OUTPUT"
ffmpeg -f concat -safe 0 -i <(echo "file '$PWD/public/${PROMO_STRING}_rescaled.mp4'"; echo "file '$PWD/${EPISODE_STRING}_rescaled.mp4'") -c copy "$OUTPUT"

# Clean up temporary files
# rm "${EPISODE_STRING}_rescaled.mp4"

echo "Videos concatenated successfully to $OUTPUT!"
