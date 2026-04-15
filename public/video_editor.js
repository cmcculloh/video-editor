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
const cutOptionsEditorElement = document.getElementById("cut-options-editor");
const cutOptionsLabelElement = document.getElementById("cut-options-label");
const cutOptionsSummaryElement = document.getElementById("cut-options-summary");
const cutActionSelectElement = document.getElementById("cut-action-select");
const cutColorInputElement = document.getElementById("cut-color-input");
const cutColorPickVideoButton = document.getElementById("cut-color-pick-video");
const cutColorSwatchElement = document.getElementById("cut-color-swatch");
const mergePreviousCutButton = document.getElementById("merge-previous-cut");
const mergeNextCutButton = document.getElementById("merge-next-cut");
const deleteCutButton = document.getElementById("delete-cut");
const episodeSearchInput = document.getElementById("episode-search-input");
const episodeSearchButton = document.getElementById("episode-search-button");
const episodeClearButton = document.getElementById("episode-clear");
const episodeMatchStatusElement = document.getElementById("episode-match-status");
const episodePickerElement = document.getElementById("episode-picker");
const showMatchSelect = document.getElementById("show-match-select");
const episodeMatchSelect = document.getElementById("episode-match-select");
const episodeSelectedElement = document.getElementById("episode-selected");
const episodeSelectedTitle = document.getElementById("episode-selected-title");
const episodeSelectedDetails = document.getElementById("episode-selected-details");
const episodeSelectedLink = document.getElementById("episode-selected-link");
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
const TIMELINE_WHEEL_LINE_PIXELS = 18;
const TIMELINE_WHEEL_PAGE_PIXELS = 240;
const TIMELINE_THUMBNAIL_REFRESH_DELAY = 180;
const CUT_MODE_REMOVE = "remove";
const CUT_MODE_REPLACE = "replace";
const DEFAULT_REPLACEMENT_COLOR = "#000000";

let cutStart = null;
let cutList = [];
let timelineDuration = 0;
let timelineViewStart = 0;
let timelineViewEnd = 0;
let timelineThumbnailRun = 0;
let timelineThumbnailRefreshTimer = null;
let timelineScrubbing = false;
let selectedCutIndex = null;
let selectedCutPoint = null;
let activeCutPointDrag = null;
let previewSkipFrame = null;
let lastSkippedCutEnd = null;
let videoColorPickActive = false;
let episodeIdentity = null;
let showSearchResults = [];
let currentShowEpisodes = [];

document.body.classList.toggle("has-video", Boolean(videoSrc));
selectedVideoLabel.textContent = videoSrc ? getFileName(videoSrc) : "No video loaded";
episodeSearchInput.value = guessShowSearchQuery(videoSrc);
setActionControlsEnabled(Boolean(videoSrc));
setTransportControlsEnabled(false);
updatePlaybackRateDisplay();
updatePreviewSkipState();
updateEpisodeMatchDisplay();

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
		episodeIdentity = data.episodeIdentity || null;
		if (episodeIdentity && episodeIdentity.showName) {
			episodeSearchInput.value = episodeIdentity.showName;
		}
		introSelect.value = data.introSrc || "";
		outroSelect.value = data.outroSrc || "";
		updateCutlistDisplay();
		updateEpisodeMatchDisplay();
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
episodeSearchButton.addEventListener("click", searchShowsForEpisodeMatch);
episodeSearchInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		searchShowsForEpisodeMatch();
	}
});
showMatchSelect.addEventListener("change", () => {
	loadEpisodesForSelectedShow({ preserveExistingSelection: false });
});
episodeMatchSelect.addEventListener("change", () => {
	selectEpisodeIdentityById(episodeMatchSelect.value, { showMessage: true });
});
episodeClearButton.addEventListener("click", () => {
	episodeIdentity = null;
	episodeMatchSelect.value = "";
	updateEpisodeMatchDisplay();
	showToast("Episode match cleared", "This cutlist will only be tied to its local file until you choose another match.", "warning");
});

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

