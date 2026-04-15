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
const skipCutsPreviewInput = document.getElementById("skip-cuts-preview");
const skipCutsStatusElement = document.getElementById("skip-cuts-status");
const selectedVideoLabel = document.getElementById("selected-video-label");
const statusElement = document.getElementById("status");
const cutlistElement = document.getElementById("cutlist");
const cutCountElement = document.getElementById("cut-count");
const finalVideoElement = document.getElementById("final-video");
const playbackRateElement = document.getElementById("playback-rate");
const timelineElement = document.getElementById("timeline");
const timelineThumbnailsElement = document.getElementById("timeline-thumbnails");
const timelineCutsElement = document.getElementById("timeline-cuts");
const timelinePlayheadElement = document.getElementById("timeline-playhead");
const timelineStatusElement = document.getElementById("timeline-status");
const timelineDurationElement = document.getElementById("timeline-duration");
const timelineStartElement = document.getElementById("timeline-start");
const timelineEndElement = document.getElementById("timeline-end");
const timelineWindowElement = document.getElementById("timeline-window");
const timelineZoomOutButton = document.getElementById("timeline-zoom-out");
const timelineZoomInButton = document.getElementById("timeline-zoom-in");
const timelineFitButton = document.getElementById("timeline-fit");
const timelineCenterPlayheadButton = document.getElementById("timeline-center-playhead");
const cutPointEditorElement = document.getElementById("cut-point-editor");
const cutPointLabelElement = document.getElementById("cut-point-label");
const cutPointTimeElement = document.getElementById("cut-point-time");
const cutPointInputElement = document.getElementById("cut-point-input");
const cutPointUsePlayheadButton = document.getElementById("cut-point-use-playhead");
const cutPointClearButton = document.getElementById("cut-point-clear");
const toastRegionElement = document.getElementById("toast-region");
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
const MAX_TIMELINE_THUMBNAILS = 36;
const MIN_TIMELINE_THUMBNAILS = 10;
const TIMELINE_THUMBNAIL_WIDTH = 160;
const TIMELINE_THUMBNAIL_HEIGHT = 90;
const CUT_POINT_MIN_GAP = 0.001;
const PREVIEW_SKIP_EPSILON = 0.03;
const MIN_TIMELINE_WINDOW_SECONDS = 2;
const TIMELINE_ZOOM_FACTOR = 2;

let cutStart = null;
let cutList = [];
let timelineDuration = 0;
let timelineViewStart = 0;
let timelineViewEnd = 0;
let timelineThumbnailRun = 0;
let timelineScrubbing = false;
let selectedCutPoint = null;
let activeCutPointDrag = null;
let previewSkipFrame = null;
let lastSkippedCutEnd = null;

document.body.classList.toggle("has-video", Boolean(videoSrc));
selectedVideoLabel.textContent = videoSrc ? getFileName(videoSrc) : "No video loaded";
setActionControlsEnabled(Boolean(videoSrc));
setTransportControlsEnabled(false);
updatePlaybackRateDisplay();
updatePreviewSkipState();

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
		if (event.target.closest("input, textarea, select, .timeline__cut-handle")) {
			return;
		}

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
		updateTimelinePlayhead();
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
	videoElement.addEventListener("play", startPreviewSkipLoop);
	videoElement.addEventListener("playing", startPreviewSkipLoop);
	videoElement.addEventListener("pause", stopPreviewSkipLoop);
	videoElement.addEventListener("ended", stopPreviewSkipLoop);
	setTransportControlsEnabled(true);
	setupTimeline(videoElement).catch((error) => {
		console.error("Error setting up timeline:", error);
		timelineStatusElement.textContent = "Timeline is unavailable for this video.";
		timelineElement.classList.remove("timeline--loading");
	});
	updateViewerReadout();
}

function updateCutlistDisplay() {
	cutlistElement.value = JSON.stringify(cutList, null, "\t");
	updateCutCount(cutList.length);
	renderCutOverlays(cutList);
	updateCutPointEditor();
	updatePreviewSkipState(cutList);
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
	renderCutOverlays(editedCutList);
	timelineElement.classList.remove("timeline--invalid");
	updateCutPointEditor();
	updatePreviewSkipState(editedCutList);
	return editedCutList;
}

cutlistElement.addEventListener("input", () => {
	try {
		cutList = readCutlistFromEditor();
		renderCutOverlays(cutList);
		updateCutPointEditor();
	} catch (error) {
		cutCountElement.textContent = "Check JSON";
		timelineElement.classList.add("timeline--invalid");
		hideCutPointEditor();
	}
});

