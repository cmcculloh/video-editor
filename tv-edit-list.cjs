const fs = require("fs");
const path = require("path");

const cutlistsDir = path.join(__dirname, "cutlists");
const introsAndOutrosDir = path.join(__dirname, "public", "intros-and-outros");
const CUT_MODE_REMOVE = "remove";
const CUT_MODE_REPLACE = "replace";
const DEFAULT_REPLACEMENT_COLOR = "#000000";

function normalizeVideoPath(videoFile) {
	if (!videoFile || typeof videoFile !== "string") {
		throw new Error("Video filename is required.");
	}

	const decodedVideoFile = decodeVideoPath(videoFile);
	const normalized = path.posix.normalize(decodedVideoFile.replaceAll("\\", "/"));

	if (
		normalized === "." ||
		normalized === ".." ||
		normalized.startsWith("../") ||
		path.posix.isAbsolute(normalized)
	) {
		throw new Error(`Invalid video filename: ${videoFile}`);
	}

	return normalized;
}

function decodeVideoPath(videoFile) {
	try {
		return decodeURIComponent(videoFile);
	} catch (error) {
		return videoFile;
	}
}

function getCutListPath(videoFile) {
	const normalized = normalizeVideoPath(videoFile);
	const cutListPath = path.join(cutlistsDir, `${normalized}.json`);
	const resolvedCutListPath = path.resolve(cutListPath);
	const resolvedCutlistsDir = path.resolve(cutlistsDir);

	if (!resolvedCutListPath.startsWith(`${resolvedCutlistsDir}${path.sep}`)) {
		throw new Error(`Invalid cutlist path for video: ${videoFile}`);
	}

	return resolvedCutListPath;
}

function getIntroOutroPath(assetFile) {
	const normalized = normalizeVideoPath(assetFile);
	const assetPath = path.join(introsAndOutrosDir, normalized);
	const resolvedAssetPath = path.resolve(assetPath);
	const resolvedAssetsDir = path.resolve(introsAndOutrosDir);

	if (!resolvedAssetPath.startsWith(`${resolvedAssetsDir}${path.sep}`)) {
		throw new Error(`Invalid intro/outro path: ${assetFile}`);
	}

	return resolvedAssetPath;
}

function getCutListForVideo(videoFile) {
	return getCutListConfigForVideo(videoFile).cutList;
}

function getCutListConfigForVideo(videoFile) {
	const cutListPath = getCutListPath(videoFile);

	if (!fs.existsSync(cutListPath)) {
		throw new Error(`No saved cutlist found for ${videoFile}. Expected ${cutListPath}`);
	}

	const cutListData = JSON.parse(fs.readFileSync(cutListPath, "utf8"));
	const cutList = Array.isArray(cutListData) ? cutListData : cutListData.cutList;

	if (!Array.isArray(cutList)) {
		throw new Error(`Saved cutlist is not an array: ${cutListPath}`);
	}

	return {
		cutList: normalizeCutList(cutList),
		introSrc: cutListData.introSrc || null,
		outroSrc: cutListData.outroSrc || null,
	};
}

function normalizeCutList(cutList) {
	if (!Array.isArray(cutList)) {
		throw new Error("Cutlist must be an array.");
	}

	return cutList
		.map((cut, index) => {
			const start = Number.parseFloat(cut.start);
			const end = Number.parseFloat(cut.end);
			const mode = normalizeCutMode(cut.mode);

			if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
				throw new Error(`Invalid cut at index ${index}.`);
			}

			const normalizedCut = {
				start: start.toFixed(6),
				end: end.toFixed(6),
				mode,
			};

			if (mode === CUT_MODE_REPLACE) {
				normalizedCut.color = normalizeCutColor(cut.color || DEFAULT_REPLACEMENT_COLOR, index);
			}

			return normalizedCut;
		})
		.sort((a, b) => Number.parseFloat(a.start) - Number.parseFloat(b.start));
}

function normalizeCutMode(mode) {
	if (!mode || mode === CUT_MODE_REMOVE) {
		return CUT_MODE_REMOVE;
	}

	if (mode === CUT_MODE_REPLACE) {
		return CUT_MODE_REPLACE;
	}

	throw new Error(`Invalid cut mode: ${mode}`);
}

function normalizeCutColor(color, index) {
	if (typeof color !== "string") {
		throw new Error(`Invalid replacement color at cut ${index}.`);
	}

	const trimmed = color.trim();
	const shortMatch = trimmed.match(/^#([0-9a-f]{3})$/i);

	if (shortMatch) {
		return `#${shortMatch[1].split("").map((character) => character + character).join("")}`.toLowerCase();
	}

	if (!/^#[0-9a-f]{6}$/i.test(trimmed)) {
		throw new Error(`Invalid replacement color at cut ${index}. Use a hex color like #00aaff.`);
	}

	return trimmed.toLowerCase();
}

module.exports = {
	CUT_MODE_REMOVE,
	CUT_MODE_REPLACE,
	cutlistsDir,
	DEFAULT_REPLACEMENT_COLOR,
	getCutListConfigForVideo,
	getIntroOutroPath,
	getCutListForVideo,
	getCutListPath,
	introsAndOutrosDir,
	normalizeCutList,
	normalizeVideoPath,
};