async function searchShowsForEpisodeMatch() {
	const query = episodeSearchInput.value.trim();

	if (query.length < 2) {
		showToast("Search needs a name", "Enter at least two characters from the show title.", "warning");
		return;
	}

	episodeSearchButton.disabled = true;
	episodeMatchStatusElement.textContent = "Searching TVmaze...";

	try {
		const data = await fetchJson(`/metadata/search-shows?q=${encodeURIComponent(query)}`, "Failed to search TVmaze.");

		showSearchResults = data.shows || [];
		currentShowEpisodes = [];
		populateShowMatchSelect();

		if (!showSearchResults.length) {
			episodePickerElement.hidden = true;
			episodeMatchStatusElement.textContent = "No matching shows found.";
			return;
		}

		episodePickerElement.hidden = false;
		const existingShow = episodeIdentity
			? showSearchResults.find((show) => String(show.showId) === String(episodeIdentity.showId))
			: null;

		showMatchSelect.value = String(existingShow ? existingShow.showId : showSearchResults[0].showId);
		await loadEpisodesForSelectedShow({ preserveExistingSelection: Boolean(existingShow) });
	} catch (error) {
		console.error("Error searching TVmaze:", error);
		episodeMatchStatusElement.textContent = error.message;
		showToast("Could not search TVmaze", error.message, "error");
	} finally {
		episodeSearchButton.disabled = false;
	}
}

async function fetchJson(url, fallbackMessage) {
	const response = await fetch(url);
	const contentType = response.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || fallbackMessage);
		}

		return data;
	}

	const text = await response.text();
	throw new Error(getNonJsonResponseMessage(response, text, fallbackMessage));
}

function getNonJsonResponseMessage(response, text, fallbackMessage) {
	const snippet = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

	if (response.status === 404 && response.url.includes("/metadata/")) {
		return "The TVmaze metadata API was not found. Restart the video editor server so the new episode-matching routes are loaded.";
	}

	if (snippet) {
		return `${fallbackMessage} Server returned ${response.status} ${response.statusText}: ${snippet}`;
	}

	return `${fallbackMessage} Server returned ${response.status} ${response.statusText}.`;
}

function populateShowMatchSelect() {
	showMatchSelect.replaceChildren();

	showSearchResults.forEach((show) => {
		const option = document.createElement("option");
		option.value = String(show.showId);
		option.textContent = formatShowOption(show);
		option.title = show.summary || option.textContent;
		showMatchSelect.appendChild(option);
	});
}

async function loadEpisodesForSelectedShow(options = {}) {
	const showId = showMatchSelect.value;

	if (!showId) {
		return;
	}

	episodeMatchSelect.disabled = true;
	episodeMatchSelect.replaceChildren(new Option("Loading episodes...", ""));
	episodeMatchStatusElement.textContent = "Loading episodes...";

	try {
		const data = await fetchJson(`/metadata/shows/${encodeURIComponent(showId)}/episodes`, "Failed to load episodes.");

		currentShowEpisodes = data.episodes || [];
		populateEpisodeMatchSelect(data.show, options);
		if (!episodeIdentity) {
			episodeMatchStatusElement.textContent = currentShowEpisodes.length
				? "Choose the episode this file belongs to."
				: "No episodes found for this show.";
		}
	} catch (error) {
		console.error("Error loading episodes:", error);
		currentShowEpisodes = [];
		episodeMatchStatusElement.textContent = error.message;
		showToast("Could not load episodes", error.message, "error");
	} finally {
		episodeMatchSelect.disabled = false;
	}
}

function populateEpisodeMatchSelect(show, options = {}) {
	const preserveExistingSelection = options.preserveExistingSelection !== false;
	const placeholder = new Option("Choose an episode...", "");
	let targetEpisodeId = "";

	episodeMatchSelect.replaceChildren(placeholder);

	currentShowEpisodes.forEach((episode) => {
		const option = document.createElement("option");
		option.value = String(episode.episodeId);
		option.textContent = formatEpisodeOption(episode);
		option.title = episode.summary || option.textContent;
		episodeMatchSelect.appendChild(option);
	});

	if (preserveExistingSelection && episodeIdentity && String(episodeIdentity.showId) === String(show.showId)) {
		targetEpisodeId = String(episodeIdentity.episodeId);
	} else {
		const guess = guessSeasonEpisode(videoSrc);
		const guessedEpisode = guess
			? currentShowEpisodes.find((episode) => episode.season === guess.season && episode.number === guess.number)
			: null;

		if (guessedEpisode) {
			targetEpisodeId = String(guessedEpisode.episodeId);
		}
	}

	if (targetEpisodeId && currentShowEpisodes.some((episode) => String(episode.episodeId) === targetEpisodeId)) {
		episodeMatchSelect.value = targetEpisodeId;
		selectEpisodeIdentityById(targetEpisodeId);
		return;
	}

	episodeMatchSelect.value = "";

	if (!preserveExistingSelection) {
		episodeIdentity = null;
		updateEpisodeMatchDisplay();
	}
}

