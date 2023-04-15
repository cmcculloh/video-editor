curl -X POST -H "Content-Type: application/json" -d '{
  "youtubeUrl": "https://www.youtube.com/watch?v=VDhRtS-KLmY",
  "audioUrl": "https://www.youtube.com/watch?v=YJEnhffr5Vg",
  "localMp4Path": "Tenn1.MP4",
  "outputPath": "video.mp4"
}' http://localhost:3000/create
