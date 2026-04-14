const urlParams = new URLSearchParams(window.location.search);
const videoSrc = urlParams.get("src");
const videoElement = document.getElementById("video");
const videoSelect = document.getElementById("video-select");
const introSelect = document.getElementById("intro-select");
const outroSelect = document.getElementById("outro-select");
const introSelected = document.getElementById("intro-selected");
const outroSelected = document.getElementById("outro-selected");
const introPreview = document.getElementById("intro-preview");
const outroPreview = document.getElementById("outro-preview");
const video = document.getElementById("video");
const timestamps = document.getElementById("timestamps");
const saveCutlistButton = document.getElementById("save-cutlist");
const editVideoButton = document.getElementById("edit-video");
const debugBlackCutsInput = document.getElementById("debug-black-cuts");
const frameStepSeekInput = document.getElementById("frame-step-seek");
const selectedVideoLabel = document.getElementById("selected-video-label");
const statusElement = document.getElementById("status");
const cutlistElement = document.getElementById("cutlist");
const cutCountElement = document.getElementById("cut-count");
const finalVideoElement = document.getElementById("final-video");
const playbackRateElement = document.getElementById("playback-rate");
const seekBackwardButton = document.getElementById("seekBackward");
const seekForwardButton = document.getElementById("seekForward");
const toggleCutButton = document.getElementById("toggleCut");
const speedUpButton = document.getElementById("speedUp");
const slowDownButton = document.getElementById("slowDown");
const editProgressElement = document.getElementById("edit-progress");
const editProgressBar = document.getElementById("edit-progress-bar");
const editProgressLabel = document.getElementById("edit-progress-label");
const editProgressPercent = document.getElementById("edit-progress-percent");
const segmentProgressElement = document.getElementById("segment-progress");
const segmentProgressBar = document.getElementById("segment-progress-bar");
const segmentProgressLabel = document.getElementById("segment-progress-label");
const segmentProgressPercent = document.getElementById("segment-progress-percent");
const segmentProgressEta = document.getElementById("segment-progress-eta");
const SEEK_SECONDS = 10;

let cutStart = null;
let cutList = [];

document.body.classList.toggle("has-video", Boolean(videoSrc));
selectedVideoLabel.textContent = videoSrc ? getFileName(videoSrc) : "No video loaded";
setActionControlsEnabled(Boolean(videoSrc));
setTransportControlsEnabled(false);
updatePlaybackRateDisplay();

populateVideoSelect();
const introOutroAssetsReady = populateIntroOutroSelects();

const setupVideo = async () => {
	const frameRateFraction = await getFrameRate(videoSrc);
	console.log("frame rate:", frameRateFraction);
	setupEventListeners(videoElement, frameRateFraction);
};

if (videoSrc) {
	introOutroAssetsReady.then(() => loadCutlist(videoSrc));
	loadExistingFinalEdit(videoSrc);
	const sourceElement = videoElement.getElementsByTagName("source")[0];
	console.log("setting source to: ", videoSrc);
	sourceElement.src = videoSrc;
	videoElement.addEventListener("loadedmetadata", setupVideo); // Run setupVideo when metadata is loaded
	videoElement.load(); // Important: Load the video again after setting the source
}


async function populateVideoSelect() {
	try {
		const response = await fetch("/videos");
		const data = await response.json();

		data.videos.forEach((video) => {
			const option = document.createElement("option");
			option.value = video;
			option.textContent = video;
			option.selected = video === videoSrc;
			videoSelect.appendChild(option);
		});
	} catch (error) {
		console.error("Error loading video list:", error);
	}
}

async function populateIntroOutroSelects() {
	try {
		const response = await fetch("/intro-outro-assets");
		const data = await response.json();

		data.assets.forEach((asset) => {
			introSelect.appendChild(createAssetOption(asset));
			outroSelect.appendChild(createAssetOption(asset));
		});
		updateIntroOutroPreviews();
	} catch (error) {
		console.error("Error loading intro/outro list:", error);
	}
}

function createAssetOption(asset) {
	const option = document.createElement("option");
	option.value = asset;
	option.textContent = asset;
	return option;
}

