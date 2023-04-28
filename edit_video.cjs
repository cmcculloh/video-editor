const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("fluent-ffmpeg").ffprobe;
const async = require("async");
const cutList = require("./tv-edit-list.cjs");

console.log("cutList: ", cutList);

const originalVideo = "./public/spiderman.mp4";
const finalVideo = "spidermand-TV-Edit.mp4";

// function timeStringToSeconds(timeString) {
// 	const [hours, minutes, seconds, milliseconds] = timeString.split(":").map(Number);
// 	return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
// }
function timeStringToSeconds(timeString) {
	console.log("timeString: ", timeString);
	return parseFloat(timeString);
}

function cutVideo(input, start, end, output, callback) {
	ffmpeg(input)
		.setStartTime(start)
		.setDuration(end - start)
		.output(output)
		.videoCodec("copy")
		.audioCodec("aac")
		.on("end", () => {
			callback(null);
		})
		.on("error", (err) => callback(err))
		.run();
}

function processVideo(input, cutList, output, callback) {
	let currentStart = 0;
	let segments = [];

	// Function to get video duration
	function getVideoDuration(input, cb) {
		ffprobe(input, (err, metadata) => {
			if (err) {
				cb(err);
			} else {
				const duration = Math.round(metadata.streams[0].duration);
				cb(null, duration);
			}
		});
	}

	// Get video duration and process the video
	getVideoDuration(input, (err, videoDurationInSeconds) => {
		if (err) {
			callback(err);
			return;
		}

		console.log("cutList", cutList);

		async.eachSeries(
			cutList,
			(timestamp, timestampCallback) => {
				const start = timeStringToSeconds(timestamp.start);
				const end = timeStringToSeconds(timestamp.end);

				if (start > currentStart) {
					segments.push({ start: currentStart, end: start });
				}

				currentStart = end;
				timestampCallback();
			},
			(err) => {
				if (err) {
					callback(err);
					return;
				}

				console.log("what waht");

				// Add the last segment after the final cut
				if (currentStart < videoDurationInSeconds) {
					segments.push({ start: currentStart, end: videoDurationInSeconds });
				}

				const tempDir = "./temp_segments/";
				if (!fs.existsSync(tempDir)) {
					fs.mkdirSync(tempDir);
				}

				const segmentFilenames = [];
				let videoIndex = 0;

				console.log("Segments:", segments);

				async.eachSeries(
					segments,
					(segment, segmentCallback) => {
						const index = videoIndex++;
						const outputSegment = path.join(tempDir, `segment_${index}.mp4`);
						segmentFilenames.push(outputSegment);

						cutVideo(input, segment.start, segment.end, outputSegment, segmentCallback);
					},
					(err) => {
						if (err) {
							callback(err);
							return;
						}

						concatenateSegments(segmentFilenames, output, callback);
					}
				);
			}
		);
	});
}

function concatenateSegments(segmentFilenames, output, callback) {
	const listFile = path.join("temp_segments", "list.txt");
	const listContent = segmentFilenames.map((input) => `file '${path.resolve(input)}'`).join("\n");

	// Log the contents of list.txt
	console.log("list.txt content:\n", listContent);

	fs.writeFileSync(listFile, listContent);

	ffmpeg()
		.input(listFile)
		.inputOptions("-f", "concat", "-safe", "0")
		.output(output)
		.videoCodec("copy")
		.audioCodec("copy")
		.on("end", () => {
			callback(null);
		})
		.on("error", (err) => callback(err))
		.run();
}

// Make a copy of the original video
fs.copyFileSync(originalVideo, "temp-original.mp4");

// Process the copied video using the cutList
processVideo("temp-original.mp4", cutList, finalVideo, (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log("Video processing completed successfully.");
		// Clean up the temporary original video file
		fs.unlinkSync("temp-original.mp4");
	}
});
