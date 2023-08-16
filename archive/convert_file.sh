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

# Concatenate the files THIS ONE WORKS!
ffmpeg -i ./public/INTRO-bak.m4v -i EPISODE_07-TV-Edit.m4v -filter_complex "[0:v:0][0:a:0][1:v:0][1:a:0]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" EPISODE_07.m4v




# NOTHING BELOW HERE WORKS
SOURCE_TO_MATCH="./public/EPISODE_05.m4v"
FILE_TO_CHANGE="./public/INTRO.m4v"

ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels "$SOURCE_TO_MATCH"
ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels "$FILE_TO_CHANGE"




#!/bin/bash

SOURCE_TO_MATCH="./public/EPISODE_05.m4v"
FILE_TO_CHANGE="./public/INTRO.m4v"
OUTPUT_FILE="converted_INTRO.m4v"

ffmpeg -i "$FILE_TO_CHANGE" \
       -c:v libx264 \
       -r 24000/1001 \
       -s 720x480 \
       -c:a aac \
       -ar 48000 \
       -strict experimental \
       "$OUTPUT_FILE"



SOURCE_TO_MATCH="./public/EPISODE_06.m4v"

ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams a:0 -show_entries stream=channels -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=color_space -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=color_primaries -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams v:0 -show_entries stream=field_order -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -show_entries stream=profile,level -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams a -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"
ffmpeg -i "$SOURCE_TO_MATCH"
ffprobe -v error -select_streams a -show_entries stream=sample_fmt -of default=noprint_wrappers=1:nokey=1 "$SOURCE_TO_MATCH"



ffmpeg -i ./public/INTRO.m4v \
       -c:v libx264 -profile:v high -level:v 3.1 \
       -pix_fmt yuv420p -vf "scale=720:480" -r 24 \
       -c:a aac -b:a 164k -ac 2 -ar 48000 \
       -colorspace smpte170m -color_trc bt709 -color_primaries smpte170m \
       ./public/fixed_INTRO.m4v


ffmpeg -i ./public/INTRO.m4v \
-filter_complex "[0:v]fps=fps=24/1,scale=720:480,setsar=sar=32/27[video];[0:a]aresample=48000[aud]" \
-c:v h264 -profile:v high -level 31 -pix_fmt yuv420p -colorspace smpte170m -color_trc bt709 -color_primaries smpte170m \
-c:a aac -ac 2 -b:a 164k -ar 48000 \
./public/fixed_INTRO.m4v