function selectEpisodeIdentityById(episodeId, options = {}) {
	if (!episodeId) {
		return;
	}

	const episode = currentShowEpisodes.find((item) => String(item.episodeId) === String(episodeId));

	if (!episode) {
		return;
	}

	episodeIdentity = {
		provider: episode.provider,
		canonicalId: episode.canonicalId,
		showId: episode.showId,
		episodeId: episode.episodeId,
		showName: episode.showName,
		episodeTitle: episode.episodeTitle,
		season: episode.season,
		number: episode.number,
		airdate: episode.airdate,
		url: episode.url,
		showUrl: episode.showUrl,
		externals: episode.externals || {},
		selectedAt: new Date().toISOString(),
	};
	updateEpisodeMatchDisplay();

	if (options.showMessage) {
		showToast("Episode matched", `${formatEpisodeCode(episodeIdentity)} ${episodeIdentity.showName}: ${episodeIdentity.episodeTitle}`);
	}
}

function updateEpisodeMatchDisplay() {
	if (!episodeIdentity) {
		episodeSelectedElement.hidden = true;
		episodeClearButton.disabled = true;
		episodeSelectedTitle.textContent = "";
		episodeSelectedDetails.textContent = "";
		episodeSelectedLink.removeAttribute("href");
		episodeMatchStatusElement.textContent = episodePickerElement.hidden
			? "Choose a TVmaze episode before sharing this cutlist."
			: "Choose an episode from the list.";
		return;
	}

	const details = [
		formatEpisodeCode(episodeIdentity),
		episodeIdentity.airdate ? `Aired ${episodeIdentity.airdate}` : null,
		episodeIdentity.canonicalId,
		episodeIdentity.externals && episodeIdentity.externals.imdb ? `IMDb ${episodeIdentity.externals.imdb}` : null,
		episodeIdentity.externals && episodeIdentity.externals.thetvdb ? `TheTVDB ${episodeIdentity.externals.thetvdb}` : null,
	].filter(Boolean);

	episodeSelectedElement.hidden = false;
	episodeClearButton.disabled = false;
	episodeSelectedTitle.textContent = `${episodeIdentity.showName}: ${episodeIdentity.episodeTitle || "Untitled episode"}`;
	episodeSelectedDetails.textContent = details.join(" | ");
	episodeMatchStatusElement.textContent = "This cutlist has a canonical episode identity.";

	if (episodeIdentity.url) {
		episodeSelectedLink.href = episodeIdentity.url;
		episodeSelectedLink.hidden = false;
	} else {
		episodeSelectedLink.removeAttribute("href");
		episodeSelectedLink.hidden = true;
	}

	if (currentShowEpisodes.some((episode) => String(episode.episodeId) === String(episodeIdentity.episodeId))) {
		episodeMatchSelect.value = String(episodeIdentity.episodeId);
	}
}

function formatShowOption(show) {
	const years = [show.premiered && show.premiered.slice(0, 4), show.ended && show.ended.slice(0, 4)]
		.filter(Boolean)
		.join("-");
	const source = show.networkName || show.webChannelName || show.language;

	return [show.name, years || null, source].filter(Boolean).join(" | ");
}

function formatEpisodeOption(episode) {
	return [
		formatEpisodeCode(episode),
		episode.episodeTitle || "Untitled episode",
		episode.airdate,
	].filter(Boolean).join(" | ");
}

function formatEpisodeCode(episode) {
	if (Number.isInteger(episode.season) && Number.isInteger(episode.number)) {
		return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
	}

	if (Number.isInteger(episode.season)) {
		return `S${String(episode.season).padStart(2, "0")} special`;
	}

	return "Episode";
}

function guessSeasonEpisode(src) {
	if (!src) {
		return null;
	}

	const decoded = safeDecodeURIComponent(src);
	const seasonEpisodeMatch =
		decoded.match(/(?:^|[^0-9a-z])s(\d{1,3})\s*e(\d{1,3})(?:[^0-9a-z]|$)/i) ||
		decoded.match(/(?:^|[^0-9a-z])(\d{1,3})x(\d{1,3})(?:[^0-9a-z]|$)/i);

	if (!seasonEpisodeMatch) {
		return null;
	}

	return {
		season: Number(seasonEpisodeMatch[1]),
		number: Number(seasonEpisodeMatch[2]),
	};
}

