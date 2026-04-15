const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("fluent-ffmpeg").ffprobe;
const async = require("async");
const {
	CUT_MODE_REMOVE,
	CUT_MODE_REPLACE,
	DEFAULT_REPLACEMENT_COLOR,
	getCutListConfigForVideo,
	getIntroOutroPath,
	normalizeVideoPath,
} = require("../../src/cutlist-config.cjs");
const rootDir = path.join(__dirname, "..", "..");

const file = process.argv[2];

if (!file) {
	console.error("Usage: node scripts/video/edit-video.cjs <selected-video-filename>");
	process.exit(1);
}

const videoFile = normalizeVideoPath(file);
const options = parseOptions(process.argv.slice(3));
const cutListConfig = getCutListConfigForVideo(videoFile);
const cutList = cutListConfig.cutList;
const parsedFile = path.parse(videoFile);
const originalVideo = path.join(rootDir, "public", videoFile);
const outputDir = path.join(rootDir, "public", "edits", parsedFile.dir);
const outputSuffix = options.debugBlackCuts ? "TV-Edit-Debug" : "TV-Edit";
const finalVideo = path.join(outputDir, `${parsedFile.name}-${outputSuffix}.mp4`);
const introSource = path.join(rootDir, "public", "INTRO.mp4");
const introSrc = options.intro || cutListConfig.introSrc;
const outroSrc = options.outro || cutListConfig.outroSrc;
const introPath = introSrc ? getIntroOutroPath(introSrc) : null;
const outroPath = outroSrc ? getIntroOutroPath(outroSrc) : null;

emitProgress(0, "Preparing edit...");
console.log("Editing file: ", videoFile);
console.log("Using cutlist: ", cutList);
console.log("Using intro: ", introSrc || "none");
console.log("Using outro: ", outroSrc || "none");
console.log("Debug black cuts: ", options.debugBlackCuts ? "yes" : "no");

fs.mkdirSync(outputDir, { recursive: true });

function emitProgress(percent, message, details = {}) {
	console.log(`PROGRESS:${JSON.stringify({ percent, message, ...details })}`);
}

