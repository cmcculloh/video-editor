#!/bin/bash

# Set your file names here
EPISODE_NAME="EPISODE_03"
SOURCE_TO_MATCH="./public/$EPISODE_NAME.m4v"
FILE_TO_CHANGE="./public/INTRO.m4v"
OUTPUT_FILE="INTRO.m4v"

# Get properties from the reference file (source to match)
VIDEO_CODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")
AUDIO_CODEC=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")
FRAME_RATE=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")
RESOLUTION=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$SOURCE_TO_MATCH")
PIXEL_FORMAT=$(ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")
COLOR_SPACE=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_space -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")
COLOR_TRANSFER=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH")

# Re-encode the file to change to match the properties of the source to match
ffmpeg -i "$FILE_TO_CHANGE" -vcodec $VIDEO_CODEC -acodec $AUDIO_CODEC -r $FRAME_RATE -s $RESOLUTION -pix_fmt $PIXEL_FORMAT -colorspace $COLOR_SPACE -color_trc $COLOR_TRANSFER "$OUTPUT_FILE"

# Concatenate the files
ffmpeg -i ./public/INTRO.m4v -i EPISODE_03-TV-Edit.m4v -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" output.m4v
