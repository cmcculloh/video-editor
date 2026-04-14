const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const {
	getCutListPath,
	getIntroOutroPath,
	introsAndOutrosDir,
	normalizeCutList,
	normalizeVideoPath,
} = require("./tv-edit-list.cjs");
const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const editJobs = new Map();
const videoExtensions = new Set([
	".avi",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".mpeg",
	".mpg",
	".webm",
]);

// Serve static files from the public folder
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/videos", async (req, res) => {
	try {
		const videos = await getVideoFiles(publicDir);
		res.json({ videos });
	} catch (error) {
		console.error("Error listing videos:", error);
		res.status(500).json({ error: "Failed to list videos" });
	}
});

app.get("/intro-outro-assets", async (req, res) => {
	try {
		const assets = await getVideoFiles(introsAndOutrosDir);
		res.json({ assets });
	} catch (error) {
		console.error("Error listing intro/outro assets:", error);
		res.status(500).json({ error: "Failed to list intro/outro assets" });
	}
});

app.get("/get-frame-rate", async (req, res) => {
	try {
		const videoSrc = normalizeVideoPath(req.query.videoSrc);
		const frameRate = await getFrameRate(path.join(publicDir, videoSrc));
		res.json({ frameRate });
	} catch (error) {
		console.error("Error fetching frame rate:", error);
		res.status(500).json({ error: "Failed to fetch frame rate" });
	}
});

app.get("/cutlists", async (req, res) => {
	try {
		const videoSrc = normalizeVideoPath(req.query.videoSrc);
		const cutListPath = getCutListPath(videoSrc);

		if (!fs.existsSync(cutListPath)) {
			res.json({
				exists: false,
				cutList: [],
				introSrc: null,
				outroSrc: null,
				path: path.relative(__dirname, cutListPath),
			});
			return;
		}

		const cutListData = JSON.parse(await fs.promises.readFile(cutListPath, "utf8"));
		const cutList = normalizeCutList(Array.isArray(cutListData) ? cutListData : cutListData.cutList);
		const introSrc = normalizeOptionalIntroOutro(cutListData.introSrc);
		const outroSrc = normalizeOptionalIntroOutro(cutListData.outroSrc);

		res.json({ exists: true, cutList, introSrc, outroSrc, path: path.relative(__dirname, cutListPath) });
	} catch (error) {
		console.error("Error loading cutlist:", error);
		res.status(400).json({ error: error.message || "Failed to load cutlist" });
	}
});

app.post("/cutlists", async (req, res) => {
	try {
		const videoSrc = normalizeVideoPath(req.body.videoSrc);
		const cutList = normalizeCutList(req.body.cutList);
		const introSrc = normalizeOptionalIntroOutro(req.body.introSrc);
		const outroSrc = normalizeOptionalIntroOutro(req.body.outroSrc);
		const cutListPath = await saveCutlistForVideo(videoSrc, { cutList, introSrc, outroSrc });
		const editCommand = getEditCommand(videoSrc, { introSrc, outroSrc });

		res.json({ ok: true, path: path.relative(__dirname, cutListPath), editCommand });
	} catch (error) {
		console.error("Error saving cutlist:", error);
		res.status(400).json({ error: error.message || "Failed to save cutlist" });
	}
});

app.post("/edits", async (req, res) => {
	try {
		const videoSrc = normalizeVideoPath(req.body.videoSrc);
		const cutList = normalizeCutList(req.body.cutList);
		const introSrc = normalizeOptionalIntroOutro(req.body.introSrc);
		const outroSrc = normalizeOptionalIntroOutro(req.body.outroSrc);
		const debugBlackCuts = Boolean(req.body.debugBlackCuts);
		const cutListPath = await saveCutlistForVideo(videoSrc, { cutList, introSrc, outroSrc });
		const command = getEditCommand(videoSrc, { introSrc, outroSrc, debugBlackCuts });
		const output = path.join("public", getEditedVideoPath(videoSrc, { debugBlackCuts })).split(path.sep).join("/");
		const outputUrl = getEditedVideoPath(videoSrc, { debugBlackCuts }).split(path.sep).map(encodeURIComponent).join("/");
		const jobId = crypto.randomUUID();
		const job = {
			id: jobId,
			status: "running",
			command,
			cutListPath: path.relative(__dirname, cutListPath),
			output,
			outputUrl,
			progress: { percent: 0, message: "Queued edit..." },
			stdout: "",
			stderr: "",
			error: null,
		};

		editJobs.set(jobId, job);
		runEdit(videoSrc, {
			introSrc,
			outroSrc,
			debugBlackCuts,
			onProgress: (progress) => {
				job.progress = progress;
			},
		}).then((result) => {
			job.status = "complete";
			job.progress = { percent: 100, message: "Edit complete." };
			job.stdout = result.stdout;
			job.stderr = result.stderr;
		}).catch((error) => {
			job.status = "failed";
			job.error = error.message || "Failed to edit video";
			job.stdout = error.stdout || "";
			job.stderr = error.stderr || "";
			job.progress = { percent: job.progress.percent || 0, message: "Edit failed." };
		});

		res.status(202).json({ ok: true, jobId, command, output, outputUrl });
	} catch (error) {
		console.error("Error editing video:", error);
		res.status(500).json({
			error: error.message || "Failed to edit video",
			stdout: error.stdout,
			stderr: error.stderr,
		});
	}
});