function parseOptions(args) {
	const options = { intro: null, outro: null, debugBlackCuts: false };

	for (let index = 0; index < args.length; index++) {
		const arg = args[index];

		if (arg === "--intro") {
			options.intro = args[++index];
		} else if (arg === "--outro") {
			options.outro = args[++index];
		} else if (arg === "--debug-black-cuts") {
			options.debugBlackCuts = true;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}

	if (options.intro === undefined || options.outro === undefined) {
		throw new Error("--intro and --outro require a filename.");
	}

	return options;
}

// function timeStringToSeconds(timeString) {
// 	const [hours, minutes, seconds, milliseconds] = timeString.split(":").map(Number);
// 	return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
// }
function timeStringToSeconds(timeString) {
	console.log("timeString: ", timeString);
	return parseFloat(timeString);
}

function rescaleIntro(callback) {
	const output = path.join(rootDir, "public", "intro_rescaled.mp4");
	ffmpeg(introSource)
		.size("720x456")
		.output(output)
		.on("end", () => {
			callback(null);
		})
		.on("error", (err) => {
			callback(err);
		})
		.run();
}

function cutVideo(
	input,
	start,
	end,
	output,
	callback,
	options = {}
) {
	const command = ffmpeg(input)
		.setStartTime(start)
		.setDuration(end - start)
		.output(output)
		.videoCodec(options.videoCodec || "copy")
		.audioCodec(options.audioCodec || "aac");

	if (options.size) {
		command.size(options.size);
	}

	if (options.frameRate) {
		command.outputOptions("-r", options.frameRate);
	}

	if (options.pixelFormat) {
		command.outputOptions("-pix_fmt", options.pixelFormat);
	}

	command
		.on("progress", (progress) => {
			if (typeof options.onProgress === "function") {
				options.onProgress(progress);
			}
		})
		.on("end", () => {
			callback(null);
		})
		.on("error", (err) => callback(err))
		.run();
}

function createBlackVideo(duration, output, videoInfo, callback) {
	const startedAt = Date.now();
	const child = spawn("ffmpeg", [
		"-y",
		"-f",
		"lavfi",
		"-i",
		`color=c=black:s=${videoInfo.width}x${videoInfo.height}:r=${videoInfo.frameRate}:d=${duration}`,
		"-f",
		"lavfi",
		"-i",
		`anullsrc=channel_layout=${videoInfo.channelLayout}:sample_rate=${videoInfo.sampleRate}`,
		"-t",
		String(duration),
		"-shortest",
		"-c:v",
		"libx264",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		output,
	]);
	let stderr = "";
	let timer = null;

	if (typeof callback.onProgress === "function") {
		timer = setInterval(() => {
			const elapsedSeconds = (Date.now() - startedAt) / 1000;
			const estimatedWorkSeconds = estimateSegmentWorkSeconds(duration, videoInfo, "black");
			callback.onProgress({
				percent: Math.min(95, (elapsedSeconds / estimatedWorkSeconds) * 100),
			});
		}, 1000);
	}

	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on("error", (error) => {
		if (timer) {
			clearInterval(timer);
		}
		callback(error);
	});
	child.on("close", (code) => {
		if (timer) {
			clearInterval(timer);
		}

		if (code === 0) {
			callback(null);
			return;
		}

		callback(new Error(`ffmpeg black clip failed with exit code ${code}.\n${stderr}`));
	});
}

function createColorReplacementVideo(input, segment, output, videoInfo, callback) {
	const duration = segment.end - segment.start;
	const startedAt = Date.now();
	const child = spawn("ffmpeg", [
		"-y",
		"-ss",
		String(segment.start),
		"-t",
		String(duration),
		"-i",
		input,
		"-f",
		"lavfi",
		"-i",
		`color=c=${hexColorToFfmpegColor(segment.color)}:s=${videoInfo.width}x${videoInfo.height}:r=${videoInfo.frameRate}:d=${duration}`,
		"-map",
		"1:v:0",
		"-map",
		"0:a:0?",
		"-t",
		String(duration),
		"-shortest",
		"-c:v",
		"libx264",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		output,
	]);
	let stderr = "";
	let timer = null;

	if (typeof callback.onProgress === "function") {
		timer = setInterval(() => {
			const elapsedSeconds = (Date.now() - startedAt) / 1000;
			const estimatedWorkSeconds = estimateSegmentWorkSeconds(duration, videoInfo, "color");
			callback.onProgress({
				percent: Math.min(95, (elapsedSeconds / estimatedWorkSeconds) * 100),
			});
		}, 1000);
	}

	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on("error", (error) => {
		if (timer) {
			clearInterval(timer);
		}
		callback(error);
	});
	child.on("close", (code) => {
		if (timer) {
			clearInterval(timer);
		}

		if (code === 0) {
			callback(null);
			return;
		}

		callback(new Error(`ffmpeg color replacement failed with exit code ${code}.\n${stderr}`));
	});
}

function processVideo(input, cutList, output, callback, options = {}) {
	let segments = [];

	function getVideoMetadata(input, cb) {
		ffprobe(input, (err, metadata) => {
			if (err) {
				cb(err);
				return;
			}

			const duration = getMetadataDuration(metadata);

			if (!Number.isFinite(duration)) {
				cb(new Error(`Could not determine video duration for ${input}.`));
				return;
			}

			cb(null, {
				duration,
				videoInfo: getVideoInfo(metadata),
			});
		});
	}

	// Get video duration and process the video
	getVideoMetadata(input, (err, metadata) => {
		if (err) {
			callback(err);
			return;
		}

		const { duration: videoDurationInSeconds, videoInfo } = metadata;

		console.log("cutList", cutList);

		segments = createTimelineSegments(cutList, videoDurationInSeconds, options.debugBlackCuts);
		console.log("Segments:", segments);
		emitProgress(15, `Created edit plan with ${segments.length} segment${segments.length === 1 ? "" : "s"}...`);

		const tempDir = path.join(rootDir, "temp_segments");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir);
		}

		const segmentFilenames = [];
		let videoIndex = 0;

		async.eachSeries(
			segments,
			(segment, segmentCallback) => {
				const index = videoIndex++;
				const outputSegment = path.join(tempDir, `segment_${index}.mp4`);
				segmentFilenames.push(outputSegment);
				const segmentProgressBase = 15;
				const segmentProgressRange = 70;
				const segmentLabel = getSegmentLabel(segment.type);
				const segmentTracker = createSegmentProgressTracker({
					index,
					total: segments.length,
					segment,
					type: segment.type,
					videoInfo,
					overallPercentStart: segmentProgressBase + Math.round((index / Math.max(segments.length, 1)) * segmentProgressRange),
					overallPercentEnd: segmentProgressBase + Math.round(((index + 1) / Math.max(segments.length, 1)) * segmentProgressRange),
				});
				segmentTracker.update(0, `${segmentLabel} ${index + 1} of ${segments.length}...`);
				const completeSegment = (err) => {
					if (!err) {
						segmentTracker.complete();
					}

					segmentCallback(err);
				};
				completeSegment.onProgress = (progress) => {
					segmentTracker.update(getSegmentPercent(progress, segment), `${segmentLabel} ${index + 1} of ${segments.length}...`);
				};

				if (segment.type === "black") {
					createBlackVideo(segment.end - segment.start, outputSegment, videoInfo, completeSegment);
					return;
				}

				if (segment.type === "color") {
					createColorReplacementVideo(input, segment, outputSegment, videoInfo, completeSegment);
					return;
				}

				cutVideo(input, segment.start, segment.end, outputSegment, completeSegment, {
					videoCodec: "libx264",
					audioCodec: "aac",
					size: `${videoInfo.width}x${videoInfo.height}`,
					frameRate: videoInfo.frameRate,
					pixelFormat: "yuv420p",
					onProgress: completeSegment.onProgress,
				});
			},
			(err) => {
				if (err) {
					callback(err);
					return;
				}

				emitProgress(90, "Combining edit segments...");
				concatenateSegments(segmentFilenames, output, callback, { introPath, outroPath });
			}
		);
	});
}

