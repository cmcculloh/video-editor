const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");

const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];
const threshold = -40.0;
const buffer = 5;

if (!inputFilePath || !outputFilePath) {
	console.error("Usage: node extract_loud_parts.js <input_file> <output_file>");
	process.exit(1);
}

const ffprobeCommand = [
	"-v",
	"quiet",
	"-print_format",
	"json",
	"-show_entries",
	"frame_tags=lavfi.astats.1.Mean_volume",
	"-f",
	"lavfi",
	`amovie=${inputFilePath},astats=metadata=1:reset=1`,
];

const ffprobe = spawn("ffprobe", ffprobeCommand);
let ffprobeOutput = "";

ffprobe.stdout.on("data", (data) => {
	ffprobeOutput += data.toString();
});

ffprobe.on("close", () => {
	const stats = JSON.parse(ffprobeOutput);
	const loudParts = [];
	let startTime = null;

	for (const frame of stats.frames) {
		const meanVolume = parseFloat(frame.tags["lavfi.astats.1.Mean_volume"]);

		if (meanVolume >= threshold) {
			if (startTime === null) {
				startTime = Math.max(parseFloat(frame.pkt_pts_time) - buffer, 0);
			}
		} else if (startTime !== null) {
			const endTime = parseFloat(frame.pkt_pts_time) + buffer;
			loudParts.push([startTime, endTime - startTime]);
			startTime = null;
		}
	}

	if (startTime !== null) {
		const endTime = parseFloat(stats.frames[stats.frames.length - 1].pkt_pts_time) + buffer;
		loudParts.push([startTime, endTime - startTime]);
	}

	const filters = loudParts
		.map(([start, duration], index) => {
			return `[0:v]trim=start=${start}:duration=${duration}[v${index}];[0:a]atrim=start=${start}:duration=${duration}[a${index}]`;
		})
		.join("|");

	const mappings = loudParts.map((_, index) => `[v${index}][a${index}]`).join("");

	console.log(
		`Generated filtergraph: ${filters}${mappings}concat=n=${loudParts.length}:v=1:a=1[outv][outa]`
	);


	if (loudParts.length > 0) {
		const ffmpegCommand = new ffmpeg(inputFilePath)
			.complexFilter(`${filters}${mappings}concat=n=${loudParts.length}:v=1:a=1[outv][outa]`)
			.outputOptions("-map", "[outv]", "-map", "[outa]")
			.save(outputFilePath);

		ffmpegCommand.on("end", () => {
			console.log("Finished processing");
		});

		ffmpegCommand.on("error", (err) => {
			console.error("Error:", err.message);
		});
	} else {
		console.log("No loud parts detected. Exiting without creating a new video.");
	}



});