timelineElement.addEventListener("pointerdown", (event) => {
	if (!canUseTimeline()) {
		return;
	}

	if (event.target.closest(".timeline__cut-handle")) {
		return;
	}

	timelineScrubbing = true;
	timelineElement.setPointerCapture(event.pointerId);
	scrubTimelineToPointer(event);
});

timelineElement.addEventListener("pointermove", (event) => {
	if (!timelineScrubbing) {
		return;
	}

	scrubTimelineToPointer(event);
});

timelineElement.addEventListener("pointerup", (event) => {
	timelineScrubbing = false;

	if (timelineElement.hasPointerCapture(event.pointerId)) {
		timelineElement.releasePointerCapture(event.pointerId);
	}
});

timelineElement.addEventListener("pointercancel", (event) => {
	timelineScrubbing = false;

	if (timelineElement.hasPointerCapture(event.pointerId)) {
		timelineElement.releasePointerCapture(event.pointerId);
	}
});

timelineElement.addEventListener("keydown", (event) => {
	if (!canUseTimeline()) {
		return;
	}

	const step = event.shiftKey ? 10 : 1;

	if (event.key === "ArrowLeft") {
		event.preventDefault();
		event.stopPropagation();
		videoElement.currentTime = clamp(videoElement.currentTime - step, 0, timelineDuration);
	} else if (event.key === "ArrowRight") {
		event.preventDefault();
		event.stopPropagation();
		videoElement.currentTime = clamp(videoElement.currentTime + step, 0, timelineDuration);
	} else if (event.key === "Home") {
		event.preventDefault();
		event.stopPropagation();
		videoElement.currentTime = 0;
	} else if (event.key === "End") {
		event.preventDefault();
		event.stopPropagation();
		videoElement.currentTime = timelineDuration;
	}
});

window.addEventListener("pointermove", (event) => {
	if (!activeCutPointDrag) {
		return;
	}

	if (!activeCutPointDrag.hasMoved && Math.abs(event.clientX - activeCutPointDrag.startX) < 3) {
		return;
	}

	activeCutPointDrag.hasMoved = true;
	event.preventDefault();
	updateSelectedCutPointFromPointer(event, { showMessage: false });
});

window.addEventListener("pointerup", (event) => {
	if (!activeCutPointDrag || activeCutPointDrag.pointerId !== event.pointerId) {
		return;
	}

	if (activeCutPointDrag.hasMoved) {
		updateSelectedCutPointFromPointer(event, { showMessage: true });
	}

	activeCutPointDrag = null;
});

window.addEventListener("pointercancel", (event) => {
	if (activeCutPointDrag && activeCutPointDrag.pointerId === event.pointerId) {
		activeCutPointDrag = null;
	}
});

cutPointInputElement.addEventListener("change", () => {
	if (!selectedCutPoint) {
		return;
	}

	const nextTime = Number(cutPointInputElement.value);

	if (!Number.isFinite(nextTime)) {
		showToast("Invalid cut point", "Enter a time in seconds.", "error");
		updateCutPointEditor();
		return;
	}

	updateSelectedCutPoint(nextTime, { seek: true, showMessage: true });
});

cutPointInputElement.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		cutPointInputElement.blur();
	}
});

cutPointUsePlayheadButton.addEventListener("click", () => {
	if (!selectedCutPoint) {
		return;
	}

	updateSelectedCutPoint(videoElement.currentTime, { seek: true, showMessage: true });
});

cutPointClearButton.addEventListener("click", () => {
	clearSelectedCutPoint();
});

skipCutsPreviewInput.addEventListener("change", () => {
	updatePreviewSkipState();

	if (skipCutsPreviewInput.checked) {
		startPreviewSkipLoop();
		showToast("Skip cuts enabled", "Playback will jump over red cut ranges.");
	} else {
		stopPreviewSkipLoop();
		showToast("Skip cuts disabled", "Playback will include the full source video.");
	}
});

timelineZoomInButton.addEventListener("click", () => {
	zoomTimeline(1 / TIMELINE_ZOOM_FACTOR);
});

timelineZoomOutButton.addEventListener("click", () => {
	zoomTimeline(TIMELINE_ZOOM_FACTOR);
});

timelineFitButton.addEventListener("click", () => {
	setTimelineView(0, timelineDuration);
});

