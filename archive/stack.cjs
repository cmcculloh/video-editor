const { exec } = require("child_process");
const path = require("path");

const inputVideo1 = path.join(__dirname, "Tenn1.mp4");
const inputVideo2 = path.join(__dirname, "Wint3-004.mp4");
const outputVideo = path.join(__dirname, "combinedAndStacked.mp4");

// Specify timestamps as an array of start and end times (in "HH:mm:ss" format)
const timestamps = [
	{ start: "00:04:15", end: "00:04:35" }, // 4:15-4:35
	{ start: "00:09:30", end: "00:10:16" }, // 9:30-10:16
];

const createTrimFilter = (timestamps, inputIndex) =>
	timestamps
		.map(
			(time, i) =>
				`[${inputIndex}:v]trim=start='${time.start}':end='${time.end}',setpts=PTS-STARTPTS[v${inputIndex}_${i}]`
		)
		.join(";");

const createVstackFilter = (timestamps) =>
	timestamps.map((_, i) => `[v0][v${i + 1}]vstack`).join(";");

const trimFilter = createTrimFilter(timestamps, 1);
const vstackFilter = createVstackFilter(timestamps);

const ffmpegCommand = `ffmpeg -i "${inputVideo1}" -i "${inputVideo2}" -filter_complex "[0:v]scale=-1:480[v0];${trimFilter};${vstackFilter}" -y "${outputVideo}"`;

exec(ffmpegCommand, (error, stdout, stderr) => {
	if (error) {
		console.error("Error while processing videos:", error);
		return;
	}

	console.log("Videos combined successfully");
});

// const ffmpeg = require("fluent-ffmpeg");
// const ffmpegPath = require("ffmpeg-static");
// const ffprobePath = require("ffprobe-static");

// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath);

// const { exec } = require("child_process");

// const path = require("path");

// const inputVideo1 = path.join(__dirname, "Tenn1.mp4");
// const inputVideo2 = path.join(__dirname, "Wint3-004.mp4");
// const outputVideo = path.join(__dirname, "combinedVideo.mp4");

// const ffmpegCommand = `ffmpeg -i "${inputVideo1}" -i "${inputVideo2}" -filter_complex "[0:v]scale=-1:480[v0];[1:v]scale=-1:480[v1];[v0][v1]vstack" -y "${outputVideo}"`;

// exec(ffmpegCommand, (error, stdout, stderr) => {
// 	if (error) {
// 		console.error("Error while processing videos:", error);
// 		return;
// 	}

// 	console.log("Videos combined successfully");
// });

// ffmpeg()
// 	.input(inputVideo1)
// 	.input(inputVideo2)
// 	.complexFilter([
// 		"[0:v]scale=-1:480[v0]", // Adjust the height of the first video to 480 pixels (keep aspect ratio)
// 		"[1:v]scale=-1:480[v1]", // Adjust the height of the second video to 480 pixels (keep aspect ratio)
// 		"[v0][v1]vstack", // Stack the videos vertically
// 	])
// 	.on("error", (error) => {
// 		console.error("Error while processing videos:", error);
// 	})
// 	.on("progress", (progress) => {
// 		console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
// 	})
// 	.on("end", () => {
// 		console.log("Videos combined successfully");
// 	})
// 	.save(outputVideo);