async function loadCutlist(selectedVideoSrc) {
	try {
		const response = await fetch(`/cutlists?videoSrc=${encodeURIComponent(selectedVideoSrc)}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to load cutlist.");
		}

		cutList = data.cutList;
		introSelect.value = data.introSrc || "";
		outroSelect.value = data.outroSrc || "";
		updateCutlistDisplay();
		updateIntroOutroPreviews();

		if (data.exists) {
			statusElement.textContent = `Loaded cutlist from ${data.path}`;
		} else {
			statusElement.textContent = `No saved cutlist yet for ${selectedVideoSrc}`;
		}
	} catch (error) {
		console.error("Error loading cutlist:", error);
		statusElement.textContent = error.message;
	}
}

async function loadExistingFinalEdit(selectedVideoSrc) {
	try {
		const response = await fetch(`/existing-edit?videoSrc=${encodeURIComponent(selectedVideoSrc)}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to load existing final edit.");
		}

		if (data.exists) {
			showFinalVideo(data.outputUrl);
		}
	} catch (error) {
		console.error("Error loading existing final edit:", error);
	}
}

videoSelect.addEventListener("change", () => {
	if (!videoSelect.value) {
		return;
	}

	const nextUrl = new URL(window.location.href);
	nextUrl.searchParams.set("src", videoSelect.value);
	window.location.href = nextUrl.toString();
});

introSelect.addEventListener("change", updateIntroOutroPreviews);
outroSelect.addEventListener("change", updateIntroOutroPreviews);

function updateIntroOutroPreviews() {
	updateAssetPreview(introSelect.value, introSelected, introPreview);
	updateAssetPreview(outroSelect.value, outroSelected, outroPreview);
}

function updateAssetPreview(asset, selectedElement, previewElement) {
	if (!asset) {
		selectedElement.textContent = "None";
		previewElement.hidden = true;
		previewElement.removeAttribute("src");
		previewElement.load();
		return;
	}

	selectedElement.textContent = asset;
	previewElement.src = `intros-and-outros/${asset.split("/").map(encodeURIComponent).join("/")}`;
	previewElement.hidden = false;
	previewElement.load();
}


async function getFrameRate(videoSrc) {
	try {
		const response = await fetch(`/get-frame-rate?videoSrc=${encodeURIComponent(videoSrc)}`);
		const data = await response.json();
		return data.frameRate;
	} catch (error) {
		console.error("Error fetching frame rate:", error);
		return 30; // Default frame rate if fetching fails
	}
}

function setupEventListeners(videoElement, frameRateFraction) {
	console.log("setupEventListeners frameRateFraction: ", frameRateFraction);
	const frameRate = parseFrameRate(frameRateFraction);
	document.addEventListener("keydown", (event) => {
		const key = event.key;

		if (key === "ArrowRight") {
			console.log("advance", frameRateFraction);
			event.preventDefault();
			event.stopPropagation();
			advanceFrame(videoElement, frameRateFraction, true);
		} else if (key === "ArrowLeft") {
			event.preventDefault();
			event.stopPropagation();
			advanceFrame(videoElement, frameRateFraction, false);
		}
	});

	const currentTimeElement = document.getElementById("currentTime");
	const currentSecondsElement = document.getElementById("currentSeconds");
	const currentFrameElement = document.getElementById("currentFrame");
	const currentFrameTimeElement = document.getElementById("currentFrameTime");
	const currentFpsElement = document.getElementById("currentFps");

	let cutInProgress = null;
	const updateViewerReadout = () => {
		const frameNumber = getFrameNumber(videoElement.currentTime, frameRate);
		const frameTime = getFrameTime(frameNumber, frameRate);

		currentTimeElement.textContent = formatTime(videoElement.currentTime);
		currentSecondsElement.textContent = videoElement.currentTime.toFixed(6);
		currentFrameElement.textContent = String(frameNumber);
		currentFrameTimeElement.textContent = formatTime(frameTime, 6);
		currentFpsElement.textContent = Number.isFinite(frameRate)
			? `${frameRate.toFixed(6)} (${frameRateFraction})`
			: String(frameRateFraction || "Unknown");
	};

	seekBackwardButton.addEventListener("click", () => {
		console.log("back");
		seekVideo(videoElement, frameRateFraction, false);
	});

	seekForwardButton.addEventListener("click", () => {
		console.log("forward");
		seekVideo(videoElement, frameRateFraction, true);
	});

	toggleCutButton.addEventListener("click", () => {
		if (cutInProgress) {
			cutInProgress.end = getFrameTime(getFrameNumber(videoElement.currentTime, frameRate), frameRate).toFixed(6);
			cutList.push(cutInProgress);
			cutInProgress = null;
			toggleCutButton.textContent = "Cut Start";
		} else {
			cutInProgress = {
				start: getFrameTime(getFrameNumber(videoElement.currentTime, frameRate), frameRate).toFixed(6),
			};
			toggleCutButton.textContent = "Cut End";
		}
		updateCutlistDisplay();
	});
	videoElement.addEventListener("loadedmetadata", updateViewerReadout);
	videoElement.addEventListener("seeked", updateViewerReadout);
	videoElement.addEventListener("timeupdate", updateViewerReadout);
	setTransportControlsEnabled(true);
	updateViewerReadout();
}