timelineCenterPlayheadButton.addEventListener("click", () => {
	centerTimelineOn(videoElement.currentTime);
});

async function setupTimeline(videoElement) {
	timelineDuration = Number.isFinite(videoElement.duration) ? videoElement.duration : 0;
	timelineDurationElement.textContent = formatClockTime(timelineDuration);
	timelineElement.setAttribute("aria-valuemax", String(Math.round(timelineDuration)));
	timelineElement.classList.toggle("timeline--loading", timelineDuration > 0);
	setTimelineView(0, timelineDuration, { renderThumbnails: false });
	renderCutOverlays(cutList);
	updatePreviewSkipState(cutList);
	updateTimelinePlayhead();

	if (!canUseTimeline()) {
		timelineStatusElement.textContent = "Timeline is unavailable for this video.";
		timelineElement.classList.remove("timeline--loading");
		return;
	}

	await renderTimelineThumbnails(videoElement.currentSrc || videoSrc, timelineDuration);
}

function setTimelineView(start, end, options = {}) {
	if (!canUseTimeline()) {
		timelineViewStart = 0;
		timelineViewEnd = 0;
		updateTimelineViewLabels();
		updateTimelineZoomControls();
		return;
	}

	const minWindow = getMinimumTimelineWindow();
	const requestedWindow = Math.max(minWindow, end - start);
	const windowSize = Math.min(timelineDuration, requestedWindow);
	let nextStart = clamp(start, 0, Math.max(0, timelineDuration - windowSize));
	let nextEnd = nextStart + windowSize;

	if (nextEnd > timelineDuration) {
		nextEnd = timelineDuration;
		nextStart = Math.max(0, nextEnd - windowSize);
	}

	timelineViewStart = nextStart;
	timelineViewEnd = nextEnd;
	updateTimelineViewLabels();
	updateTimelineZoomControls();
	renderCutOverlays(cutList);
	updateTimelinePlayhead();

	if (options.renderThumbnails !== false) {
		renderTimelineThumbnails(videoElement.currentSrc || videoSrc, timelineDuration);
	}
}

function zoomTimeline(windowMultiplier) {
	if (!canUseTimeline()) {
		return;
	}

	const currentWindow = getTimelineViewDuration();
	const nextWindow = clamp(currentWindow * windowMultiplier, getMinimumTimelineWindow(), timelineDuration);
	const anchor = getTimelineAnchorTime();
	const anchorRatio = currentWindow > 0 ? clamp((anchor - timelineViewStart) / currentWindow, 0, 1) : 0.5;
	const nextStart = anchor - nextWindow * anchorRatio;

	setTimelineView(nextStart, nextStart + nextWindow);
}

function centerTimelineOn(time) {
	if (!canUseTimeline()) {
		return;
	}

	const windowSize = getTimelineViewDuration() || timelineDuration;
	const center = Number.isFinite(time) ? time : 0;

	setTimelineView(center - windowSize / 2, center + windowSize / 2);
}

function ensureTimeVisible(time) {
	if (!canUseTimeline() || isTimeVisible(time)) {
		return;
	}

	centerTimelineOn(time);
}

function updateTimelineViewLabels() {
	const viewDuration = getTimelineViewDuration();
	const isFullTimeline = canUseTimeline() && timelineViewStart <= 0 && timelineViewEnd >= timelineDuration;

	timelineStartElement.textContent = formatClockTime(timelineViewStart);
	timelineEndElement.textContent = formatClockTime(timelineViewEnd);
	timelineWindowElement.textContent = isFullTimeline
		? "Full timeline"
		: `${formatClockTime(timelineViewStart)} to ${formatClockTime(timelineViewEnd)} (${formatClockTime(viewDuration)})`;
}

function updateTimelineZoomControls() {
	const canZoom = canUseTimeline();
	const viewDuration = getTimelineViewDuration();
	const minWindow = getMinimumTimelineWindow();

	[timelineZoomOutButton, timelineZoomInButton, timelineFitButton, timelineCenterPlayheadButton].forEach((button) => {
		button.disabled = !canZoom;
	});

	timelineZoomInButton.disabled = !canZoom || viewDuration <= minWindow + 0.001;
	timelineZoomOutButton.disabled = !canZoom || viewDuration >= timelineDuration - 0.001;
	timelineFitButton.disabled = !canZoom || viewDuration >= timelineDuration - 0.001;
}

