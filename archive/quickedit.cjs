const { exec } = require("child_process");
const path = require("path");

const inputVideo2 = path.join(__dirname, "Tenn1.MP4");
const inputVideo1 = path.join(__dirname, "Wint3-004.MP4");
const outputVideo = path.join(__dirname, "combinedVideo1.mp4");

// Specify the timestamps as an array of objects with 'start' and 'end' properties
const timestamps = [
	{ start: "00:04:15", end: "00:04:35" }, // 4:15-4:35
	{ start: "00:09:30", end: "00:10:16" }, // 9:30-10:16
	// Add more timestamp ranges if needed
];

const inputVideo1Segments = timestamps
	.map(
		(timestamp, index) =>
			`[0:v]trim=start=${timestamp.start}:end=${timestamp.end},setpts=PTS-STARTPTS[v${index}];[0:a]atrim=start=${timestamp.start}:end=${timestamp.end},asetpts=PTS-STARTPTS[a${index}];`
	)
	.join("");

const stackingFilter = `[v0][v1]vstack=inputs=2[outv]`;

const audioConcatFilter =
	timestamps
		.map((_, index) => `[a${index}]`)
		.concat("[1:a]")
		.join("") + `concat=n=${timestamps.length + 1}:v=0:a=1[outa]`;

const filterComplex = inputVideo1Segments + stackingFilter + ";" + audioConcatFilter;

const ffmpegCommand = `ffmpeg -i "${inputVideo1}" -i "${inputVideo2}" -filter_complex "${filterComplex}" -map "[outv]" -map "[outa]" -y "${outputVideo}"`;

console.log("ffmpeg command:", ffmpegCommand)

exec(ffmpegCommand, (error, stdout, stderr) => {
	if (error) {
		console.error("Error while processing videos:", error);
		return;
	}

	console.log("Videos combined successfully");
});