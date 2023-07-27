const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const async = require("async");
const cutList = require("./cut-list.cjs");

const rootDir = "/Volumes/Seagate/";

// use like (command = process | concatenate | convert)
// node cut_video.cjs <command> <outputvideo>

// flip a video 180 degrees
// ffmpeg -i ${rootDir}output/may-6-tristan/sources/IMG_5276.MOV.mp4 -vf "vflip,hflip" -c:a copy ${rootDir}output/may-6-tristan/sources/IMG_5276.mp4



const finalVideo =
	process.argv[3] || "please-call-with-a-name-for-the-video-as-the-second-argument";

if (!fs.existsSync(`${rootDir}output/`)) {
	fs.mkdirSync(`${rootDir}output/`);
}

if (!fs.existsSync(`${rootDir}output/${finalVideo}/`)) {
	fs.mkdirSync(`${rootDir}output/${finalVideo}/`);
}

const sourcesDir = `${rootDir}output/${finalVideo}/sources/`;
const segmentsDir = `${rootDir}output/${finalVideo}/segments/`;

if (!fs.existsSync(sourcesDir)) {
	fs.mkdirSync(sourcesDir);
}

if (!fs.existsSync(segmentsDir)) {
	fs.mkdirSync(segmentsDir);
}

const paddedSegmentsDir = `${rootDir}output/${finalVideo}/padded-segments/`;

if (!fs.existsSync(paddedSegmentsDir)) {
	fs.mkdirSync(paddedSegmentsDir);
}

function concatenateMP4Files(directory, outputFilename, callback) {
	fs.readdir(directory, (err, files) => {
		if (err) {
			return callback(err);
		}

		const mp4Files = files
			.filter(
				(file) =>
					path.extname(file).toLowerCase() === ".mp4"
			)
			.map((file) => path.join(directory, file));

		console.log("directory", directory, mp4Files);
		const listFile = path.join(directory, "list.txt");
		const listContent = mp4Files.map((input) => `file '${path.resolve(input)}'`).join("\n");
		fs.writeFileSync(listFile, listContent);

		concatVideos(directory, mp4Files, outputFilename, callback);
	});
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
					.setDuration(end - start + 0.5)
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
					.setDuration(end - start + 5)
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

const spinner = ["|", "/", "-", "\\"];
let spinnerIndex = 0;
const updateSpinner = () => {
	spinnerIndex = (spinnerIndex + 1) % spinner.length;
	return spinner[spinnerIndex];
};

// make a run-time counter to display in the progress bar
let startTime = Date.now();
const updateCounter = () => {
	const elapsedTime = Date.now() - startTime;
	// pad seconds, minutes, hours with leading zeros
	const seconds = `0${Math.floor(elapsedTime / 1000)}`.slice(-2);
	const minutes = `0${Math.floor(elapsedTime / 1000 / 60)}`.slice(-2);
	const hours = `0${Math.floor(elapsedTime / 1000 / 60 / 60)}`.slice(-2);
	return `${hours}:${minutes}:${seconds}`;
};

const updateProgressBar = (completedFiles, movFiles, fileBeingProcessed) => {
	const percentage = (completedFiles / movFiles.length) * 100;
	const barLength = 20;
	let filledLength = Math.floor((percentage * barLength) / 100);
	if (percentage === 100) {
		filledLength = barLength - 1;
	}
	const progressBar = `[${"=".repeat(filledLength)}>${" ".repeat(
		barLength - filledLength - 1
	)}] ${completedFiles} of ${
		movFiles.length
	} completed | ${updateCounter()} ${fileBeingProcessed} ${updateSpinner()}`;
	process.stdout.write("\r");
	process.stdout.write(progressBar);
};

function convertMovToMp4(directory, callback) {
	fs.readdir(directory, (err, files) => {
		if (err) {
			return callback(err);
		}

		const movFiles = files
			.filter((file) => path.extname(file).toLowerCase() === ".mov")
			.map((file) => path.join(directory, file));

		// Set a concurrency limit, e.g., 2 files at a time
		const concurrencyLimit = 3;
		let completedFiles = 0;

		async.eachLimit(
			movFiles,
			concurrencyLimit,
			(input, cb) => {
				const output = path.join(directory, path.basename(input, ".mov") + ".mp4");
				updateProgressBar(completedFiles, movFiles, input);
				ffmpeg(input)
					.output(output)
					.videoCodec("libx264")
					.audioCodec("aac")
					.outputOptions("-r", "30", "-crf", "20") // Set output frame rate to 30 FPS
					.on("end", () => {
						completedFiles++;
						updateProgressBar(completedFiles, movFiles, input);
						cb(null);
					})
					.on("progress", (progress) => {
						updateProgressBar(completedFiles, movFiles, input);
					})
					.on("error", (err) => cb(err))
					.run();
			},
			(err) => {
				console.log("\n");
				callback(err);
			}
		);
	});
}





function concatVideos(dir, inputs, output, callback) {
	const listFile = path.join(dir, "list.txt");
	const listContent = inputs.map((input) => `file '${path.resolve(input)}'`).join("\n");
	fs.writeFileSync(listFile, listContent);

	ffmpeg()
		.input(listFile)
		.inputOptions("-f", "concat", "-safe", "0")
		.output(output)
		.videoCodec("copy")
		.audioCodec("copy")
		.on("end", () => {
			console.log("\nConcatenation completed.");
			callback(null);
		})
		.on("error", (err) => callback(err))
		.on("progress", (progress) => {
			process.stdout.write(
				`Concatenating videos: ${progress.percent.toFixed(2)}% completed\r`
			);
		})
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
					const paddedOutputSegment = path.join(
						paddedSegmentsDir,
						`segment_${index}.mp4`
					);
					// Adjust the start and end times to include a second of margin on either side for fades and such
					// const paddedStart = Math.max(timeStringToSeconds(timestamp.start) - 1, 0);
					// const paddedEnd = timeStringToSeconds(timestamp.end) + 1;
					const start = timeStringToSeconds(timestamp.start);
					const end = timeStringToSeconds(timestamp.end);
					cutVideo(
						path.join("../sources", video),
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

			concatVideos(segmentsDir, segmentFilenames, output, callback);
		}
	);
}

const command = process.argv[2];

if (command === "convert") {
	console.log("Converting MOV files...")
	convertMovToMp4(sourcesDir, (err) => {
		if (err) {
			console.error("Error converting MOV files:", err);
			process.exit(1);
		} else {
			console.log("MOV files converted successfully.");
		}
	});
} else if (command === "concatenate") {
	concatenateMP4Files(sourcesDir, `${finalVideo}-full.mp4`, (err) => {
		if (err) {
			console.error("Error concatenating MP4 files:", err);
			process.exit(1);
		} else {
			console.log("MP4 files concatenated successfully.");
		}
	});
} else if (command === "process") {
	console.log('processing videos...', cutList)
	processVideos(cutList, `${sourcesDir}output/${finalVideo}/rough-cut.mp4`, (err) => {
		console.log("processing videos complete");
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log("Video processing completed successfully.");

			// Move source files to the output directory
			const destinationDir = `${sourcesDir}output/${finalVideo}/sources/`;

			if (!fs.existsSync(destinationDir)) {
				fs.mkdirSync(destinationDir);
			}

			async.each(
				cutList,
				(input, moveCallback) => {
					const sourcePath = path.join(sourcesDir, input.video);
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
} else {
	console.error(
		"Invalid command. Please use 'concatenate' or 'process'. node cut_video.cjs <command> <outputvideo>"
	);
	process.exit(1);
}