function getTimelineAnchorTime() {
	if (selectedCutPoint) {
		return getSelectedCutPointTime();
	}

	if (Number.isFinite(videoElement.currentTime) && videoElement.currentTime > 0) {
		return videoElement.currentTime;
	}

	return timelineViewStart + getTimelineViewDuration() / 2;
}

function getTimelineViewDuration() {
	return Math.max(0, timelineViewEnd - timelineViewStart);
}

function getMinimumTimelineWindow() {
	return Math.min(timelineDuration || MIN_TIMELINE_WINDOW_SECONDS, MIN_TIMELINE_WINDOW_SECONDS);
}

function isTimeVisible(time) {
	return Number.isFinite(time) && time >= timelineViewStart && time <= timelineViewEnd;
}

function timeToTimelinePercent(time) {
	const viewDuration = getTimelineViewDuration();

	if (!viewDuration) {
		return 0;
	}

	return clamp(((time - timelineViewStart) / viewDuration) * 100, 0, 100);
}

function timelineProgressToTime(progress) {
	return timelineViewStart + clamp(progress, 0, 1) * getTimelineViewDuration();
}

async function renderTimelineThumbnails(src, duration) {
	const runId = ++timelineThumbnailRun;
	const thumbnailCount = getTimelineThumbnailCount();

	timelineThumbnailsElement.replaceChildren();
	for (let index = 0; index < thumbnailCount; index += 1) {
		timelineThumbnailsElement.appendChild(createTimelineThumb(index, thumbnailCount, duration));
	}

	timelineStatusElement.textContent = `Building thumbnails 0/${thumbnailCount}...`;

	let thumbnailVideo;
	try {
		thumbnailVideo = await createThumbnailVideo(src);
		const canvas = document.createElement("canvas");
		canvas.width = TIMELINE_THUMBNAIL_WIDTH;
		canvas.height = TIMELINE_THUMBNAIL_HEIGHT;

		for (let index = 0; index < thumbnailCount; index += 1) {
			if (runId !== timelineThumbnailRun) {
				return;
			}

			const time = getThumbnailTime(index, thumbnailCount, duration);
			await seekThumbnailVideo(thumbnailVideo, time);
			const imageUrl = drawThumbnailFrame(thumbnailVideo, canvas);
			const image = document.createElement("img");
			image.alt = "";
			image.src = imageUrl;
			timelineThumbnailsElement.children[index].prepend(image);
			timelineStatusElement.textContent = `Building thumbnails ${index + 1}/${thumbnailCount}...`;
		}

		timelineStatusElement.textContent = "Drag the filmstrip to scrub. Red spans are cuts.";
	} catch (error) {
		console.error("Error building timeline thumbnails:", error);
		timelineStatusElement.textContent = "Thumbnails unavailable. Drag the strip to scrub.";
	} finally {
		if (thumbnailVideo) {
			thumbnailVideo.remove();
		}

		if (runId === timelineThumbnailRun) {
			timelineElement.classList.remove("timeline--loading");
		}
	}
}

function createTimelineThumb(index, thumbnailCount, duration) {
	const thumbnail = document.createElement("div");
	const label = document.createElement("span");

	thumbnail.className = "timeline__thumb";
	label.textContent = formatClockTime(getThumbnailTime(index, thumbnailCount, duration));
	thumbnail.appendChild(label);
	return thumbnail;
}

function getTimelineThumbnailCount() {
	const width = timelineElement.clientWidth || 900;
	return clamp(Math.round(width / 64), MIN_TIMELINE_THUMBNAILS, MAX_TIMELINE_THUMBNAILS);
}

function getThumbnailTime(index, thumbnailCount, duration) {
	if (thumbnailCount <= 1 || !Number.isFinite(duration) || duration <= 0) {
		return 0;
	}

	const viewStart = timelineViewStart || 0;
	const viewEnd = timelineViewEnd || duration;
	const viewDuration = Math.max(0, viewEnd - viewStart);
	const lastDrawableTime = Math.max(viewStart, viewEnd - 0.05);

	if (index === 0) {
		return Math.min(viewStart + 0.05, lastDrawableTime);
	}

	return clamp(viewStart + (viewDuration * index) / (thumbnailCount - 1), viewStart, lastDrawableTime);
}