function getSegmentLabel(type) {
	if (type === "black") {
		return "Creating black cut marker";
	}

	if (type === "color") {
		return "Replacing video with color";
	}

	return "Cutting video segment";
}

function createSegmentProgressTracker(options) {
	const startedAt = Date.now();
	const duration = options.segment.end - options.segment.start;
	const estimatedWorkSeconds = estimateSegmentWorkSeconds(duration, options.videoInfo, options.type);

	function getEta(percent) {
		const elapsedSeconds = (Date.now() - startedAt) / 1000;
		const fraction = Math.max(0, Math.min(0.99, percent / 100));
		const remainingSeconds = fraction > 0.05
			? Math.max(0, (elapsedSeconds / fraction) - elapsedSeconds)
			: Math.max(0, estimatedWorkSeconds - elapsedSeconds);

		return formatEta(remainingSeconds);
	}

	return {
		update(percent, message) {
			const segmentPercent = Math.max(0, Math.min(99, percent));
			const overallPercent = options.overallPercentStart
				+ ((options.overallPercentEnd - options.overallPercentStart) * (segmentPercent / 100));

			emitProgress(Math.round(overallPercent), message, {
				segment: {
					index: options.index + 1,
					total: options.total,
					percent: segmentPercent,
					message,
					eta: getEta(segmentPercent),
				},
			});
		},
		complete() {
			const message = `Finished segment ${options.index + 1} of ${options.total}...`;
			emitProgress(options.overallPercentEnd, message, {
				segment: {
					index: options.index + 1,
					total: options.total,
					percent: 100,
					message,
					eta: "0s",
				},
			});
		},
	};
}

function getSegmentPercent(progress, segment) {
	const duration = segment.end - segment.start;
	const timemarkSeconds = parseTimemark(progress.timemark);

	if (Number.isFinite(timemarkSeconds) && duration > 0) {
		return (timemarkSeconds / duration) * 100;
	}

	if (Number.isFinite(progress.percent)) {
		return progress.percent;
	}

	return 0;
}

function parseTimemark(timemark) {
	if (!timemark || typeof timemark !== "string") {
		return NaN;
	}

	const parts = timemark.split(":").map(Number);

	if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
		return NaN;
	}

	return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
}

function estimateSegmentWorkSeconds(duration, videoInfo, type) {
	const pixels = (videoInfo.width || 1280) * (videoInfo.height || 720);
	const resolutionFactor = Math.max(0.5, pixels / (1280 * 720));
	const typeFactor = type === "black" ? 0.35 : type === "color" ? 0.55 : 0.8;

	return Math.max(2, duration * resolutionFactor * typeFactor);
}

