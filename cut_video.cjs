const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const async = require("async");
const cutList = require("./cut-list.cjs");

const finalVideo = process.argv[2] || "please-call-with-a-name-for-the-video-as-the-first-argument";

if (!fs.existsSync(`./output/${finalVideo}/`)) {
	fs.mkdirSync(`./output/${finalVideo}/`);
}

const segmentsDir = `./output/${finalVideo}/segments/`;

if (!fs.existsSync(segmentsDir)) {
	fs.mkdirSync(segmentsDir);
}

const paddedSegmentsDir = `./output/${finalVideo}/padded-segments/`;

if (!fs.existsSync(paddedSegmentsDir)) {
	fs.mkdirSync(paddedSegmentsDir);
}

function moveFile(source, destination, callback) {
	fs.rename(source, destination, (err) => {
		if (err) {
			callback(err);
		} else {
			callback(null);
		}
	});
}


function timeStringToSeconds(timeString) {
	const [hours, minutes, seconds] = timeString.split(":").map(Number);
	return hours * 3600 + minutes * 60 + seconds;
}

function cutVideo(input, start, end, output, paddedoutput, callback) {
	async.parallel(
		[
			(cb) => {
				ffmpeg(input)
					.setStartTime(start)
					.setDuration(end - start + .5)
					.output(output)
					.videoCodec("copy")
					.audioCodec("aac")
					.on("end", () => {
						cb(null);
					})
					.on("error", (err) => cb(err))
					.run();
			},
			(cb) => {
				ffmpeg(input)
					.setStartTime(start - 2)
					.setDuration(end - start + 4)
					.output(paddedoutput)
					.videoCodec("copy")
					.audioCodec("aac")
					.on("end", () => {
						cb(null);
					})
					.on("error", (err) => cb(err))
					.run();
			},
		],
		(err) => {
			if (err) {
				callback(err);
			} else {
				callback(null);
			}
		}
	);
}


function concatVideos(inputs, output, callback) {
	const listFile = path.join(segmentsDir, "list.txt");
	const listContent = inputs.map((input) => `file '${path.resolve(input)}'`).join("\n");
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

function processVideos(inputs, output, callback) {
	let segmentFilenames = [];
	let videoIndex = 0;

	async.eachSeries(
		inputs,
		(input, inputCallback) => {
			const { video, timestamps } = input;

			async.eachSeries(
				timestamps,
				(timestamp, timestampCallback) => {
					const index = videoIndex++;
					const outputSegment = path.join(segmentsDir, `segment_${index}.mp4`);
					segmentFilenames.push(outputSegment);
					const paddedOutputSegment = path.join(paddedSegmentsDir, `segment_${index}.mp4`);
					// Adjust the start and end times to include a second of margin on either side for fades and such
					// const paddedStart = Math.max(timeStringToSeconds(timestamp.start) - 1, 0);
					// const paddedEnd = timeStringToSeconds(timestamp.end) + 1;
					const start = timeStringToSeconds(timestamp.start);
					const end = timeStringToSeconds(timestamp.end);
					cutVideo(
						path.join("sources", video),
						start,
						end,
						outputSegment,
						paddedOutputSegment,
						timestampCallback
					);
				},
				inputCallback
			);
		},
		(err) => {
			if (err) {
				callback(err);
				return;
			}

			concatVideos(segmentFilenames, output, callback);
		}
	);
}

processVideos(cutList, `./output/${finalVideo}/rough-cut.mp4`, (err) => {
	console.log('processing videos complete');
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log("Video processing completed successfully.");

		// Move source files to the output directory
		const sourceDir = "./sources/";
		const destinationDir = `./output/${finalVideo}/sources/`;

		if (!fs.existsSync(destinationDir)) {
			fs.mkdirSync(destinationDir);
		}

		async.each(
			cutList,
			(input, moveCallback) => {
				const sourcePath = path.join(sourceDir, input.video);
				const destinationPath = path.join(destinationDir, input.video);

				moveFile(sourcePath, destinationPath, moveCallback);
			},
			(err) => {
				if (err) {
					console.error("Error moving source files:", err);
				} else {
					console.log("Source files moved successfully.");
				}
			}
		);
	}
});