function createThumbnailVideo(src) {
	return new Promise((resolve, reject) => {
		const thumbnailVideo = document.createElement("video");
		const timeout = window.setTimeout(() => {
			cleanup();
			reject(new Error("Timed out loading thumbnail video."));
		}, 10000);
		const cleanup = () => {
			window.clearTimeout(timeout);
			thumbnailVideo.removeEventListener("loadedmetadata", handleLoaded);
			thumbnailVideo.removeEventListener("error", handleError);
		};
		const handleLoaded = () => {
			cleanup();
			resolve(thumbnailVideo);
		};
		const handleError = () => {
			cleanup();
			reject(new Error("Could not load video for thumbnails."));
		};

		thumbnailVideo.muted = true;
		thumbnailVideo.playsInline = true;
		thumbnailVideo.preload = "auto";
		thumbnailVideo.style.display = "none";
		thumbnailVideo.addEventListener("loadedmetadata", handleLoaded, { once: true });
		thumbnailVideo.addEventListener("error", handleError, { once: true });
		document.body.appendChild(thumbnailVideo);
		thumbnailVideo.src = src;
		thumbnailVideo.load();
	});
}

function seekThumbnailVideo(thumbnailVideo, time) {
	return new Promise((resolve, reject) => {
		const targetTime = clamp(time, 0, Math.max(0, thumbnailVideo.duration || time));

		if (Math.abs(thumbnailVideo.currentTime - targetTime) < 0.02 && thumbnailVideo.readyState >= 2) {
			window.requestAnimationFrame(resolve);
			return;
		}

		const timeout = window.setTimeout(() => {
			cleanup();
			reject(new Error("Timed out seeking thumbnail video."));
		}, 7000);
		const cleanup = () => {
			window.clearTimeout(timeout);
			thumbnailVideo.removeEventListener("seeked", handleSeeked);
			thumbnailVideo.removeEventListener("error", handleError);
		};
		const handleSeeked = () => {
			cleanup();
			resolve();
		};
		const handleError = () => {
			cleanup();
			reject(new Error("Could not seek thumbnail video."));
		};

		thumbnailVideo.addEventListener("seeked", handleSeeked, { once: true });
		thumbnailVideo.addEventListener("error", handleError, { once: true });
		thumbnailVideo.currentTime = targetTime;
	});
}

function drawThumbnailFrame(thumbnailVideo, canvas) {
	const context = canvas.getContext("2d");
	const sourceWidth = thumbnailVideo.videoWidth || TIMELINE_THUMBNAIL_WIDTH;
	const sourceHeight = thumbnailVideo.videoHeight || TIMELINE_THUMBNAIL_HEIGHT;
	const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
	const drawWidth = sourceWidth * scale;
	const drawHeight = sourceHeight * scale;
	const offsetX = (canvas.width - drawWidth) / 2;
	const offsetY = (canvas.height - drawHeight) / 2;

	context.drawImage(thumbnailVideo, offsetX, offsetY, drawWidth, drawHeight);
	return canvas.toDataURL("image/jpeg", 0.72);
}

function scrubTimelineToPointer(event) {
	event.preventDefault();
	const rect = timelineElement.getBoundingClientRect();
	const progress = clamp((event.clientX - rect.left) / rect.width, 0, 1);
	videoElement.currentTime = timelineProgressToTime(progress);
	updateTimelinePlayhead();
}

function updateTimelinePlayhead() {
	const currentTime = Number.isFinite(videoElement.currentTime) ? videoElement.currentTime : 0;
	const isVisible = isTimeVisible(currentTime);
	const progress = canUseTimeline() ? timeToTimelinePercent(currentTime) / 100 : 0;
	const currentValue = Math.round(currentTime);

	timelinePlayheadElement.style.left = `${progress * 100}%`;
	timelinePlayheadElement.hidden = canUseTimeline() && !isVisible;
	timelineElement.setAttribute("aria-valuenow", String(currentValue));
	timelineElement.setAttribute("aria-valuetext", formatTime(currentTime));
}