function updateCutlistDisplay() {
	cutlistElement.value = JSON.stringify(cutList, null, "\t");
	updateCutCount(cutList.length);
}

function readCutlistFromEditor() {
	const text = cutlistElement.value.trim();

	if (!text) {
		updateCutCount(0);
		return [];
	}

	const parsed = JSON.parse(text);
	const editedCutList = Array.isArray(parsed) ? parsed : parsed.cutList;

	if (!Array.isArray(editedCutList)) {
		throw new Error("Cutlist must be a JSON array or an object with a cutList array.");
	}

	updateCutCount(editedCutList.length);
	return editedCutList;
}

cutlistElement.addEventListener("input", () => {
	try {
		readCutlistFromEditor();
	} catch (error) {
		cutCountElement.textContent = "Check JSON";
	}
});

function seekVideo(video, frameRateFraction, forward = true) {
	if (frameStepSeekInput.checked) {
		advanceFrame(video, frameRateFraction, forward);
		return;
	}

	const direction = forward ? 1 : -1;
	const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
	video.currentTime = Math.max(0, Math.min(duration, video.currentTime + direction * SEEK_SECONDS));
}

function advanceFrame(video, frameRateFraction, forward = true) {
	const frameRate = parseFrameRate(frameRateFraction);

	if (isFinite(frameRate)) {
		const currentFrame = getNearestFrameNumber(video.currentTime, frameRate);
		const nextFrame = Math.max(0, forward ? currentFrame + 1 : currentFrame - 1);
		const nextTime = getFrameTime(nextFrame, frameRate);
		console.log("currentTime", video.currentTime, "nextTime: ", nextTime);
		video.currentTime = nextTime;
	} else {
		console.error("Invalid frame rate:", frameRateFraction);
	}
}

function parseFrameRate(frameRateFraction) {
	if (typeof frameRateFraction === "number") {
		return frameRateFraction;
	}

	const [numerator, denominator = 1] = String(frameRateFraction).split("/").map(Number);
	const frameRate = numerator / denominator;

	return Number.isFinite(frameRate) ? frameRate : NaN;
}

function getFrameNumber(time, frameRate) {
	if (!Number.isFinite(frameRate)) {
		return 0;
	}

	return Math.max(0, Math.floor(time * frameRate + 1e-6));
}

function getNearestFrameNumber(time, frameRate) {
	if (!Number.isFinite(frameRate)) {
		return 0;
	}

	return Math.max(0, Math.round(time * frameRate));
}

function getFrameTime(frameNumber, frameRate) {
	if (!Number.isFinite(frameRate) || frameRate <= 0) {
		return 0;
	}

	return frameNumber / frameRate;
}