app.get("/existing-edit", async (req, res) => {
	try {
		const videoSrc = normalizeVideoPath(req.query.videoSrc);
		const debugBlackCuts = req.query.debugBlackCuts === "true";
		const editedVideoPath = getEditedVideoPath(videoSrc, { debugBlackCuts });
		const absoluteEditedVideoPath = path.join(publicDir, editedVideoPath);

		if (!fs.existsSync(absoluteEditedVideoPath)) {
			res.json({ exists: false });
			return;
		}

		const stats = await fs.promises.stat(absoluteEditedVideoPath);

		res.json({
			exists: true,
			output: path.join("public", editedVideoPath).split(path.sep).join("/"),
			outputUrl: editedVideoPath.split(path.sep).map(encodeURIComponent).join("/"),
			updatedAt: stats.mtime.toISOString(),
		});
	} catch (error) {
		console.error("Error loading existing edit:", error);
		res.status(400).json({ error: error.message || "Failed to load existing edit" });
	}
});

app.get("/edits/:jobId", (req, res) => {
	const job = editJobs.get(req.params.jobId);

	if (!job) {
		res.status(404).json({ error: "Edit job not found." });
		return;
	}

	res.json({
		ok: true,
		status: job.status,
		progress: job.progress,
		command: job.command,
		output: job.output,
		outputUrl: job.outputUrl,
		stdout: job.stdout,
		stderr: job.stderr,
		error: job.error,
	});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

async function getVideoFiles(directory, baseDirectory = directory) {
	const entries = await fs.promises.readdir(directory, { withFileTypes: true });
	const videos = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = path.join(directory, entry.name);

			if (entry.isDirectory()) {
				return getVideoFiles(entryPath, baseDirectory);
			}

			if (!entry.isFile() || !videoExtensions.has(path.extname(entry.name).toLowerCase())) {
				return [];
			}

			return [path.relative(baseDirectory, entryPath).split(path.sep).join("/")];
		})
	);

	return videos.flat().sort((a, b) => a.localeCompare(b));
}

function normalizeOptionalIntroOutro(assetSrc) {
	if (!assetSrc) {
		return null;
	}

	const normalized = normalizeVideoPath(assetSrc);
	const assetPath = getIntroOutroPath(normalized);

	if (!fs.existsSync(assetPath)) {
		throw new Error(`Intro/outro asset does not exist: ${assetSrc}`);
	}

	return normalized;
}

async function saveCutlistForVideo(videoSrc, options) {
	const cutListPath = getCutListPath(videoSrc);

	await fs.promises.mkdir(path.dirname(cutListPath), { recursive: true });
	await fs.promises.writeFile(
		cutListPath,
		`${JSON.stringify({
			videoSrc,
			cutList: options.cutList,
			introSrc: options.introSrc,
			outroSrc: options.outroSrc,
			updatedAt: new Date().toISOString(),
		}, null, 2)}\n`
	);

	return cutListPath;
}

function getEditCommand(videoSrc, options = {}) {
	const args = ["node", "edit_video.cjs", shellQuote(videoSrc)];

	if (options.introSrc) {
		args.push("--intro", shellQuote(options.introSrc));
	}

	if (options.outroSrc) {
		args.push("--outro", shellQuote(options.outroSrc));
	}

	if (options.debugBlackCuts) {
		args.push("--debug-black-cuts");
	}

	return args.join(" ");
}

function getEditedVideoPath(videoSrc, options = {}) {
	const parsed = path.parse(videoSrc);
	const outputSuffix = options.debugBlackCuts ? "TV-Edit-Debug" : "TV-Edit";
	return path.join("edits", parsed.dir, `${parsed.name}-${outputSuffix}.mp4`);
}

function shellQuote(value) {
	return `'${value.replaceAll("'", "'\\''")}'`;
}

function runEdit(videoSrc, options = {}) {
	return new Promise((resolve, reject) => {
		const args = ["edit_video.cjs", videoSrc];

		if (options.introSrc) {
			args.push("--intro", options.introSrc);
		}

		if (options.outroSrc) {
			args.push("--outro", options.outroSrc);
		}

		if (options.debugBlackCuts) {
			args.push("--debug-black-cuts");
		}

		const child = spawn(process.execPath, args, {
			cwd: __dirname,
		});
		let stdout = "";
		let stderr = "";
		let stdoutBuffer = "";

		child.stdout.on("data", (data) => {
			stdoutBuffer += data.toString();
			const lines = stdoutBuffer.split(/\r?\n/);
			stdoutBuffer = lines.pop();

			lines.forEach((line) => {
				if (line.startsWith("PROGRESS:")) {
					try {
						if (typeof options.onProgress === "function") {
							options.onProgress(JSON.parse(line.slice("PROGRESS:".length)));
						}
					} catch (error) {
						stdout += `${line}\n`;
					}
					return;
				}

				stdout += `${line}\n`;
			});
		});
		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});
		child.on("error", (error) => {
			stdout += stdoutBuffer;
			error.stdout = stdout;
			error.stderr = stderr;
			reject(error);
		});
		child.on("close", (code) => {
			if (stdoutBuffer) {
				if (stdoutBuffer.startsWith("PROGRESS:")) {
					try {
						if (typeof options.onProgress === "function") {
							options.onProgress(JSON.parse(stdoutBuffer.slice("PROGRESS:".length)));
						}
					} catch (error) {
						stdout += stdoutBuffer;
					}
				} else {
					stdout += stdoutBuffer;
				}
			}

			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			const error = new Error(`Edit command failed with exit code ${code}.`);
			error.stdout = stdout;
			error.stderr = stderr;
			reject(error);
		});
	});
}

async function getFrameRate(videoPath) {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(videoPath, (err, metadata) => {
			if (err) {
				reject(err);
			} else {
				const videoStream = metadata.streams.find(
					(stream) => stream.codec_type === "video"
				);
				resolve(videoStream.avg_frame_rate);
			}
		});
	});
}