function renderCutOverlays(cuts = []) {
	timelineCutsElement.replaceChildren();

	if (!canUseTimeline()) {
		return;
	}

	normalizeCutRanges(cuts, timelineDuration).forEach((cut) => {
		if (cut.end < timelineViewStart || cut.start > timelineViewEnd) {
			return;
		}

		const marker = document.createElement("div");
		const visibleStart = clamp(cut.start, timelineViewStart, timelineViewEnd);
		const visibleEnd = clamp(cut.end, timelineViewStart, timelineViewEnd);
		const startPercent = timeToTimelinePercent(visibleStart);
		const endPercent = timeToTimelinePercent(visibleEnd);

		marker.className = "timeline__cut-marker";
		marker.style.left = `${startPercent}%`;
		marker.style.width = `${Math.max(0.4, endPercent - startPercent)}%`;
		marker.title = `Cut ${formatTime(cut.start)} to ${formatTime(cut.end)}`;
		timelineCutsElement.appendChild(marker);

		if (isTimeVisible(cut.start)) {
			timelineCutsElement.appendChild(createCutPointHandle(cut, "start", timeToTimelinePercent(cut.start)));
		}

		if (isTimeVisible(cut.end)) {
			timelineCutsElement.appendChild(createCutPointHandle(cut, "end", timeToTimelinePercent(cut.end)));
		}
	});
}

function normalizeCutRanges(cuts, duration) {
	if (!Array.isArray(cuts) || !Number.isFinite(duration) || duration <= 0) {
		return [];
	}

	return cuts
		.map((cut, index) => ({
			index,
			start: Number(cut.start),
			end: Number(cut.end),
		}))
		.filter((cut) => Number.isFinite(cut.start) && Number.isFinite(cut.end) && cut.end > cut.start)
		.map((cut) => ({
			index: cut.index,
			start: clamp(cut.start, 0, duration),
			end: clamp(cut.end, 0, duration),
		}))
		.filter((cut) => cut.end > cut.start);
}

function createCutPointHandle(cut, edge, percent) {
	const handle = document.createElement("button");
	const labelEdge = edge === "start" ? "start" : "end";
	const time = edge === "start" ? cut.start : cut.end;
	const isSelected =
		selectedCutPoint &&
		selectedCutPoint.cutIndex === cut.index &&
		selectedCutPoint.edge === edge;

	handle.type = "button";
	handle.className = `timeline__cut-handle timeline__cut-handle--${edge}`;
	handle.classList.toggle("is-selected", Boolean(isSelected));
	handle.dataset.cutIndex = String(cut.index);
	handle.dataset.edge = edge;
	handle.style.left = `${percent}%`;
	handle.title = `Cut ${cut.index + 1} ${labelEdge}: ${formatTime(time)}`;
	handle.setAttribute("aria-label", `Cut ${cut.index + 1} ${labelEdge} at ${formatTime(time)}`);
	handle.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		selectCutPoint(cut.index, edge, { seek: true });
		event.currentTarget.focus({ preventScroll: true });
	});
	handle.addEventListener("pointerdown", (event) => {
		event.preventDefault();
		event.stopPropagation();
		selectCutPoint(cut.index, edge, { seek: true });
		event.currentTarget.focus({ preventScroll: true });
		activeCutPointDrag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			hasMoved: false,
		};
	});
	handle.addEventListener("keydown", (event) => {
		handleCutPointKeydown(event, cut.index, edge);
	});

	return handle;
}

function handleCutPointKeydown(event, cutIndex, edge) {
	if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();
	selectCutPoint(cutIndex, edge, { seek: false });

	const currentTime = getSelectedCutPointTime();
	const nudgeSeconds = event.shiftKey ? 1 : 0.1;

	if (event.key === "ArrowLeft") {
		updateSelectedCutPoint(currentTime - nudgeSeconds, { seek: true, showMessage: false, restoreFocus: true });
	} else if (event.key === "ArrowRight") {
		updateSelectedCutPoint(currentTime + nudgeSeconds, { seek: true, showMessage: false, restoreFocus: true });
	} else if (event.key === "Home") {
		updateSelectedCutPoint(0, { seek: true, showMessage: false, restoreFocus: true });
	} else if (event.key === "End") {
		updateSelectedCutPoint(timelineDuration, { seek: true, showMessage: false, restoreFocus: true });
	}
}

function selectCutPoint(cutIndex, edge, options = {}) {
	const cut = cutList[cutIndex];

	if (!cut || !["start", "end"].includes(edge)) {
		clearSelectedCutPoint();
		return;
	}

	selectedCutPoint = { cutIndex, edge };

	if (options.seek !== false) {
		videoElement.currentTime = Number(cut[edge]) || 0;
	}

	updateSelectedCutHandleClasses();
	updateCutPointEditor();
}

function clearSelectedCutPoint() {
	selectedCutPoint = null;
	activeCutPointDrag = null;
	updateSelectedCutHandleClasses();
	hideCutPointEditor();
}

