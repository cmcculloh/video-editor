import moviepy.editor as mp

timestamps = [
    {"start": "00:04:15", "end": "00:04:35"},
    {"start": "00:09:30", "end": "00:10:16"},
]

input_file = "/Users/cmcculloh/Projects/video-maker/Wint3-004.mp4"
output_file = "Wint3-004-cut.mp4"

def time_str_to_seconds(time_str):
    h, m, s = map(int, time_str.split(":"))
    return h * 3600 + m * 60 + s

video = mp.VideoFileClip(input_file)
clips = [video.subclip(time_str_to_seconds(ts["start"]), time_str_to_seconds(ts["end"])) for ts in timestamps]

concatenated_clip = mp.concatenate_videoclips(clips)
concatenated_clip.write_videofile(output_file)
