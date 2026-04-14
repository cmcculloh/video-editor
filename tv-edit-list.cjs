const fs = require("fs");
const path = require("path");

const cutlistsDir = path.join(__dirname, "cutlists");
const introsAndOutrosDir = path.join(__dirname, "public", "intros-and-outros");

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

			if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
				throw new Error(`Invalid cut at index ${index}.`);
			}

			return {
				start: start.toFixed(6),
				end: end.toFixed(6),
			};
		})
		.sort((a, b) => Number.parseFloat(a.start) - Number.parseFloat(b.start));
}

module.exports = {
	cutlistsDir,
	getCutListConfigForVideo,
	getIntroOutroPath,
	getCutListForVideo,
	getCutListPath,
	introsAndOutrosDir,
	normalizeCutList,
	normalizeVideoPath,
};