function updateSelectedCutHandleClasses() {
	timelineCutsElement.querySelectorAll(".timeline__cut-handle").forEach((handle) => {
		const isSelected =
			selectedCutPoint &&
			Number(handle.dataset.cutIndex) === selectedCutPoint.cutIndex &&
			handle.dataset.edge === selectedCutPoint.edge;

		handle.classList.toggle("is-selected", Boolean(isSelected));
	});
}

function updateCutPointEditor() {
	if (!selectedCutPoint) {
		hideCutPointEditor();
		return;
	}

	const cut = cutList[selectedCutPoint.cutIndex];

	if (!cut) {
		clearSelectedCutPoint();
		return;
	}

	const time = Number(cut[selectedCutPoint.edge]);
	const labelEdge = selectedCutPoint.edge === "start" ? "start" : "end";

	if (!Number.isFinite(time)) {
		hideCutPointEditor();
		return;
	}

	cutPointEditorElement.hidden = false;
	cutPointLabelElement.textContent = `Cut ${selectedCutPoint.cutIndex + 1} ${labelEdge}`;
	cutPointTimeElement.textContent = formatTime(time);
	cutPointInputElement.value = time.toFixed(3);
	cutPointInputElement.max = String(timelineDuration || "");
}

function hideCutPointEditor() {
	cutPointEditorElement.hidden = true;
}

function updateSelectedCutPointFromPointer(event, options = {}) {
	if (!selectedCutPoint || !canUseTimeline()) {
		return;
	}

	const rect = timelineElement.getBoundingClientRect();
	const progress = clamp((event.clientX - rect.left) / rect.width, 0, 1);
	updateSelectedCutPoint(timelineProgressToTime(progress), { seek: true, ...options });
}

function updateSelectedCutPoint(nextTime, options = {}) {
	if (!selectedCutPoint) {
		return;
	}

	try {
		cutList = readCutlistFromEditor();
	} catch (error) {
		timelineElement.classList.add("timeline--invalid");
		showToast("Check the cutlist JSON", error.message, "error");
		return;
	}

	const cut = cutList[selectedCutPoint.cutIndex];

	if (!cut) {
		clearSelectedCutPoint();
		return;
	}

	const clampedTime = constrainCutPointTime(cut, selectedCutPoint.edge, nextTime);
	cut[selectedCutPoint.edge] = clampedTime.toFixed(6);
	ensureTimeVisible(clampedTime);
	updateCutlistDisplay();

	if (options.seek !== false) {
		videoElement.currentTime = clampedTime;
	}

	if (options.showMessage) {
		showToast("Cut point updated", `${cutPointLabelElement.textContent} set to ${formatTime(clampedTime)}.`);
	}

	if (options.restoreFocus) {
		window.requestAnimationFrame(() => focusSelectedCutHandle());
	}
}

function constrainCutPointTime(cut, edge, value) {
	const start = Number(cut.start);
	const end = Number(cut.end);
	const safeValue = Number.isFinite(value) ? value : 0;

	if (edge === "start") {
		const maxStart = Number.isFinite(end) ? Math.max(0, end - CUT_POINT_MIN_GAP) : timelineDuration;
		return clamp(safeValue, 0, maxStart);
	}

	const minEnd = Number.isFinite(start) ? start + CUT_POINT_MIN_GAP : CUT_POINT_MIN_GAP;
	return clamp(safeValue, minEnd, timelineDuration);
}

function getSelectedCutPointTime() {
	if (!selectedCutPoint) {
		return 0;
	}

	const cut = cutList[selectedCutPoint.cutIndex];
	return cut ? Number(cut[selectedCutPoint.edge]) || 0 : 0;
}

function focusSelectedCutHandle() {
	if (!selectedCutPoint) {
		return;
	}

	const selector = `.timeline__cut-handle[data-cut-index="${selectedCutPoint.cutIndex}"][data-edge="${selectedCutPoint.edge}"]`;
	const handle = timelineCutsElement.querySelector(selector);

	if (handle) {
		handle.focus();
	}
}

function canUseTimeline() {
	return Number.isFinite(timelineDuration) && timelineDuration > 0;
}