function guessShowSearchQuery(src) {
	if (!src) {
		return "";
	}

	const decoded = safeDecodeURIComponent(src).replaceAll("\\", "/");
	const parts = decoded.split("/").filter(Boolean);
	const candidate = parts.length > 1 ? parts[parts.length - 2] : parts[parts.length - 1];

	return cleanSearchCandidate(candidate || "");
}

function cleanSearchCandidate(value) {
	return value
		.replace(/\.[^.]+$/, "")
		.replace(/\[[^\]]*]/g, " ")
		.replace(/\([^)]*\)/g, " ")
		.replace(/(?:^|[^0-9a-z])s\d{1,3}\s*e\d{1,3}(?:[^0-9a-z]|$)/gi, " ")
		.replace(/(?:^|[^0-9a-z])\d{1,3}x\d{1,3}(?:[^0-9a-z]|$)/gi, " ")
		.replace(/\b(480p|720p|1080p|2160p|x264|x265|h264|h265|hevc|aac|bluray|web-dl|webrip)\b/gi, " ")
		.replace(/[_\-.]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function safeDecodeURIComponent(value) {
	try {
		return decodeURIComponent(value);
	} catch (error) {
		return value;
	}
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
		let nextSelectedCutIndex = null;

		if (cutInProgress) {
			cutInProgress.end = getFrameTime(getFrameNumber(videoElement.currentTime, frameRate), frameRate).toFixed(6);
			cutInProgress.mode = CUT_MODE_REMOVE;
			nextSelectedCutIndex = cutList.push(cutInProgress) - 1;
			cutInProgress = null;
			toggleCutButton.textContent = "Cut Start";
		} else {
			cutInProgress = {
				start: getFrameTime(getFrameNumber(videoElement.currentTime, frameRate), frameRate).toFixed(6),
			};
			toggleCutButton.textContent = "Cut End";
		}
		updateCutlistDisplay();

		if (nextSelectedCutIndex !== null) {
			selectCut(nextSelectedCutIndex, { seek: false });
		}
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
	syncSelectionWithCutList();
	cutlistElement.value = JSON.stringify(cutList, null, "\t");
	updateCutCount(cutList.length);
	renderCutOverlays(cutList);
	updateCutPointEditor();
	updateCutOptionsEditor();
	updatePreviewSkipState(cutList);
}

function readCutlistFromEditor() {
	const text = cutlistElement.value.trim();

	if (!text) {
		updateCutCount(0);
		renderCutOverlays([]);
		updatePreviewSkipState([]);
		return [];
	}

	const parsed = JSON.parse(text);
	const editedCutList = Array.isArray(parsed) ? parsed : parsed.cutList;

	if (!Array.isArray(editedCutList)) {
		throw new Error("Cutlist must be a JSON array or an object with a cutList array.");
	}

	if (!Array.isArray(parsed) && Object.prototype.hasOwnProperty.call(parsed, "episodeIdentity")) {
		episodeIdentity = parsed.episodeIdentity || null;
		if (episodeIdentity && episodeIdentity.showName) {
			episodeSearchInput.value = episodeIdentity.showName;
		}
		updateEpisodeMatchDisplay();
	}

	updateCutCount(editedCutList.length);
	renderCutOverlays(editedCutList);
	timelineElement.classList.remove("timeline--invalid");
	updatePreviewSkipState(editedCutList);
	return editedCutList;
}

cutlistElement.addEventListener("input", () => {
	try {
		cutList = readCutlistFromEditor();
		syncSelectionWithCutList();
		updateCutPointEditor();
		updateCutOptionsEditor();
	} catch (error) {
		cutCountElement.textContent = "Check JSON";
		timelineElement.classList.add("timeline--invalid");
		clearSelectedCut();
	}
});

timelineElement.addEventListener("pointerdown", (event) => {
	if (!canUseTimeline()) {
		return;
	}

	if (event.target.closest(".timeline__cut-handle, .timeline__cut-marker")) {
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

timelineElement.addEventListener("wheel", handleTimelineWheel, { passive: false });

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
		showToast("Skip cuts enabled", "Playback will jump over ranges marked for removal.");
	} else {
		stopPreviewSkipLoop();
		showToast("Skip cuts disabled", "Playback will include the full source video.");
	}
});

cutActionSelectElement.addEventListener("change", () => {
	updateSelectedCutOptions({ mode: cutActionSelectElement.value }, { showMessage: true });
});

cutColorInputElement.addEventListener("input", () => {
	updateSelectedCutOptions({ mode: CUT_MODE_REPLACE, color: cutColorInputElement.value }, { showMessage: false });
});

cutColorPickVideoButton.addEventListener("click", () => {
	startVideoColorPick();
});

mergePreviousCutButton.addEventListener("click", () => {
	mergeSelectedCut("previous");
});

mergeNextCutButton.addEventListener("click", () => {
	mergeSelectedCut("next");
});

deleteCutButton.addEventListener("click", () => {
	deleteSelectedCut();
});

videoElement.addEventListener("pointerdown", handleVideoColorPickPointerDown, true);

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && videoColorPickActive) {
		stopVideoColorPick();
		showToast("Video color pick canceled", "No replacement color was changed.", "warning");
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
		updateTimelinePanState();
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
	updateTimelinePanState();
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

function handleTimelineWheel(event) {
	if (!canPanTimeline()) {
		return;
	}

	event.preventDefault();
	const wheelDelta = getTimelineWheelDelta(event);

	if (!wheelDelta) {
		return;
	}

	const secondsPerPixel = getTimelineViewDuration() / Math.max(1, timelineElement.clientWidth);
	const nextStart = timelineViewStart + wheelDelta * secondsPerPixel;
	const viewDuration = getTimelineViewDuration();

	setTimelineView(nextStart, nextStart + viewDuration, { renderThumbnails: false });
	scheduleTimelineThumbnailRefresh();
}

function getTimelineWheelDelta(event) {
	const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
	let delta = primaryDelta;

	if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
		delta *= TIMELINE_WHEEL_LINE_PIXELS;
	} else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
		delta *= TIMELINE_WHEEL_PAGE_PIXELS;
	}

	return delta;
}