function formatEta(seconds) {
	const rounded = Math.max(0, Math.ceil(seconds));

	if (rounded < 60) {
		return `${rounded}s`;
	}

	const minutes = Math.floor(rounded / 60);
	const remainingSeconds = rounded % 60;

	return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

function createTimelineSegments(cutList, videoDurationInSeconds, debugBlackCuts) {
	let currentStart = 0;
	const segments = [];

	cutList.forEach((timestamp) => {
		const start = clampTime(timeStringToSeconds(timestamp.start), videoDurationInSeconds);
		const end = clampTime(timeStringToSeconds(timestamp.end), videoDurationInSeconds);
		const mode = timestamp.mode === CUT_MODE_REPLACE ? CUT_MODE_REPLACE : CUT_MODE_REMOVE;
		const effectiveStart = Math.max(start, currentStart);

		if (start > currentStart) {
			segments.push({ type: "video", start: currentStart, end: start });
		}

		if (end > currentStart) {
			if (mode === CUT_MODE_REPLACE) {
				segments.push({
					type: "color",
					start: effectiveStart,
					end,
					color: timestamp.color || DEFAULT_REPLACEMENT_COLOR,
				});
			} else if (debugBlackCuts) {
				segments.push({ type: "black", start: effectiveStart, end });
			}
		}

		currentStart = Math.max(currentStart, end);
	});

	if (currentStart < videoDurationInSeconds) {
		segments.push({ type: "video", start: currentStart, end: videoDurationInSeconds });
	}

	return segments.filter((segment) => segment.end > segment.start);
}

function clampTime(time, duration) {
	return Math.min(Math.max(time, 0), duration);
}

function hexColorToFfmpegColor(color) {
	return `0x${String(color || DEFAULT_REPLACEMENT_COLOR).replace("#", "")}`;
}

function getVideoInfo(metadata) {
	const videoStream = metadata.streams.find((stream) => stream.codec_type === "video") || {};
	const audioStream = metadata.streams.find((stream) => stream.codec_type === "audio") || {};

	return {
		width: videoStream.width || 1280,
		height: videoStream.height || 720,
		frameRate: normalizeFrameRate(videoStream.avg_frame_rate || videoStream.r_frame_rate),
		sampleRate: audioStream.sample_rate || "48000",
		channelLayout: audioStream.channel_layout || "stereo",
	};
}

function normalizeFrameRate(frameRate) {
	if (!frameRate || frameRate === "0/0") {
		return "30";
	}

	return frameRate;
}

function getMetadataDuration(metadata) {
	const formatDuration = Number.parseFloat(metadata.format && metadata.format.duration);

	if (Number.isFinite(formatDuration)) {
		return formatDuration;
	}

	const videoStream = metadata.streams.find((stream) => stream.codec_type === "video");
	const videoDuration = Number.parseFloat(videoStream && videoStream.duration);

	if (Number.isFinite(videoDuration)) {
		return videoDuration;
	}

	const streamDurations = metadata.streams
		.map((stream) => Number.parseFloat(stream.duration))
		.filter(Number.isFinite);

	return streamDurations.length ? Math.max(...streamDurations) : NaN;
}

// concatenateSegments([introSource], finalVideo, (err) => console.log(err));
function concatenateSegments(segmentFilenames, output, callback, options = {}) {
	// Prepend intro_rescaled.mp4 to the beginning of the segmentFilenames list
	// segmentFilenames.unshift(path.join(rootDir, "public", "intro_rescaled.mp4"));

	const inputs = [
		...(options.introPath ? [options.introPath] : []),
		...segmentFilenames,
		...(options.outroPath ? [options.outroPath] : []),
	];
	const listFile = path.join(rootDir, "temp_segments", "list.txt");
	const listContent = inputs.map((input) => `file '${path.resolve(input)}'`).join("\n");

	// Log the contents of list.txt
	console.log("list.txt content:\n", listContent);

	fs.writeFileSync(listFile, listContent);

	const child = spawn("ffmpeg", [
		"-y",
		"-f",
		"concat",
		"-safe",
		"0",
		"-i",
		listFile,
		"-c:v",
		"copy",
		"-c:a",
		"copy",
		output,
	]);
	let stderr = "";

	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on("error", callback);
	child.on("close", (code) => {
		if (code === 0) {
			callback(null);
			return;
		}

		callback(new Error(`ffmpeg concat failed with exit code ${code}.\n${stderr}`));
	});
}

// Make a copy of the original video
emitProgress(2, "Copying source video...");
fs.copyFileSync(originalVideo, "temp-original.mp4");
emitProgress(5, "Reading video metadata...");

// Process the copied video using the cutList
// rescaleIntro((err) => {
// 	if (err) {
// 		console.error("Error rescaling the intro video:", err);
// 		process.exit(1);
// 	}

// 	// Make a copy of the original video
// 	fs.copyFileSync(originalVideo, "temp-original.mp4");

	// Process the copied video using the cutList
	processVideo("temp-original.mp4", cutList, finalVideo, (err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log("Video processing completed successfully.");
			// Clean up the temporary original video file
			fs.unlinkSync("temp-original.mp4");
			emitProgress(100, "Edit complete.");
		}
	}, { debugBlackCuts: options.debugBlackCuts });
// });
