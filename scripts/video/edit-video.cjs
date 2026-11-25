const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("fluent-ffmpeg").ffprobe;
const async = require("async");
const {
	CUT_MODE_BLUR,
	CUT_MODE_REMOVE,
	CUT_MODE_REPLACE,
	DEFAULT_BLUR_AMOUNT,
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

// Saved cutlists and editor filenames are relative to public/, but CLI users
// can also pass a project-relative path such as ./public/media/movie.mp4.
const videoFile = normalizeVideoPath(normalizeVideoPath(file).replace(/^public\//, ""));
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

function createBlurReplacementVideo(input, segment, output, videoInfo, callback, index) {
	const duration = segment.end - segment.start;
	const startedAt = Date.now();
	const maskPath = path.join(rootDir, "temp_segments", `blur_mask_${index}.pgm`);
	fs.writeFileSync(maskPath, createBlurMaskPgm(segment.blur, videoInfo.width, videoInfo.height));

	const blurAmount = Math.max(2, Math.min(64, Math.round(segment.blur && segment.blur.amount || DEFAULT_BLUR_AMOUNT)));
	const filter = `[0:v]split[base][blurbase];[blurbase]boxblur=${blurAmount}:1[blurred];[1:v]format=gray,scale=${videoInfo.width}:${videoInfo.height}[mask];[blurred][mask]alphamerge[blurredalpha];[base][blurredalpha]overlay=0:0,format=yuv420p[v]`;
	const child = spawn("ffmpeg", [
		"-y",
		"-ss",
		String(segment.start),
		"-t",
		String(duration),
		"-i",
		input,
		"-loop",
		"1",
		"-i",
		maskPath,
		"-filter_complex",
		filter,
		"-map",
		"[v]",
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
			const estimatedWorkSeconds = estimateSegmentWorkSeconds(duration, videoInfo, "blur");
			callback.onProgress({
				percent: Math.min(95, (elapsedSeconds / estimatedWorkSeconds) * 100),
			});
		}, 1000);
	}

	function cleanup() {
		if (timer) {
			clearInterval(timer);
		}

		fs.promises.unlink(maskPath).catch(() => {});
	}

	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on("error", (error) => {
		cleanup();
		callback(error);
	});
	child.on("close", (code) => {
		cleanup();

		if (code === 0) {
			callback(null);
			return;
		}

		callback(new Error(`ffmpeg blur replacement failed with exit code ${code}.\n${stderr}`));
	});
}

function createBlurMaskPgm(blur, width, height) {
	const maskWidth = Math.max(2, Math.round(width || 1280));
	const maskHeight = Math.max(2, Math.round(height || 720));
	const pixels = Buffer.alloc(maskWidth * maskHeight);
	const shapes = blur && Array.isArray(blur.shapes) ? blur.shapes : [];

	shapes.forEach((shape) => {
		if (shape.tool === "rectangle" && shape.rect) {
			fillMaskRect(pixels, maskWidth, maskHeight, shape.rect);
		} else if (shape.tool === "lasso" && Array.isArray(shape.points)) {
			fillMaskPolygon(pixels, maskWidth, maskHeight, shape.points);
		} else if (shape.tool === "brush" && Array.isArray(shape.points)) {
			fillMaskBrush(pixels, maskWidth, maskHeight, shape);
		}
	});

	return Buffer.concat([
		Buffer.from(`P5\n${maskWidth} ${maskHeight}\n255\n`),
		pixels,
	]);
}

function fillMaskRect(pixels, width, height, rect) {
	const x1 = Math.floor((Number(rect.x) || 0) * width);
	const y1 = Math.floor((Number(rect.y) || 0) * height);
	const x2 = Math.ceil(((Number(rect.x) || 0) + (Number(rect.width) || 0)) * width);
	const y2 = Math.ceil(((Number(rect.y) || 0) + (Number(rect.height) || 0)) * height);

	for (let y = clampPixel(y1, height); y <= clampPixel(y2, height); y++) {
		for (let x = clampPixel(x1, width); x <= clampPixel(x2, width); x++) {
			pixels[y * width + x] = 255;
		}
	}
}

function fillMaskPolygon(pixels, width, height, points) {
	const scaled = points.map((point) => ({ x: (Number(point.x) || 0) * width, y: (Number(point.y) || 0) * height }));
	const minY = clampPixel(Math.floor(Math.min(...scaled.map((point) => point.y))), height);
	const maxY = clampPixel(Math.ceil(Math.max(...scaled.map((point) => point.y))), height);

	for (let y = minY; y <= maxY; y++) {
		const intersections = [];

		for (let index = 0; index < scaled.length; index++) {
			const a = scaled[index];
			const b = scaled[(index + 1) % scaled.length];

			if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
				intersections.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
			}
		}

		intersections.sort((a, b) => a - b);

		for (let index = 0; index < intersections.length; index += 2) {
			const start = clampPixel(Math.floor(intersections[index]), width);
			const end = clampPixel(Math.ceil(intersections[index + 1] || intersections[index]), width);

			for (let x = start; x <= end; x++) {
				pixels[y * width + x] = 255;
			}
		}
	}
}

function fillMaskBrush(pixels, width, height, shape) {
	const radius = Math.max(1, Math.round((Number(shape.brushSize) || 0.055) * Math.max(width, height) / 2));
	const points = shape.points.map((point) => ({
		x: Math.round((Number(point.x) || 0) * width),
		y: Math.round((Number(point.y) || 0) * height),
	}));

	for (let index = 0; index < points.length; index++) {
		fillMaskCircle(pixels, width, height, points[index].x, points[index].y, radius);

		if (index > 0) {
			const previous = points[index - 1];
			const current = points[index];
			const steps = Math.max(1, Math.ceil(Math.hypot(current.x - previous.x, current.y - previous.y) / Math.max(1, radius / 2)));

			for (let step = 1; step < steps; step++) {
				const t = step / steps;
				fillMaskCircle(
					pixels,
					width,
					height,
					Math.round(previous.x + (current.x - previous.x) * t),
					Math.round(previous.y + (current.y - previous.y) * t),
					radius
				);
			}
		}
	}
}

function fillMaskCircle(pixels, width, height, centerX, centerY, radius) {
	const radiusSquared = radius * radius;
	const minX = clampPixel(centerX - radius, width);
	const maxX = clampPixel(centerX + radius, width);
	const minY = clampPixel(centerY - radius, height);
	const maxY = clampPixel(centerY + radius, height);

	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			const dx = x - centerX;
			const dy = y - centerY;

			if (dx * dx + dy * dy <= radiusSquared) {
				pixels[y * width + x] = 255;
			}
		}
	}
}

function clampPixel(value, size) {
	return Math.max(0, Math.min(size - 1, Math.round(value)));
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

				if (segment.type === "blur") {
					createBlurReplacementVideo(input, segment, outputSegment, videoInfo, completeSegment, index);
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

	if (type === "blur") {
		return "Blurring selected area";
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
	const typeFactor = type === "black" ? 0.35 : type === "color" ? 0.55 : type === "blur" ? 1.1 : 0.8;

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
		const mode = timestamp.mode === CUT_MODE_REPLACE
			? CUT_MODE_REPLACE
			: timestamp.mode === CUT_MODE_BLUR
				? CUT_MODE_BLUR
				: CUT_MODE_REMOVE;
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
			} else if (mode === CUT_MODE_BLUR) {
				segments.push({
					type: "blur",
					start: effectiveStart,
					end,
					blur: timestamp.blur || { amount: DEFAULT_BLUR_AMOUNT, shapes: [] },
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
