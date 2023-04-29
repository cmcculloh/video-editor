const { exec } = require("child_process");
const path = require("path");

const inputVideo = path.join(__dirname, "Wint3-004-H264.MP4");
const outputVideo = path.join(__dirname, "trimmedVideo1.mp4");

const timestamps = [
	{ start: "00:04:15", end: "00:04:35" },
	{ start: "00:09:30", end: "00:10:16" },
	// Add more timestamp ranges if needed
];

function generateTrimCommand(input, output, timestamps) {
	const filters = timestamps
		.map(
			({ start, end }, index) =>
				`[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${index}];[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${index}]`
		)
		.join(";");

	const streams = timestamps.map((_, index) => `[v${index}][a${index}]`).join("");

	return `ffmpeg -y -i ${input} -filter_complex "${filters};${streams}concat=n=${timestamps.length}:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" -c:v libx264 -crf 23 -preset ultrafast -c:a aac ${output}`;
}

const command = generateTrimCommand(inputVideo, outputVideo, timestamps);

console.log("Generated FFmpeg command:", command);

exec(command, (error, stdout, stderr) => {
	if (error) {
		console.error(`Error executing the command: ${error.message}`);
		return;
	}

	if (stderr) {
		console.error(`Error output: ${stderr}`);
	}

	console.log(`Trimmed video saved as: ${outputVideo}`);
});


///  No video...
// const segments = timestamps
// 	.map(
// 		(timestamp, index) =>
// 			`[0:v]trim=start=${timestamp.start}:end=${timestamp.end},setpts=PTS-STARTPTS[v${index}];[0:a]atrim=start=${timestamp.start}:end=${timestamp.end},asetpts=PTS-STARTPTS[a${index}];`
// 	)
// 	.join("");

// const concatFilter =
// 	timestamps.map((_, index) => `[v${index}][a${index}]`).join("") +
// 	`concat=n=${timestamps.length}:v=1:a=1[outv][outa]`;

// const filterComplex = segments + concatFilter;

// const ffmpegCommand = `ffmpeg -i "${inputVideo}" -filter_complex "${filterComplex}" -map "[outv]" -map "[outa]" -y "${outputVideo}"`;

// exec(ffmpegCommand, (error, stdout, stderr) => {
// 	if (error) {
// 		console.error("Error while processing video:", error);
// 		return;
// 	}

// 	console.log("Video trimmed and concatenated successfully");
// });


// No video for some reason...
// const segments = timestamps
// 	.map(
// 		(timestamp, index) =>
// 			`[0:v]trim=start=${timestamp.start}:end=${timestamp.end},setpts=PTS-STARTPTS[v${index}];`
// 	)
// 	.join("");

// const concatFilter =
// 	timestamps.map((_, index) => `[v${index}]`).join("") +
// 	`concat=n=${timestamps.length}:v=1[outv]`;

// const filterComplex = segments + concatFilter;

// const ffmpegCommand = `ffmpeg -i "${inputVideo}" -filter_complex "${filterComplex}" -map "[outv]" -map 0:a -y "${outputVideo}"`;

// exec(ffmpegCommand, (error, stdout, stderr) => {
// 	if (error) {
// 		console.error("Error while processing video:", error);
// 		return;
// 	}

// 	console.log("Video trimmed successfully");
// });