const formatTime = (time, decimals = 3) => {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);
	const fractionalSeconds = Math.floor((time % 1) * 10 ** decimals);

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}.${fractionalSeconds.toString().padStart(decimals, "0")}`;
};

saveCutlistButton.addEventListener("click", async () => {
	if (!videoSrc) {
		alert("Choose a video before saving a cutlist.");
		return;
	}

	try {
		const data = await saveCutlist();

		statusElement.textContent = `Cutlist saved to ${data.path}\n\nTerminal command:\n${data.editCommand}`;
		alert(`Cutlist saved. You can click Edit Video now.`);
	} catch (error) {
		console.error("Error saving cutlist: ", error);
		statusElement.textContent = error.message;
		alert(error.message);
	}
});

async function saveCutlist() {
	cutList = readCutlistFromEditor();
	updateCutlistDisplay();

	const response = await fetch("/cutlists", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			videoSrc,
			cutList,
			introSrc: introSelect.value,
			outroSrc: outroSelect.value,
		}),
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "Failed to save cutlist.");
	}

	return data;
}

function updateEditProgress(progress) {
	const percent = Math.max(0, Math.min(100, Math.round(Number(progress.percent) || 0)));
	editProgressElement.hidden = false;
	editProgressBar.value = percent;
	editProgressLabel.textContent = progress.message || "Editing video...";
	editProgressPercent.textContent = `${percent}%`;

	if (progress.segment) {
		updateSegmentProgress(progress.segment);
	} else if (percent >= 90 || progress.message === "Edit failed.") {
		resetSegmentProgress();
	}
}

function resetEditProgress() {
	updateEditProgress({ percent: 0, message: "Preparing edit..." });
	resetSegmentProgress();
}

function updateSegmentProgress(segment) {
	if (!segment) {
		return;
	}

	const percent = Math.max(0, Math.min(100, Math.round(Number(segment.percent) || 0)));
	segmentProgressElement.hidden = false;
	segmentProgressBar.value = percent;
	segmentProgressLabel.textContent = segment.message || `Segment ${segment.index || ""}`.trim();
	segmentProgressPercent.textContent = `${percent}%`;
	segmentProgressEta.textContent = segment.eta ? `Estimated time left: ${segment.eta}` : "";
}

function resetSegmentProgress() {
	segmentProgressElement.hidden = true;
	segmentProgressBar.value = 0;
	segmentProgressLabel.textContent = "Preparing segment...";
	segmentProgressPercent.textContent = "0%";
	segmentProgressEta.textContent = "";
}

function showFinalVideo(outputUrl) {
	finalVideoElement.src = `${outputUrl}?t=${Date.now()}`;
	finalVideoElement.hidden = false;
	document.body.classList.add("has-final-video");
	finalVideoElement.load();
}

async function waitForEditJob(jobId) {
	while (true) {
		const response = await fetch(`/edits/${encodeURIComponent(jobId)}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to check edit progress.");
		}

		updateEditProgress(data.progress || { percent: 0, message: "Editing video..." });

		if (data.status === "complete") {
			return data;
		}

		if (data.status === "failed") {
			throw new Error([data.error, data.stderr, data.stdout].filter(Boolean).join("\n\n") || "Failed to edit video.");
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

editVideoButton.addEventListener("click", async () => {
	if (!videoSrc) {
		alert("Choose a video before editing.");
		return;
	}

	editVideoButton.disabled = true;
	resetEditProgress();
	statusElement.textContent = debugBlackCutsInput.checked
		? "Creating debug edit with black screens where cuts occur. This may take a while..."
		: "Editing video. This may take a while...";

	try {
		const saved = await saveCutlist();
		statusElement.textContent = debugBlackCutsInput.checked
			? `Cutlist saved to ${saved.path}\n\nCreating debug edit with black screens where cuts occur. This may take a while...`
			: `Cutlist saved to ${saved.path}\n\nEditing video. This may take a while...`;

		updateEditProgress({ percent: 5, message: "Starting edit job..." });
		const response = await fetch("/edits", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				videoSrc,
				cutList,
				introSrc: introSelect.value,
				outroSrc: outroSelect.value,
				debugBlackCuts: debugBlackCutsInput.checked,
			}),
		});
		const started = await response.json();

		if (!response.ok) {
			throw new Error([started.error, started.stderr, started.stdout].filter(Boolean).join("\n\n") || "Failed to edit video.");
		}

		const data = await waitForEditJob(started.jobId);
		updateEditProgress({ percent: 100, message: "Edit complete." });
		resetSegmentProgress();
		statusElement.textContent = `Edit complete: ${data.output}\n\nCommand:\n${data.command}`;
		showFinalVideo(data.outputUrl);
		alert(`Edit complete: ${data.output}`);
	} catch (error) {
		console.error("Error editing video: ", error);
		statusElement.textContent = error.message;
		alert(error.message);
	} finally {
		editVideoButton.disabled = false;
	}
});

speedUpButton.addEventListener("click", function () {
	videoElement.playbackRate += 0.5; // Increase playback speed by 0.5
	updatePlaybackRateDisplay();
});

slowDownButton.addEventListener("click", function () {
	if (videoElement.playbackRate > 0.5) {
		videoElement.playbackRate -= 0.5; // Decrease playback speed by 0.5, but keep it positive
	}
	updatePlaybackRateDisplay();
});

videoElement.addEventListener("ratechange", updatePlaybackRateDisplay);

function setActionControlsEnabled(enabled) {
	saveCutlistButton.disabled = !enabled;
	editVideoButton.disabled = !enabled;
	debugBlackCutsInput.disabled = !enabled;
}

function setTransportControlsEnabled(enabled) {
	[seekBackwardButton, seekForwardButton, toggleCutButton, speedUpButton, slowDownButton].forEach((button) => {
		button.disabled = !enabled;
	});
	frameStepSeekInput.disabled = !enabled;
}

function updateCutCount(count) {
	cutCountElement.textContent = `${count} ${count === 1 ? "cut" : "cuts"}`;
}

function updatePlaybackRateDisplay() {
	playbackRateElement.textContent = `${videoElement.playbackRate.toFixed(1)}x`;
}

function getFileName(src) {
	const fileName = decodeURIComponent(src.split("/").pop() || src);
	return fileName.replace(/\.[^.]+$/, "");
}