function updatePreviewSkipState(cuts = cutList) {
	const cutCount = getPreviewCutRanges(cuts).length;

	document.body.classList.toggle("preview-skip-enabled", skipCutsPreviewInput.checked);
	skipCutsStatusElement.textContent = skipCutsPreviewInput.checked
		? `Skipping ${cutCount} ${cutCount === 1 ? "cut" : "cuts"}`
		: "Preview off";

	if (!skipCutsPreviewInput.checked || cutCount === 0) {
		stopPreviewSkipLoop();
	}

	if (skipCutsPreviewInput.checked && !videoElement.paused) {
		startPreviewSkipLoop();
	}
}

function startPreviewSkipLoop() {
	if (!skipCutsPreviewInput.checked || videoElement.paused || videoElement.ended) {
		return;
	}

	if (previewSkipFrame !== null) {
		return;
	}

	const tick = () => {
		previewSkipFrame = null;

		if (!skipCutsPreviewInput.checked || videoElement.paused || videoElement.ended) {
			return;
		}

		skipActivePreviewCut();
		previewSkipFrame = window.requestAnimationFrame(tick);
	};

	skipActivePreviewCut();
	previewSkipFrame = window.requestAnimationFrame(tick);
}

function stopPreviewSkipLoop() {
	if (previewSkipFrame !== null) {
		window.cancelAnimationFrame(previewSkipFrame);
		previewSkipFrame = null;
	}

	lastSkippedCutEnd = null;
}

function skipActivePreviewCut() {
	const activeCut = findActivePreviewCut(videoElement.currentTime);

	if (!activeCut) {
		lastSkippedCutEnd = null;
		return;
	}

	const skipTo = clamp(activeCut.end + PREVIEW_SKIP_EPSILON, 0, timelineDuration || videoElement.duration || activeCut.end);

	if (lastSkippedCutEnd !== null && Math.abs(lastSkippedCutEnd - activeCut.end) < PREVIEW_SKIP_EPSILON) {
		return;
	}

	lastSkippedCutEnd = activeCut.end;
	videoElement.currentTime = skipTo;
}

function findActivePreviewCut(time) {
	if (!skipCutsPreviewInput.checked || !Number.isFinite(time)) {
		return null;
	}

	return getPreviewCutRanges().find((cut) => time >= cut.start && time < cut.end - PREVIEW_SKIP_EPSILON);
}

function getPreviewCutRanges(cuts = cutList) {
	const ranges = normalizeCutRanges(cuts, timelineDuration || videoElement.duration || 0)
		.map((cut) => ({
			start: cut.start,
			end: cut.end,
		}))
		.sort((a, b) => a.start - b.start);

	return mergeCutRanges(ranges);
}

function mergeCutRanges(ranges) {
	return ranges.reduce((merged, range) => {
		const previous = merged[merged.length - 1];

		if (!previous || range.start > previous.end + PREVIEW_SKIP_EPSILON) {
			merged.push({ ...range });
			return merged;
		}

		previous.end = Math.max(previous.end, range.end);
		return merged;
	}, []);
}

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

function formatClockTime(time) {
	const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0;
	const hours = Math.floor(safeTime / 3600);
	const minutes = Math.floor((safeTime % 3600) / 60);
	const seconds = Math.floor(safeTime % 60);

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function showToast(title, message = "", type = "success") {
	const toast = document.createElement("div");
	const titleElement = document.createElement("strong");
	const messageElement = document.createElement("span");

	toast.className = `toast toast--${type}`;
	titleElement.textContent = title;
	messageElement.textContent = message;
	toast.append(titleElement, messageElement);
	toastRegionElement.appendChild(toast);

	window.setTimeout(() => {
		toast.remove();
	}, type === "error" ? 7000 : 4500);
}

saveCutlistButton.addEventListener("click", async () => {
	if (!videoSrc) {
		showToast("Choose a video first", "Pick a source video before saving a cutlist.", "warning");
		return;
	}

	try {
		const data = await saveCutlist();

		statusElement.textContent = `Cutlist saved to ${data.path}\n\nTerminal command:\n${data.editCommand}`;
		showToast("Cutlist saved", "You can edit the video now.");
	} catch (error) {
		console.error("Error saving cutlist: ", error);
		statusElement.textContent = error.message;
		showToast("Could not save cutlist", error.message, "error");
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
		showToast("Choose a video first", "Pick a source video before editing.", "warning");
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
		showToast("Edit complete", data.output);
	} catch (error) {
		console.error("Error editing video: ", error);
		statusElement.textContent = error.message;
		showToast("Could not edit video", error.message, "error");
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
	skipCutsPreviewInput.disabled = !enabled;
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