function scheduleTimelineThumbnailRefresh() {
	timelineThumbnailRun += 1;
	window.clearTimeout(timelineThumbnailRefreshTimer);
	timelineThumbnailRefreshTimer = window.setTimeout(() => {
		timelineThumbnailRefreshTimer = null;
		renderTimelineThumbnails(videoElement.currentSrc || videoSrc, timelineDuration);
	}, TIMELINE_THUMBNAIL_REFRESH_DELAY);
}

function updateTimelinePanState() {
	timelineElement.classList.toggle("timeline--pannable", canPanTimeline());
}

function canPanTimeline() {
	return canUseTimeline() && getTimelineViewDuration() < timelineDuration - 0.001;
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

		timelineStatusElement.textContent = "Drag to scrub. Scroll while zoomed to pan. Red spans are cuts.";
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

		const marker = document.createElement("button");
		const visibleStart = clamp(cut.start, timelineViewStart, timelineViewEnd);
		const visibleEnd = clamp(cut.end, timelineViewStart, timelineViewEnd);
		const startPercent = timeToTimelinePercent(visibleStart);
		const endPercent = timeToTimelinePercent(visibleEnd);
		const mode = getCutMode(cut);
		const isSelected = selectedCutIndex === cut.index;

		marker.type = "button";
		marker.className = `timeline__cut-marker timeline__cut-marker--${mode}`;
		marker.classList.toggle("is-selected", isSelected);
		marker.style.left = `${startPercent}%`;
		marker.style.width = `${Math.max(0.4, endPercent - startPercent)}%`;
		marker.dataset.cutIndex = String(cut.index);

		if (mode === CUT_MODE_REPLACE) {
			marker.style.setProperty("--cut-color", getCutColor(cut));
		}

		marker.title = getCutMarkerTitle(cut);
		marker.setAttribute("aria-label", marker.title);
		marker.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			selectCut(cut.index, { seek: true, clearPoint: true });
			event.currentTarget.focus({ preventScroll: true });
		});
		marker.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			event.stopPropagation();
			selectCut(cut.index, { seek: true, clearPoint: true });
			event.currentTarget.focus({ preventScroll: true });
		});
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
			mode: getCutMode(cut),
			color: getCutColor(cut),
		}))
		.filter((cut) => Number.isFinite(cut.start) && Number.isFinite(cut.end) && cut.end > cut.start)
		.map((cut) => ({
			index: cut.index,
			start: clamp(cut.start, 0, duration),
			end: clamp(cut.end, 0, duration),
			mode: cut.mode,
			color: cut.color,
		}))
		.filter((cut) => cut.end > cut.start);
}

function getCutMarkerTitle(cut) {
	const timeRange = `${formatTime(cut.start)} to ${formatTime(cut.end)}`;

	if (getCutMode(cut) === CUT_MODE_REPLACE) {
		return `Cut ${cut.index + 1}: replace video with ${getCutColor(cut)} from ${timeRange}; audio preserved`;
	}

	return `Cut ${cut.index + 1}: remove ${timeRange}`;
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

function selectCut(cutIndex, options = {}) {
	const cut = cutList[cutIndex];

	if (!cut) {
		clearSelectedCut();
		return;
	}

	selectedCutIndex = cutIndex;

	if (options.seek !== false) {
		videoElement.currentTime = Number(cut.start) || 0;
	}

	if (options.clearPoint) {
		selectedCutPoint = null;
	}

	updateSelectedCutHandleClasses();
	updateCutOptionsEditor();
	updateCutPointEditor();
}

function selectCutPoint(cutIndex, edge, options = {}) {
	const cut = cutList[cutIndex];

	if (!cut || !["start", "end"].includes(edge)) {
		clearSelectedCut();
		return;
	}

	selectedCutIndex = cutIndex;
	selectedCutPoint = { cutIndex, edge };

	if (options.seek !== false) {
		videoElement.currentTime = Number(cut[edge]) || 0;
	}

	updateSelectedCutHandleClasses();
	updateCutOptionsEditor();
	updateCutPointEditor();
}

function clearSelectedCutPoint() {
	selectedCutPoint = null;
	activeCutPointDrag = null;
	updateSelectedCutHandleClasses();
	hideCutPointEditor();
}

function clearSelectedCut() {
	selectedCutIndex = null;
	selectedCutPoint = null;
	activeCutPointDrag = null;
	stopVideoColorPick();
	updateSelectedCutHandleClasses();
	hideCutPointEditor();
	hideCutOptionsEditor();
}

function syncSelectionWithCutList() {
	if (selectedCutIndex !== null && !cutList[selectedCutIndex]) {
		selectedCutIndex = null;
		selectedCutPoint = null;
		activeCutPointDrag = null;
		stopVideoColorPick();
		return;
	}

	if (selectedCutPoint && !cutList[selectedCutPoint.cutIndex]) {
		selectedCutPoint = null;
		activeCutPointDrag = null;
	}
}

function updateSelectedCutHandleClasses() {
	timelineCutsElement.querySelectorAll(".timeline__cut-handle").forEach((handle) => {
		const isSelected =
			selectedCutPoint &&
			Number(handle.dataset.cutIndex) === selectedCutPoint.cutIndex &&
			handle.dataset.edge === selectedCutPoint.edge;

		handle.classList.toggle("is-selected", Boolean(isSelected));
	});

	timelineCutsElement.querySelectorAll(".timeline__cut-marker").forEach((marker) => {
		marker.classList.toggle("is-selected", Number(marker.dataset.cutIndex) === selectedCutIndex);
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

function updateCutOptionsEditor() {
	if (selectedCutIndex === null) {
		hideCutOptionsEditor();
		return;
	}

	const cut = cutList[selectedCutIndex];

	if (!cut) {
		clearSelectedCut();
		return;
	}

	const mode = getCutMode(cut);
	const color = getCutColor(cut);
	const isReplaceMode = mode === CUT_MODE_REPLACE;

	cutOptionsEditorElement.hidden = false;
	cutOptionsEditorElement.classList.toggle("is-remove", !isReplaceMode);
	cutOptionsLabelElement.textContent = `Cut ${selectedCutIndex + 1} options`;
	cutOptionsSummaryElement.textContent = isReplaceMode
		? `Replace video with ${color}; keep audio`
		: "Remove from final edit";
	cutActionSelectElement.value = mode;
	cutColorInputElement.value = color;
	cutColorInputElement.disabled = !isReplaceMode;
	cutColorPickVideoButton.disabled = !videoSrc;
	cutColorSwatchElement.style.backgroundColor = color;
	mergePreviousCutButton.disabled = selectedCutIndex <= 0;
	mergeNextCutButton.disabled = selectedCutIndex >= cutList.length - 1;
	deleteCutButton.disabled = false;
}

function hideCutOptionsEditor() {
	cutOptionsEditorElement.hidden = true;
}

function updateSelectedCutOptions(changes, options = {}) {
	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const cut = cutList[selectedCutIndex];

	if (!cut) {
		clearSelectedCut();
		return;
	}

	const mode = changes.mode ? normalizeCutMode(changes.mode) : getCutMode(cut);

	cut.mode = mode;

	if (mode === CUT_MODE_REPLACE) {
		const color = normalizeHexColor(changes.color || cut.color || DEFAULT_REPLACEMENT_COLOR);

		if (!color) {
			showToast("Invalid color", "Use a hex color like #00aaff.", "error");
			updateCutOptionsEditor();
			return;
		}

		cut.color = color;
	} else {
		delete cut.color;
	}

	updateCutlistDisplay();

	if (options.showMessage) {
		if (mode === CUT_MODE_REPLACE) {
			showToast("Cut will keep audio", `Video will be replaced with ${cut.color}.`);
		} else {
			showToast("Cut will be removed", "This range will be left out of the final edit.");
		}
	}
}

function deleteSelectedCut() {
	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const deletedIndex = selectedCutIndex;
	const deletedCut = cutList[deletedIndex];

	cutList.splice(deletedIndex, 1);

	const nextSelectedIndex = cutList.length ? Math.min(deletedIndex, cutList.length - 1) : null;
	finishCutListMutation(nextSelectedIndex, {
		seek: nextSelectedIndex !== null,
	});
	showToast("Cut deleted", `Removed cut ${deletedIndex + 1}: ${formatTime(Number(deletedCut.start))} to ${formatTime(Number(deletedCut.end))}.`);
}

function mergeSelectedCut(direction) {
	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const currentIndex = selectedCutIndex;
	const currentCut = cutList[currentIndex];

	if (direction === "previous") {
		if (currentIndex <= 0) {
			showToast("No previous cut", "This is already the first cut.", "warning");
			return;
		}

		const previousCut = cutList[currentIndex - 1];
		currentCut.start = previousCut.start;
		cutList.splice(currentIndex - 1, 1);
		finishCutListMutation(currentIndex - 1);
		showToast("Cuts merged", `Selected cut now starts at ${formatTime(Number(previousCut.start))}.`);
		return;
	}

	if (currentIndex >= cutList.length - 1) {
		showToast("No next cut", "This is already the last cut.", "warning");
		return;
	}

	const nextCut = cutList[currentIndex + 1];
	currentCut.end = nextCut.end;
	cutList.splice(currentIndex + 1, 1);
	finishCutListMutation(currentIndex);
	showToast("Cuts merged", `Selected cut now ends at ${formatTime(Number(nextCut.end))}.`);
}

function readEditableCutListForSelectedCut() {
	if (selectedCutIndex === null) {
		showToast("Choose a cut first", "Click a cut range or one of its handles.", "warning");
		return false;
	}

	try {
		cutList = readCutlistFromEditor();
		syncSelectionWithCutList();
	} catch (error) {
		timelineElement.classList.add("timeline--invalid");
		showToast("Check the cutlist JSON", error.message, "error");
		return false;
	}

	if (selectedCutIndex === null || !cutList[selectedCutIndex]) {
		clearSelectedCut();
		return false;
	}

	return true;
}

function finishCutListMutation(nextSelectedIndex, options = {}) {
	selectedCutIndex = nextSelectedIndex;
	selectedCutPoint = null;
	activeCutPointDrag = null;
	stopVideoColorPick();

	if (nextSelectedIndex !== null) {
		const selectedCut = cutList[nextSelectedIndex];
		const nextTime = Number(selectedCut.start) || 0;

		ensureTimeVisible(nextTime);

		if (options.seek !== false) {
			videoElement.currentTime = nextTime;
		}
	}

	updateCutlistDisplay();
}

function startVideoColorPick() {
	if (selectedCutIndex === null) {
		showToast("Choose a cut first", "Click a cut range or one of its handles.", "warning");
		return;
	}

	if (!videoElement.videoWidth || !videoElement.videoHeight || videoElement.readyState < 2) {
		showToast("Video frame unavailable", "Wait for the video frame to load, then try again.", "warning");
		return;
	}

	videoColorPickActive = true;
	document.body.classList.add("video-color-picking");
	showToast("Pick from Video", "Click the current video frame to sample a replacement color.");
}

function stopVideoColorPick() {
	videoColorPickActive = false;
	document.body.classList.remove("video-color-picking");
}

function handleVideoColorPickPointerDown(event) {
	if (!videoColorPickActive) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	try {
		const color = sampleVideoColorAtPointer(event);

		if (!color) {
			showToast("Click inside the frame", "Choose a point inside the displayed video image.", "warning");
			return;
		}

		updateSelectedCutOptions({ mode: CUT_MODE_REPLACE, color }, { showMessage: true });
		stopVideoColorPick();
	} catch (error) {
		console.error("Error sampling video color:", error);
		stopVideoColorPick();
		showToast("Could not pick color", error.message, "error");
	}
}

function sampleVideoColorAtPointer(event) {
	const videoWidth = videoElement.videoWidth;
	const videoHeight = videoElement.videoHeight;
	const point = getVideoFramePoint(event, videoWidth, videoHeight);

	if (!point) {
		return null;
	}

	const canvas = document.createElement("canvas");
	canvas.width = videoWidth;
	canvas.height = videoHeight;

	const context = canvas.getContext("2d");
	context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

	const [red, green, blue] = context.getImageData(point.x, point.y, 1, 1).data;
	return rgbToHex(red, green, blue);
}

function getVideoFramePoint(event, videoWidth, videoHeight) {
	const rect = videoElement.getBoundingClientRect();

	if (!rect.width || !rect.height || !videoWidth || !videoHeight) {
		return null;
	}

	const elementRatio = rect.width / rect.height;
	const videoRatio = videoWidth / videoHeight;
	let renderedWidth = rect.width;
	let renderedHeight = rect.height;
	let offsetX = 0;
	let offsetY = 0;

	if (elementRatio > videoRatio) {
		renderedHeight = rect.height;
		renderedWidth = renderedHeight * videoRatio;
		offsetX = (rect.width - renderedWidth) / 2;
	} else {
		renderedWidth = rect.width;
		renderedHeight = renderedWidth / videoRatio;
		offsetY = (rect.height - renderedHeight) / 2;
	}

	const relativeX = event.clientX - rect.left - offsetX;
	const relativeY = event.clientY - rect.top - offsetY;

	if (relativeX < 0 || relativeY < 0 || relativeX > renderedWidth || relativeY > renderedHeight) {
		return null;
	}

	return {
		x: clamp(Math.floor((relativeX / renderedWidth) * videoWidth), 0, videoWidth - 1),
		y: clamp(Math.floor((relativeY / renderedHeight) * videoHeight), 0, videoHeight - 1),
	};
}

function rgbToHex(red, green, blue) {
	return `#${[red, green, blue]
		.map((value) => Number(value).toString(16).padStart(2, "0"))
		.join("")}`;
}

function getCutMode(cut) {
	return cut && cut.mode === CUT_MODE_REPLACE ? CUT_MODE_REPLACE : CUT_MODE_REMOVE;
}

function normalizeCutMode(mode) {
	return mode === CUT_MODE_REPLACE ? CUT_MODE_REPLACE : CUT_MODE_REMOVE;
}

function getCutColor(cut) {
	return normalizeHexColor(cut && cut.color) || DEFAULT_REPLACEMENT_COLOR;
}

function normalizeHexColor(color) {
	if (typeof color !== "string") {
		return null;
	}

	const trimmed = color.trim();
	const shortMatch = trimmed.match(/^#([0-9a-f]{3})$/i);

	if (shortMatch) {
		return `#${shortMatch[1].split("").map((character) => character + character).join("")}`.toLowerCase();
	}

	if (!/^#[0-9a-f]{6}$/i.test(trimmed)) {
		return null;
	}

	return trimmed.toLowerCase();
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
		? `Skipping ${cutCount} removed ${cutCount === 1 ? "cut" : "cuts"}`
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
		.filter((cut) => cut.mode === CUT_MODE_REMOVE)
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
			episodeIdentity,
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
		? "Creating debug edit with black screens where removed cuts occur. This may take a while..."
		: "Editing video. This may take a while...";

	try {
		const saved = await saveCutlist();
		statusElement.textContent = debugBlackCutsInput.checked
			? `Cutlist saved to ${saved.path}\n\nCreating debug edit with black screens where removed cuts occur. This may take a while...`
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
				episodeIdentity,
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
