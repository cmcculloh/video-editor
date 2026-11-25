const urlParams = new URLSearchParams(window.location.search);
let videoSrc = urlParams.get("src");
const videoElement = document.getElementById("video");
const videoStageElement = document.querySelector(".video-stage");
const blurMaskCanvas = document.getElementById("blur-mask-canvas");
const videoSelect = document.getElementById("video-select");
const localVideoInput = document.getElementById("local-video-input");
const loadLocalPreviewButton = document.getElementById("load-local-preview");
const loadLocalPreviewStageButton = document.getElementById("load-local-preview-stage");
const introSelect = document.getElementById("intro-select");
const outroSelect = document.getElementById("outro-select");
const introSelected = document.getElementById("intro-selected");
const outroSelected = document.getElementById("outro-selected");
const introPreview = document.getElementById("intro-preview");
const outroPreview = document.getElementById("outro-preview");
const video = document.getElementById("video");
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
const timelineRangeSlider = document.getElementById("timeline-range-slider");
const timelineRangeTrack = document.getElementById("timeline-range-track");
const timelineRangeWindow = document.getElementById("timeline-range-window");
const timelineRangeStartHandle = document.getElementById("timeline-range-start");
const timelineRangeEndHandle = document.getElementById("timeline-range-end");
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
const blurMaskEditorElement = document.getElementById("blur-mask-editor");
const blurToolSelectElement = document.getElementById("blur-tool-select");
const blurAmountInputElement = document.getElementById("blur-amount-input");
const blurBrushSizeInputElement = document.getElementById("blur-brush-size-input");
const blurMaskDrawButton = document.getElementById("blur-mask-draw");
const blurMaskClearLastButton = document.getElementById("blur-mask-clear-last");
const blurMaskClearButton = document.getElementById("blur-mask-clear");
const cutReasonCategorySelectElement = document.getElementById("cut-reason-category-select");
const cutReasonSubcategorySelectElement = document.getElementById("cut-reason-subcategory-select");
const cutReasonNoteInputElement = document.getElementById("cut-reason-note-input");
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
const playbackRateSlider = document.getElementById("playback-rate-slider");
const editProgressElement = document.getElementById("edit-progress");
const editProgressBar = document.getElementById("edit-progress-bar");
const editProgressLabel = document.getElementById("edit-progress-label");
const editProgressPercent = document.getElementById("edit-progress-percent");
const segmentProgressElement = document.getElementById("segment-progress");
const segmentProgressBar = document.getElementById("segment-progress-bar");
const segmentProgressLabel = document.getElementById("segment-progress-label");
const segmentProgressPercent = document.getElementById("segment-progress-percent");
const segmentProgressEta = document.getElementById("segment-progress-eta");
const currentTimeElement = document.getElementById("currentTime");
const currentSecondsElement = document.getElementById("currentSeconds");
const SEEK_SECONDS = 10;
const MAX_TIMELINE_THUMBNAILS = 36;
const MIN_TIMELINE_THUMBNAILS = 10;
const TIMELINE_THUMBNAIL_WIDTH = 160;
const TIMELINE_THUMBNAIL_HEIGHT = 90;
const CUT_POINT_MIN_GAP = 0.001;
const PREVIEW_SKIP_EPSILON = 0.03;
const MIN_TIMELINE_WINDOW_SECONDS = 2;
const TIMELINE_WHEEL_LINE_PIXELS = 18;
const TIMELINE_WHEEL_PAGE_PIXELS = 240;
const TIMELINE_WHEEL_ZOOM_INTENSITY = 0.0035;
const TIMELINE_THUMBNAIL_REFRESH_DELAY = 180;
const TIMELINE_SCRUB_SEEK_DELAY = 80;
const TIMELINE_SCRUB_MIN_SEEK_DELTA = 0.025;
const LOCAL_THUMBNAILS_ENABLED = false;
const CUT_MODE_REMOVE = "remove";
const CUT_MODE_REPLACE = "replace";
const CUT_MODE_BLUR = "blur";
const DEFAULT_REPLACEMENT_COLOR = "#000000";
const DEFAULT_BLUR_AMOUNT = 18;
const DEFAULT_BLUR_BRUSH_SIZE = 0.055;
const LOCAL_CUTLIST_STORAGE_PREFIX = "cutlist-studio:local:";
const DEFAULT_LOCAL_FRAME_RATE = 30;
const CLIENT_EXPORT_OUTPUT_EXTENSION = "mp4";
const FFMPEG_CORE_VERSION = "0.12.10";
const FFMPEG_MODULE_URL = "./vendor/ffmpeg/index.js";
const FFMPEG_CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
const CUT_REASON_CATEGORIES = [
	{
		id: "language",
		label: "Language",
		subcategories: [
			{ id: "profanity", label: "Profanity" },
			{ id: "blasphemy", label: "Blasphemy" },
			{ id: "childish-crude-language", label: "Childish / Crude Language" },
			{ id: "racial-slurs-bigoted-language", label: "Racial Slurs / Bigoted Language" },
			{ id: "sexual-reference-innuendo", label: "Sexual Reference / Innuendo" },
			{ id: "captions-with-profanity", label: "Captions with Profanity" },
		],
	},
	{
		id: "intimacy",
		label: "Intimacy",
		subcategories: [
			{ id: "sexually-suggestive", label: "Sexually Suggestive" },
			{ id: "implied-sex", label: "Implied Sex" },
			{ id: "shown-without-nudity", label: "Shown Without Nudity" },
			{ id: "shown-with-nudity", label: "Shown With Nudity" },
			{ id: "sexual-assault", label: "Sexual Assault" },
			{ id: "normal-kissing", label: "Normal Kissing" },
			{ id: "passionate-kissing", label: "Passionate Kissing" },
			{ id: "female-immodesty", label: "Female Immodesty" },
			{ id: "male-immodesty", label: "Male Immodesty" },
		],
	},
	{
		id: "nudity",
		label: "Nudity",
		subcategories: [
			{ id: "nudity-without-sex", label: "Nudity Without Sex" },
			{ id: "statues-and-paintings", label: "Statues and Paintings" },
			{ id: "implied-nudity", label: "Implied Nudity" },
			{ id: "female-nudity", label: "Female Nudity" },
			{ id: "male-nudity", label: "Male Nudity" },
		],
	},
	{
		id: "violence",
		label: "Violence",
		subcategories: [
			{ id: "implied-violence", label: "Implied Violence" },
			{ id: "non-graphic-violence", label: "Non-Graphic Violence" },
			{ id: "graphic-violence", label: "Graphic Violence" },
			{ id: "gore", label: "Gore" },
			{ id: "disturbing-images", label: "Disturbing Images" },
			{ id: "animal-violence", label: "Animal Violence" },
		],
	},
	{
		id: "substances",
		label: "Substances",
		subcategories: [
			{ id: "implied-use", label: "Implied Use" },
			{ id: "legal-use", label: "Legal Use" },
			{ id: "illegal-use", label: "Illegal Use" },
		],
	},
	{
		id: "more",
		label: "More",
		subcategories: [
			{ id: "credits", label: "Credits" },
			{ id: "vulgar-gestures", label: "Vulgar Gestures" },
			{ id: "objectionable-disturbing-scary", label: "Objectionable / Disturbing / Scary" },
			{ id: "human-functions-medical", label: "Human Functions / Medical" },
			{ id: "life-events", label: "Life Events" },
			{ id: "bodily-functions-jokes", label: "Bodily Functions / Jokes" },
			{ id: "medical-graphic", label: "Medical - Graphic" },
			{ id: "medical-procedures", label: "Medical - Procedures" },
		],
	},
];

let cutStart = null;
let cutList = [];
let timelineDuration = 0;
let timelineViewStart = 0;
let timelineViewEnd = 0;
let timelineThumbnailRun = 0;
let timelineThumbnailRefreshTimer = null;
let timelineScrubbing = false;
let timelineScrubSeekTimer = null;
let timelineScrubPendingTime = null;
let timelineScrubPendingExact = false;
let timelineRangeDrag = null;
let selectedCutIndex = null;
let selectedCutPoint = null;
let activeCutPointDrag = null;
let previewSkipFrame = null;
let lastSkippedCutEnd = null;
let videoColorPickActive = false;
let blurMaskDrawingActive = false;
let activeBlurMaskDraft = null;
let episodeIdentity = null;
let showSearchResults = [];
let currentShowEpisodes = [];
let currentVideoSource = videoSrc ? createServerVideoSource(videoSrc) : null;
let currentVideoObjectUrl = null;
let finalVideoObjectUrl = null;
let currentVideoLoadController = null;
let editorEventListenersInitialized = false;
let activeFrameRateFraction = DEFAULT_LOCAL_FRAME_RATE;
let activeFrameRate = DEFAULT_LOCAL_FRAME_RATE;
let cutInProgress = null;
let ffmpegToolsPromise = null;
let clientExportProgress = null;
let clientFfmpegLogs = [];

document.body.classList.toggle("has-video", hasCurrentVideo());
selectedVideoLabel.textContent = getCurrentVideoLabel();
episodeSearchInput.value = guessShowSearchQuery(videoSrc);
setActionControlsEnabled(hasLoadedCurrentVideoPreview());
setTransportControlsEnabled(false);
updatePlaybackRateDisplay();
updateCutToggleState(false);
updateLocalPreviewButton();
updatePreviewSkipState();
updateEpisodeMatchDisplay();
populateCutReasonCategorySelect();
populateCutReasonSubcategorySelect("");

const videoListReady = populateVideoSelect();
const introOutroAssetsReady = populateIntroOutroSelects();

videoListReady.then((videos) => {
	if (!currentVideoSource) {
		return;
	}

	if (currentVideoSource.type !== "server") {
		return;
	}

	if (!videos.includes(currentVideoSource.videoSrc)) {
		handleMissingSelectedVideo(currentVideoSource.videoSrc);
		return;
	}

	introOutroAssetsReady.then(() => loadCutlist(currentVideoSource.videoSrc));
	loadExistingFinalEdit(currentVideoSource.videoSrc);
	loadCurrentVideoSource();
});

function createServerVideoSource(src) {
	return {
		type: "server",
		videoSrc: src,
		playbackSrc: src,
		file: null,
		displayName: getFileName(src),
		fileName: getPathFileName(src),
		previewLoaded: false,
		previewLoading: false,
		identity: {
			type: "server",
			path: src,
		},
	};
}

function createLocalVideoSource(file, playbackSrc = "") {
	return {
		type: "local",
		videoSrc: file.name,
		playbackSrc,
		file,
		displayName: getFileName(file.name),
		fileName: file.name,
		previewLoaded: false,
		previewLoading: false,
		identity: createLocalVideoIdentity(file),
	};
}

function createLocalVideoIdentity(file) {
	return {
		type: "local-file",
		name: file.name,
		size: file.size,
		lastModified: file.lastModified,
		mediaType: file.type || "",
	};
}

function hasCurrentVideo() {
	return Boolean(currentVideoSource);
}

function hasLoadedCurrentVideoPreview() {
	return Boolean(currentVideoSource && currentVideoSource.previewLoaded);
}

function canLoadSelectedLocalPreview() {
	return Boolean(
		currentVideoSource
			&& currentVideoSource.type === "local"
			&& !currentVideoSource.previewLoading
			&& !currentVideoSource.previewLoaded
	);
}

function getCurrentVideoLabel() {
	if (!currentVideoSource) {
		return "No video loaded";
	}

	if (currentVideoSource.type !== "local") {
		return currentVideoSource.displayName;
	}

	return currentVideoSource.previewLoaded
		? `${currentVideoSource.displayName} - local preview`
		: `${currentVideoSource.displayName} - local file selected`;
}

function getCurrentPlaybackSrc() {
	if (videoElement.currentSrc) {
		return videoElement.currentSrc;
	}

	return currentVideoSource ? currentVideoSource.playbackSrc : "";
}

function loadCurrentVideoSource() {
	if (!currentVideoSource) {
		resetVideoElement();
		return;
	}

	const sourceElement = videoElement.getElementsByTagName("source")[0];

	if (currentVideoSource.type === "local" && !currentVideoSource.playbackSrc) {
		currentVideoObjectUrl = URL.createObjectURL(currentVideoSource.file);
		currentVideoSource.playbackSrc = currentVideoObjectUrl;
	}

	abortCurrentVideoLoad();
	currentVideoSource.previewLoading = true;
	currentVideoSource.previewLoaded = false;
	updateLocalPreviewButton();
	document.body.classList.add("has-video");
	selectedVideoLabel.textContent = getCurrentVideoLabel();
	setActionControlsEnabled(false);
	setTransportControlsEnabled(false);
	hideFinalVideo();
	timelineStatusElement.textContent = "Loading video metadata...";
	videoElement.preload = currentVideoSource.type === "local" ? "metadata" : "auto";
	sourceElement.src = currentVideoSource.playbackSrc;
	videoElement.removeAttribute("src");
	currentVideoLoadController = new AbortController();
	videoElement.addEventListener("loadedmetadata", setupCurrentVideo, {
		once: true,
		signal: currentVideoLoadController.signal,
	});
	videoElement.addEventListener("error", handleCurrentVideoLoadError, {
		once: true,
		signal: currentVideoLoadController.signal,
	});
	videoElement.load();
}

function loadSelectedLocalPreview() {
	if (!canLoadSelectedLocalPreview()) {
		return;
	}

	loadCurrentVideoSource();
}

async function setupCurrentVideo() {
	if (currentVideoSource) {
		currentVideoSource.previewLoading = false;
		currentVideoSource.previewLoaded = true;
	}

	selectedVideoLabel.textContent = getCurrentVideoLabel();
	setActionControlsEnabled(true);
	updateLocalPreviewButton();
	const frameRateFraction = await getCurrentFrameRate();
	console.log("frame rate:", frameRateFraction);
	setupEventListeners(videoElement, frameRateFraction);
}

function handleCurrentVideoLoadError() {
	if (currentVideoSource) {
		currentVideoSource.previewLoading = false;
		currentVideoSource.previewLoaded = false;
	}

	document.body.classList.remove("has-video");
	setActionControlsEnabled(false);
	setTransportControlsEnabled(false);
	updateLocalPreviewButton();
	timelineStatusElement.textContent = "Preview could not be loaded for this file.";
	statusElement.textContent = "The browser could not load a preview for this local video. The file was not uploaded.";
	showToast("Preview unavailable", "The browser could not decode this file for preview.", "error");
}

function abortCurrentVideoLoad() {
	if (currentVideoLoadController) {
		currentVideoLoadController.abort();
		currentVideoLoadController = null;
	}
}

async function getCurrentFrameRate() {
	if (!currentVideoSource) {
		return DEFAULT_LOCAL_FRAME_RATE;
	}

	if (currentVideoSource.type === "server") {
		return getFrameRate(currentVideoSource.videoSrc);
	}

	return DEFAULT_LOCAL_FRAME_RATE;
}

function resetVideoElement() {
	const sourceElement = videoElement.getElementsByTagName("source")[0];

	abortCurrentVideoLoad();
	document.body.classList.remove("has-video");
	selectedVideoLabel.textContent = "No video loaded";
	setActionControlsEnabled(false);
	setTransportControlsEnabled(false);
	sourceElement.removeAttribute("src");
	videoElement.removeAttribute("src");
	videoElement.load();
	updateLocalPreviewButton();
}

function selectLocalVideoFile(file) {
	releaseCurrentLocalObjectUrl();
	currentVideoSource = createLocalVideoSource(file);
	videoSrc = file.name;
	videoSelect.value = "";

	const nextUrl = new URL(window.location.href);
	nextUrl.searchParams.delete("src");
	window.history.replaceState({}, "", nextUrl.toString());

	resetVideoElement();
	resetEditorForNewVideo();
	loadLocalCutlistForCurrentVideo();
	selectedVideoLabel.textContent = getCurrentVideoLabel();
	timelineStatusElement.textContent = "Preview is not loaded yet.";
	setActionControlsEnabled(false);
	setTransportControlsEnabled(false);
	updateLocalPreviewButton();
	statusElement.textContent = [
		`Selected local file: ${file.name}`,
		"The source video has not been attached to the browser preview yet.",
		"Episode Match is seeded from the filename; search and choose the canonical episode before saving.",
		"Click Load Preview when you are ready to decode it for playback and cutting.",
	].join("\n");
	showToast("Local file selected", "Preview loading is paused.");
}

function releaseCurrentLocalObjectUrl() {
	if (currentVideoObjectUrl) {
		const objectUrl = currentVideoObjectUrl;
		URL.revokeObjectURL(currentVideoObjectUrl);
		currentVideoObjectUrl = null;

		if (currentVideoSource && currentVideoSource.playbackSrc === objectUrl) {
			currentVideoSource.playbackSrc = "";
		}
	}
}

function resetEditorForNewVideo() {
	cutStart = null;
	cutInProgress = null;
	cutList = [];
	selectedCutIndex = null;
	selectedCutPoint = null;
	activeCutPointDrag = null;
	lastSkippedCutEnd = null;
	episodeIdentity = null;
	showSearchResults = [];
	currentShowEpisodes = [];
	timelineDuration = 0;
	timelineViewStart = 0;
	timelineViewEnd = 0;
	timelineThumbnailRun += 1;
	window.clearTimeout(timelineThumbnailRefreshTimer);
	timelineThumbnailRefreshTimer = null;
	cancelPendingTimelineScrubSeek();
	timelineThumbnailsElement.replaceChildren();
	timelineStatusElement.textContent = "Loading video metadata...";
	timelineDurationElement.textContent = "00:00:00";
	timelineStartElement.textContent = "00:00:00";
	timelineEndElement.textContent = "00:00:00";
	updateCutToggleState(false);
	episodeSearchInput.value = guessShowSearchQuery(videoSrc);
	stopVideoColorPick();
	stopPreviewSkipLoop();
	hideEditProgress();
	hideFinalVideo();
	updateCutlistDisplay();
	updateEpisodeMatchDisplay();
	updatePreviewSkipState();
}


async function populateVideoSelect() {
	try {
		const response = await fetch("/videos");
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to load video list.");
		}

		data.videos.forEach((video) => {
			const option = document.createElement("option");
			option.value = video;
			option.textContent = video;
			option.selected = video === videoSrc;
			videoSelect.appendChild(option);
		});

		return data.videos;
	} catch (error) {
		console.error("Error loading video list:", error);
		return [];
	}
}

function handleMissingSelectedVideo(missingVideoSrc) {
	const sourceElement = videoElement.getElementsByTagName("source")[0];

	currentVideoSource = null;
	videoSrc = null;
	document.body.classList.remove("has-video");
	selectedVideoLabel.textContent = "Missing video";
	statusElement.textContent = `${missingVideoSrc} is not in public/. Add the source video back or choose another video.`;
	timelineStatusElement.textContent = "Choose an available video to build the thumbnail strip.";
	setActionControlsEnabled(false);
	setTransportControlsEnabled(false);
	sourceElement.removeAttribute("src");
	videoElement.removeAttribute("src");
	videoElement.load();
	updateLocalPreviewButton();
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

function populateCutReasonCategorySelect() {
	cutReasonCategorySelectElement.replaceChildren(new Option("Uncategorized", ""));

	CUT_REASON_CATEGORIES.forEach((category) => {
		cutReasonCategorySelectElement.appendChild(new Option(category.label, category.id));
	});
}

function populateCutReasonSubcategorySelect(categoryId, selectedSubcategory = "") {
	const category = getCutReasonCategory(categoryId);

	cutReasonSubcategorySelectElement.replaceChildren();

	if (!category) {
		cutReasonSubcategorySelectElement.appendChild(new Option("Choose a reason first", ""));
		cutReasonSubcategorySelectElement.disabled = true;
		return;
	}

	cutReasonSubcategorySelectElement.appendChild(new Option("Choose a filter...", ""));
	category.subcategories.forEach((subcategory) => {
		cutReasonSubcategorySelectElement.appendChild(new Option(subcategory.label, subcategory.id));
	});
	cutReasonSubcategorySelectElement.disabled = false;
	cutReasonSubcategorySelectElement.value = getCutReasonSubcategory(category.id, selectedSubcategory)
		? selectedSubcategory
		: "";
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
			statusElement.textContent = [
				`No saved cutlist yet for ${selectedVideoSrc}`,
				"Episode Match is seeded from the filename; search and choose the canonical episode before saving.",
			].join("\n");
		}
	} catch (error) {
		console.error("Error loading cutlist:", error);
		statusElement.textContent = error.message;
	}
}

function loadLocalCutlistForCurrentVideo() {
	if (!currentVideoSource || currentVideoSource.type !== "local") {
		return;
	}

	const storageKey = getLocalCutlistStorageKey();
	const savedCutlist = storageKey ? window.localStorage.getItem(storageKey) : null;

	if (!savedCutlist) {
		cutList = [];
		episodeIdentity = null;
		updateCutlistDisplay();
		updateEpisodeMatchDisplay();
		return;
	}

	try {
		const data = JSON.parse(savedCutlist);

		cutList = Array.isArray(data.cutList) ? data.cutList : [];
		episodeIdentity = data.episodeIdentity || null;
		if (episodeIdentity && episodeIdentity.showName) {
			episodeSearchInput.value = episodeIdentity.showName;
		}
		introSelect.value = data.introSrc || "";
		outroSelect.value = data.outroSrc || "";
		updateCutlistDisplay();
		updateEpisodeMatchDisplay();
		updateIntroOutroPreviews();
		statusElement.textContent = `Loaded browser-saved cutlist for ${currentVideoSource.fileName}.`;
	} catch (error) {
		console.error("Error loading local cutlist:", error);
		statusElement.textContent = "The browser-saved cutlist for this file could not be read.";
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

	releaseCurrentLocalObjectUrl();
	const nextUrl = new URL(window.location.href);
	nextUrl.searchParams.set("src", videoSelect.value);
	window.location.href = nextUrl.toString();
});

localVideoInput.addEventListener("change", () => {
	const file = localVideoInput.files && localVideoInput.files[0];

	if (!file) {
		return;
	}

	selectLocalVideoFile(file);
});

loadLocalPreviewButton.addEventListener("click", () => {
	loadSelectedLocalPreview();
});

loadLocalPreviewStageButton.addEventListener("click", loadSelectedLocalPreview);

window.addEventListener("beforeunload", () => {
	releaseCurrentLocalObjectUrl();
	if (finalVideoObjectUrl) {
		URL.revokeObjectURL(finalVideoObjectUrl);
	}
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
	activeFrameRateFraction = frameRateFraction || DEFAULT_LOCAL_FRAME_RATE;
	activeFrameRate = parseFrameRate(activeFrameRateFraction);

	if (!editorEventListenersInitialized) {
		document.addEventListener("keydown", handleEditorKeydown);
		seekBackwardButton.addEventListener("click", () => {
			console.log("back");
			seekVideo(videoElement, activeFrameRateFraction, false);
		});
		seekForwardButton.addEventListener("click", () => {
			console.log("forward");
			seekVideo(videoElement, activeFrameRateFraction, true);
		});
		toggleCutButton.addEventListener("click", handleToggleCut);
		videoElement.addEventListener("loadedmetadata", updateViewerReadout);
		videoElement.addEventListener("seeking", handlePrimaryVideoSeeking);
		videoElement.addEventListener("seeked", updateViewerReadout);
		videoElement.addEventListener("seeked", handlePrimaryVideoSeeked);
		videoElement.addEventListener("timeupdate", updateViewerReadout);
		videoElement.addEventListener("play", startPreviewSkipLoop);
		videoElement.addEventListener("playing", startPreviewSkipLoop);
		videoElement.addEventListener("pause", stopPreviewSkipLoop);
		videoElement.addEventListener("ended", stopPreviewSkipLoop);
		editorEventListenersInitialized = true;
	}

	setTransportControlsEnabled(true);
	setupTimeline(videoElement).catch((error) => {
		console.error("Error setting up timeline:", error);
		timelineStatusElement.textContent = "Timeline is unavailable for this video.";
		timelineElement.classList.remove("timeline--loading");
	});
	updateViewerReadout();
}

function handleEditorKeydown(event) {
	if (event.target.closest("input, textarea, select, .timeline__cut-handle")) {
		return;
	}

	const key = event.key;

	if (key === "ArrowRight") {
		console.log("advance", activeFrameRateFraction);
		event.preventDefault();
		event.stopPropagation();
		advanceFrame(videoElement, activeFrameRateFraction, true);
	} else if (key === "ArrowLeft") {
		event.preventDefault();
		event.stopPropagation();
		advanceFrame(videoElement, activeFrameRateFraction, false);
	}
}

function handleToggleCut() {
	let nextSelectedCutIndex = null;

	if (cutInProgress) {
		cutInProgress.end = getFrameTime(getFrameNumber(videoElement.currentTime, activeFrameRate), activeFrameRate).toFixed(6);
		cutInProgress.mode = CUT_MODE_REMOVE;
		nextSelectedCutIndex = cutList.push(cutInProgress) - 1;
		cutInProgress = null;
		updateCutToggleState(false);
	} else {
		cutInProgress = {
			start: getFrameTime(getFrameNumber(videoElement.currentTime, activeFrameRate), activeFrameRate).toFixed(6),
		};
		updateCutToggleState(true);
	}
	updateCutlistDisplay();

	if (nextSelectedCutIndex !== null) {
		selectCut(nextSelectedCutIndex, { seek: false });
	}
}

function updateCutToggleState(isCutting) {
	const label = isCutting ? "Cut end" : "Cut start";

	toggleCutButton.dataset.cutState = isCutting ? "end" : "start";
	toggleCutButton.title = label;
	toggleCutButton.setAttribute("aria-label", label);
}

function updateViewerReadout() {
	currentTimeElement.textContent = formatTime(videoElement.currentTime);
	currentSecondsElement.textContent = videoElement.currentTime.toFixed(6);
	updateTimelinePlayhead();
}

function handlePrimaryVideoSeeking() {
	cancelTimelineThumbnailWork();
}

function handlePrimaryVideoSeeked() {
	if (!timelineScrubbing && shouldRefreshTimelineThumbnails()) {
		scheduleTimelineThumbnailRefresh();
	}
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
	cancelTimelineThumbnailWork();
	scrubTimelineToPointer(event);
});

timelineElement.addEventListener("pointermove", (event) => {
	if (!timelineScrubbing) {
		return;
	}

	scrubTimelineToPointer(event);
});

timelineElement.addEventListener("pointerup", finishTimelineScrub);
timelineElement.addEventListener("pointercancel", finishTimelineScrub);

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

blurMaskDrawButton.addEventListener("click", () => {
	startBlurMaskDrawing();
});

blurMaskClearLastButton.addEventListener("click", () => {
	removeLastBlurShape();
});

blurMaskClearButton.addEventListener("click", () => {
	clearBlurMask();
});

blurAmountInputElement.addEventListener("input", () => {
	updateSelectedBlurMask({ amount: Number(blurAmountInputElement.value) }, { showMessage: false });
});

blurBrushSizeInputElement.addEventListener("input", () => {
	renderBlurMaskCanvas();
});

blurToolSelectElement.addEventListener("change", () => {
	renderBlurMaskCanvas();
});

cutReasonCategorySelectElement.addEventListener("change", () => {
	populateCutReasonSubcategorySelect(cutReasonCategorySelectElement.value);
	updateSelectedCutReason({
		category: cutReasonCategorySelectElement.value,
		subcategory: "",
	}, { showMessage: true });
});

cutReasonSubcategorySelectElement.addEventListener("change", () => {
	updateSelectedCutReason({
		category: cutReasonCategorySelectElement.value,
		subcategory: cutReasonSubcategorySelectElement.value,
	}, { showMessage: true });
});

cutReasonNoteInputElement.addEventListener("input", () => {
	updateSelectedCutReason({ note: cutReasonNoteInputElement.value }, { showMessage: false });
});

cutReasonNoteInputElement.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		cutReasonNoteInputElement.blur();
	}
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
blurMaskCanvas.addEventListener("pointerdown", handleBlurMaskPointerDown);
blurMaskCanvas.addEventListener("pointermove", handleBlurMaskPointerMove);
blurMaskCanvas.addEventListener("pointerup", finishBlurMaskDrawing);
blurMaskCanvas.addEventListener("pointercancel", cancelBlurMaskDraft);

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && videoColorPickActive) {
		stopVideoColorPick();
		showToast("Video color pick canceled", "No replacement color was changed.", "warning");
	}

	if (event.key === "Escape" && blurMaskDrawingActive) {
		stopBlurMaskDrawing();
		cancelBlurMaskDraft();
		showToast("Blur drawing canceled", "No blur area was changed.", "warning");
	}
});

timelineRangeSlider.addEventListener("pointerdown", handleTimelineRangePointerDown);
timelineRangeSlider.addEventListener("pointermove", handleTimelineRangePointerMove);
timelineRangeSlider.addEventListener("pointerup", handleTimelineRangePointerUp);
timelineRangeSlider.addEventListener("pointercancel", handleTimelineRangePointerUp);

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

	if (!shouldRenderTimelineThumbnails()) {
		renderTimelineThumbnailPlaceholders(timelineDuration);
		timelineStatusElement.textContent = "Local thumbnails are paused. Drag the strip to scrub; use the range bar to change the visible span.";
		timelineElement.classList.remove("timeline--loading");
		return;
	}

	await renderTimelineThumbnails(getCurrentPlaybackSrc(), timelineDuration);
}

function setTimelineView(start, end, options = {}) {
	if (!canUseTimeline()) {
		timelineViewStart = 0;
		timelineViewEnd = 0;
		updateTimelineViewLabels();
		updateTimelineRangeControls();
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
	updateTimelineRangeControls();
	updateTimelinePanState();
	renderCutOverlays(cutList);
	updateTimelinePlayhead();

	if (options.renderThumbnails !== false) {
		if (shouldRenderTimelineThumbnails()) {
			renderTimelineThumbnails(getCurrentPlaybackSrc(), timelineDuration);
		} else {
			renderTimelineThumbnailPlaceholders(timelineDuration);
		}
	} else if (!shouldRenderTimelineThumbnails() && timelineThumbnailsElement.children.length === 0) {
		renderTimelineThumbnailPlaceholders(timelineDuration);
	}
}

function handleTimelineRangePointerDown(event) {
	if (!canUseTimeline()) {
		return;
	}

	const mode = getTimelineRangeDragMode(event);
	const pointerTime = getTimelineRangePointerTime(event);

	timelineRangeDrag = {
		mode,
		pointerTime,
		start: timelineViewStart,
		end: timelineViewEnd,
		duration: getTimelineViewDuration(),
	};
	timelineRangeSlider.setPointerCapture(event.pointerId);
	event.preventDefault();
}

function handleTimelineRangePointerMove(event) {
	if (!timelineRangeDrag) {
		return;
	}

	updateTimelineRangeDrag(event, { renderThumbnails: false });
	scheduleTimelineThumbnailRefresh();
}

function handleTimelineRangePointerUp(event) {
	if (!timelineRangeDrag) {
		return;
	}

	updateTimelineRangeDrag(event);
	timelineRangeDrag = null;

	if (timelineRangeSlider.hasPointerCapture(event.pointerId)) {
		timelineRangeSlider.releasePointerCapture(event.pointerId);
	}
}

function updateTimelineRangeDrag(event, options = {}) {
	if (!canUseTimeline()) {
		return;
	}

	const pointerTime = getTimelineRangePointerTime(event);
	const minWindow = getMinimumTimelineWindow();

	if (timelineRangeDrag.mode === "start") {
		const nextStart = clamp(pointerTime, 0, timelineViewEnd - minWindow);
		setTimelineView(nextStart, timelineViewEnd, options);
		return;
	}

	if (timelineRangeDrag.mode === "end") {
		const nextEnd = clamp(pointerTime, timelineViewStart + minWindow, timelineDuration);
		setTimelineView(timelineViewStart, nextEnd, options);
		return;
	}

	const delta = pointerTime - timelineRangeDrag.pointerTime;
	let nextStart = timelineRangeDrag.start + delta;
	nextStart = clamp(nextStart, 0, Math.max(0, timelineDuration - timelineRangeDrag.duration));
	setTimelineView(nextStart, nextStart + timelineRangeDrag.duration, options);
}

function getTimelineRangeDragMode(event) {
	if (event.target === timelineRangeStartHandle) {
		return "start";
	}

	if (event.target === timelineRangeEndHandle) {
		return "end";
	}

	if (event.target === timelineRangeWindow) {
		return "window";
	}

	const pointerTime = getTimelineRangePointerTime(event);
	const distanceToStart = Math.abs(pointerTime - timelineViewStart);
	const distanceToEnd = Math.abs(pointerTime - timelineViewEnd);

	if (pointerTime > timelineViewStart && pointerTime < timelineViewEnd) {
		return "window";
	}

	return distanceToStart <= distanceToEnd ? "start" : "end";
}

function getTimelineRangePointerTime(event) {
	const rect = timelineRangeTrack.getBoundingClientRect();
	const progress = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
	return clamp(progress, 0, 1) * timelineDuration;
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
	if (event.altKey) {
		if (!canUseTimeline()) {
			return;
		}

		event.preventDefault();
		const wheelDelta = getTimelineWheelDelta(event);

		if (!wheelDelta) {
			return;
		}

		zoomTimelineAt(getTimelinePointerTime(event), wheelDelta, { renderThumbnails: false });
		scheduleTimelineThumbnailRefresh();
		return;
	}

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

function zoomTimelineAt(anchorTime, wheelDelta, options = {}) {
	const currentWindow = getTimelineViewDuration() || timelineDuration;
	const minWindow = getMinimumTimelineWindow();
	const zoomScale = Math.exp(Math.min(Math.abs(wheelDelta), 800) * TIMELINE_WHEEL_ZOOM_INTENSITY);
	const nextWindow = clamp(
		currentWindow * (wheelDelta > 0 ? 1 / zoomScale : zoomScale),
		minWindow,
		timelineDuration,
	);
	const anchor = Number.isFinite(anchorTime) ? anchorTime : getTimelineAnchorTime();
	const anchorRatio = currentWindow > 0 ? clamp((anchor - timelineViewStart) / currentWindow, 0, 1) : 0.5;
	const nextStart = anchor - nextWindow * anchorRatio;

	setTimelineView(nextStart, nextStart + nextWindow, options);
}

function getTimelinePointerTime(event) {
	const rect = timelineElement.getBoundingClientRect();
	const progress = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
	return timelineProgressToTime(clamp(progress, 0, 1));
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
	if (!shouldRenderTimelineThumbnails()) {
		window.clearTimeout(timelineThumbnailRefreshTimer);
		timelineThumbnailRefreshTimer = window.setTimeout(() => {
			timelineThumbnailRefreshTimer = null;
			renderTimelineThumbnailPlaceholders(timelineDuration);
		}, TIMELINE_THUMBNAIL_REFRESH_DELAY);
		return;
	}

	timelineThumbnailRun += 1;
	window.clearTimeout(timelineThumbnailRefreshTimer);
	timelineThumbnailRefreshTimer = window.setTimeout(() => {
		timelineThumbnailRefreshTimer = null;
		renderTimelineThumbnails(getCurrentPlaybackSrc(), timelineDuration);
	}, TIMELINE_THUMBNAIL_REFRESH_DELAY);
}

function cancelTimelineThumbnailWork() {
	timelineThumbnailRun += 1;
	window.clearTimeout(timelineThumbnailRefreshTimer);
	timelineThumbnailRefreshTimer = null;
}

function shouldRefreshTimelineThumbnails() {
	return shouldRenderTimelineThumbnails()
		&& (
			timelineThumbnailsElement.children.length === 0
			|| Array.from(timelineThumbnailsElement.children).some((thumbnail) => !thumbnail.querySelector("img"))
		);
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
	timelineStartElement.textContent = formatClockTime(timelineViewStart);
	timelineEndElement.textContent = formatClockTime(timelineViewEnd);
}

function updateTimelineRangeControls() {
	const canAdjust = canUseTimeline();
	const rangeDisabled = !canAdjust || timelineDuration <= getMinimumTimelineWindow() + 0.001;

	[timelineRangeWindow, timelineRangeStartHandle, timelineRangeEndHandle].forEach((control) => {
		control.disabled = rangeDisabled;
	});

	timelineRangeSlider.classList.toggle("timeline-range-slider--disabled", rangeDisabled);
	updateTimelineRangeSliderPosition();
}

function updateTimelineRangeSliderPosition() {
	const startPercent = canUseTimeline() && timelineDuration > 0 ? (timelineViewStart / timelineDuration) * 100 : 0;
	const endPercent = canUseTimeline() && timelineDuration > 0 ? (timelineViewEnd / timelineDuration) * 100 : 100;
	const startText = formatClockTime(timelineViewStart);
	const endText = formatClockTime(timelineViewEnd);

	timelineRangeSlider.style.setProperty("--timeline-range-start", `${startPercent}%`);
	timelineRangeSlider.style.setProperty("--timeline-range-end", `${endPercent}%`);
	timelineRangeStartHandle.title = `Start: ${startText}`;
	timelineRangeEndHandle.title = `End: ${endText}`;
	timelineRangeWindow.title = `${startText} to ${endText}`;
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

function shouldRenderTimelineThumbnails() {
	return canUseTimeline()
		&& (
			LOCAL_THUMBNAILS_ENABLED
			|| !currentVideoSource
			|| currentVideoSource.type !== "local"
		);
}

function renderTimelineThumbnailPlaceholders(duration) {
	const thumbnailCount = getTimelineThumbnailCount();

	timelineThumbnailsElement.replaceChildren();
	for (let index = 0; index < thumbnailCount; index += 1) {
		timelineThumbnailsElement.appendChild(createTimelineThumb(index, thumbnailCount, duration));
	}
}

async function renderTimelineThumbnails(src, duration) {
	if (!shouldRenderTimelineThumbnails()) {
		renderTimelineThumbnailPlaceholders(duration);
		timelineElement.classList.remove("timeline--loading");
		return;
	}

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

		timelineStatusElement.textContent = "Drag to scrub. Use the range bar to change or pan the visible span. Red spans are cuts.";
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

function scrubTimelineToPointer(event, options = {}) {
	event.preventDefault();
	const rect = timelineElement.getBoundingClientRect();
	const progress = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
	const nextTime = timelineProgressToTime(clamp(progress, 0, 1));

	updateTimelinePlayhead(nextTime);
	queueTimelineScrubSeek(nextTime, options);
}

function finishTimelineScrub(event) {
	if (!timelineScrubbing) {
		return;
	}

	timelineScrubbing = false;
	scrubTimelineToPointer(event, { exact: true });

	if (timelineElement.hasPointerCapture(event.pointerId)) {
		timelineElement.releasePointerCapture(event.pointerId);
	}

	if (shouldRefreshTimelineThumbnails()) {
		scheduleTimelineThumbnailRefresh();
	}
}

function queueTimelineScrubSeek(time, options = {}) {
	if (!Number.isFinite(time)) {
		return;
	}

	timelineScrubPendingTime = clamp(time, 0, timelineDuration || time);
	timelineScrubPendingExact = timelineScrubPendingExact || options.exact === true;

	if (options.exact && timelineScrubSeekTimer !== null) {
		window.clearTimeout(timelineScrubSeekTimer);
		timelineScrubSeekTimer = null;
	}

	if (timelineScrubSeekTimer !== null) {
		return;
	}

	timelineScrubSeekTimer = window.setTimeout(flushTimelineScrubSeek, options.exact ? 0 : TIMELINE_SCRUB_SEEK_DELAY);
}

function flushTimelineScrubSeek() {
	timelineScrubSeekTimer = null;

	if (!Number.isFinite(timelineScrubPendingTime)) {
		timelineScrubPendingExact = false;
		return;
	}

	if (videoElement.seeking && !timelineScrubPendingExact) {
		timelineScrubSeekTimer = window.setTimeout(flushTimelineScrubSeek, TIMELINE_SCRUB_SEEK_DELAY);
		return;
	}

	const targetTime = timelineScrubPendingTime;
	const exact = timelineScrubPendingExact;
	timelineScrubPendingTime = null;
	timelineScrubPendingExact = false;

	if (!exact && Math.abs(videoElement.currentTime - targetTime) < TIMELINE_SCRUB_MIN_SEEK_DELTA) {
		return;
	}

	seekTimelineVideo(targetTime, { fast: !exact });
}

function seekTimelineVideo(time, options = {}) {
	const targetTime = clamp(time, 0, timelineDuration || time);

	if (options.fast && typeof videoElement.fastSeek === "function") {
		try {
			videoElement.fastSeek(targetTime);
			return;
		} catch (error) {
			console.debug("fastSeek unavailable, using precise seek.", error);
		}
	}

	videoElement.currentTime = targetTime;
}

function cancelPendingTimelineScrubSeek() {
	if (timelineScrubSeekTimer !== null) {
		window.clearTimeout(timelineScrubSeekTimer);
		timelineScrubSeekTimer = null;
	}

	timelineScrubPendingTime = null;
	timelineScrubPendingExact = false;
}

function updateTimelinePlayhead(time = videoElement.currentTime) {
	const currentTime = Number.isFinite(time) ? time : 0;
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
			blur: getCutBlur(cut),
			reason: getCutReason(cut),
		}))
		.filter((cut) => Number.isFinite(cut.start) && Number.isFinite(cut.end) && cut.end > cut.start)
		.map((cut) => ({
			index: cut.index,
			start: clamp(cut.start, 0, duration),
			end: clamp(cut.end, 0, duration),
			mode: cut.mode,
			color: cut.color,
			blur: cut.blur,
			reason: cut.reason,
		}))
		.filter((cut) => cut.end > cut.start);
}

function getCutMarkerTitle(cut) {
	const timeRange = `${formatTime(cut.start)} to ${formatTime(cut.end)}`;
	const reasonSummary = getCutReasonSummary(cut.reason);
	const reasonPrefix = reasonSummary ? `${reasonSummary}: ` : "";

	if (getCutMode(cut) === CUT_MODE_REPLACE) {
		return `Cut ${cut.index + 1}: ${reasonPrefix}replace video with ${getCutColor(cut)} from ${timeRange}; audio preserved`;
	}

	if (getCutMode(cut) === CUT_MODE_BLUR) {
		return `Cut ${cut.index + 1}: ${reasonPrefix}blur selected area from ${timeRange}; audio preserved`;
	}

	return `Cut ${cut.index + 1}: ${reasonPrefix}remove ${timeRange}`;
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
	renderBlurMaskCanvas();
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
	renderBlurMaskCanvas();
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
	stopBlurMaskDrawing();
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
	const isBlurMode = mode === CUT_MODE_BLUR;
	const blur = getCutBlur(cut);
	const reason = getCutReason(cut) || {};
	const reasonSummary = getCutReasonSummary(reason);
	const actionSummary = getCutActionSummary(cut);

	cutOptionsEditorElement.hidden = false;
	cutOptionsEditorElement.classList.toggle("is-remove", !isReplaceMode);
	cutOptionsEditorElement.classList.toggle("is-blur", isBlurMode);
	cutOptionsLabelElement.textContent = `Cut ${selectedCutIndex + 1} options`;
	cutOptionsSummaryElement.textContent = reasonSummary
		? `${reasonSummary} | ${actionSummary}`
		: actionSummary;
	cutActionSelectElement.value = mode;
	cutColorInputElement.value = color;
	cutColorInputElement.disabled = !isReplaceMode;
	cutColorPickVideoButton.disabled = !isReplaceMode || !hasLoadedCurrentVideoPreview();
	cutColorSwatchElement.style.backgroundColor = color;
	blurMaskEditorElement.hidden = !isBlurMode;
	blurMaskDrawButton.disabled = !isBlurMode || !hasLoadedCurrentVideoPreview();
	blurAmountInputElement.value = String(blur.amount);
	blurMaskClearLastButton.disabled = !blur.shapes.length;
	blurMaskClearButton.disabled = !blur.shapes.length;
	cutReasonCategorySelectElement.value = reason.category || "";
	populateCutReasonSubcategorySelect(reason.category, reason.subcategory);
	cutReasonNoteInputElement.value = reason.note || "";
	mergePreviousCutButton.disabled = selectedCutIndex <= 0;
	mergeNextCutButton.disabled = selectedCutIndex >= cutList.length - 1;
	deleteCutButton.disabled = false;
}

function hideCutOptionsEditor() {
	cutOptionsEditorElement.hidden = true;
	stopBlurMaskDrawing();
	renderBlurMaskCanvas();
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
		delete cut.blur;
	} else if (mode === CUT_MODE_BLUR) {
		cut.blur = normalizeBlurMask(changes.blur || cut.blur || createDefaultBlurMask());
		delete cut.color;
	} else {
		delete cut.color;
		delete cut.blur;
	}

	updateCutlistDisplay();
	renderBlurMaskCanvas();

	if (options.showMessage) {
		if (mode === CUT_MODE_REPLACE) {
			showToast("Cut will keep audio", `Video will be replaced with ${cut.color}.`);
		} else if (mode === CUT_MODE_BLUR) {
			showToast("Cut will blur selected areas", "Use Draw Area to choose what gets blurred.");
		} else {
			showToast("Cut will be removed", "This range will be left out of the final edit.");
		}
	}
}

function updateSelectedCutReason(changes, options = {}) {
	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const cut = cutList[selectedCutIndex];

	if (!cut) {
		clearSelectedCut();
		return;
	}

	const reason = normalizeCutReasonDraft({
		...(getCutReason(cut) || {}),
		...changes,
	});

	if (reason) {
		cut.reason = reason;
	} else {
		delete cut.reason;
	}

	updateCutlistDisplay();

	if (options.showMessage) {
		const summary = getCutReasonSummary(reason);

		if (summary) {
			showToast("Cut reason updated", summary);
		} else {
			showToast("Cut reason cleared", "This cut is uncategorized.", "warning");
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
	stopBlurMaskDrawing();

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

function startBlurMaskDrawing() {
	if (selectedCutIndex === null) {
		showToast("Choose a cut first", "Click a cut range or one of its handles.", "warning");
		return;
	}

	if (getCutMode(cutList[selectedCutIndex]) !== CUT_MODE_BLUR) {
		updateSelectedCutOptions({ mode: CUT_MODE_BLUR }, { showMessage: false });
	}

	if (!videoElement.videoWidth || !videoElement.videoHeight || videoElement.readyState < 2) {
		showToast("Video frame unavailable", "Wait for the video frame to load, then try again.", "warning");
		return;
	}

	stopVideoColorPick();
	blurMaskDrawingActive = true;
	document.body.classList.add("blur-mask-drawing");
	syncBlurCanvasSize();
	renderBlurMaskCanvas();
	showToast("Draw blur area", `Use the ${blurToolSelectElement.value} tool on the video frame.`);
}

function stopBlurMaskDrawing() {
	blurMaskDrawingActive = false;
	activeBlurMaskDraft = null;
	document.body.classList.remove("blur-mask-drawing");
	renderBlurMaskCanvas();
}

function handleBlurMaskPointerDown(event) {
	if (!blurMaskDrawingActive || selectedCutIndex === null) {
		return;
	}

	const point = getNormalizedVideoPoint(event);

	if (!point) {
		showToast("Draw inside the frame", "Start inside the displayed video image.", "warning");
		return;
	}

	event.preventDefault();
	event.stopPropagation();
	blurMaskCanvas.setPointerCapture(event.pointerId);

	const tool = blurToolSelectElement.value;
	activeBlurMaskDraft = {
		pointerId: event.pointerId,
		tool,
		start: point,
		points: [point],
	};
	renderBlurMaskCanvas();
}

function handleBlurMaskPointerMove(event) {
	if (!activeBlurMaskDraft || activeBlurMaskDraft.pointerId !== event.pointerId) {
		return;
	}

	const point = getNormalizedVideoPoint(event);

	if (!point) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	if (activeBlurMaskDraft.tool === "rectangle") {
		activeBlurMaskDraft.end = point;
	} else {
		activeBlurMaskDraft.points.push(point);
	}

	renderBlurMaskCanvas();
}

function finishBlurMaskDrawing(event) {
	if (!activeBlurMaskDraft || activeBlurMaskDraft.pointerId !== event.pointerId) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	const shape = createBlurShapeFromDraft(activeBlurMaskDraft);
	activeBlurMaskDraft = null;

	if (!shape) {
		renderBlurMaskCanvas();
		return;
	}

	addBlurShape(shape);
}

function cancelBlurMaskDraft() {
	activeBlurMaskDraft = null;
	renderBlurMaskCanvas();
}

function createBlurShapeFromDraft(draft) {
	if (draft.tool === "rectangle") {
		const start = draft.start;
		const end = draft.end || draft.points[draft.points.length - 1] || start;
		const x = Math.min(start.x, end.x);
		const y = Math.min(start.y, end.y);
		const width = Math.abs(end.x - start.x);
		const height = Math.abs(end.y - start.y);

		if (width < 0.01 || height < 0.01) {
			showToast("Area too small", "Drag a larger rectangle to blur.", "warning");
			return null;
		}

		return { tool: "rectangle", rect: { x, y, width, height } };
	}

	const points = simplifyBlurPoints(draft.points);

	if (draft.tool === "lasso") {
		if (points.length < 3) {
			showToast("Lasso too small", "Draw a larger enclosed area.", "warning");
			return null;
		}

		return { tool: "lasso", points };
	}

	if (!points.length) {
		return null;
	}

	return {
		tool: "brush",
		points,
		brushSize: Number(blurBrushSizeInputElement.value) / Math.max(videoElement.videoWidth || 1280, videoElement.videoHeight || 720),
	};
}

function simplifyBlurPoints(points) {
	const simplified = [];

	points.forEach((point) => {
		const previous = simplified[simplified.length - 1];

		if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) >= 0.004) {
			simplified.push(point);
		}
	});

	return simplified;
}

function addBlurShape(shape) {
	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const cut = cutList[selectedCutIndex];
	const blur = normalizeBlurMask(cut.blur || createDefaultBlurMask());

	blur.shapes.push(shape);
	cut.mode = CUT_MODE_BLUR;
	cut.blur = normalizeBlurMask(blur);
	updateCutlistDisplay();
	renderBlurMaskCanvas();
	showToast("Blur area added", `${blur.shapes.length} selected area${blur.shapes.length === 1 ? "" : "s"} on this cut.`);
}

function updateSelectedBlurMask(changes, options = {}) {
	if (selectedCutIndex === null || getCutMode(cutList[selectedCutIndex]) !== CUT_MODE_BLUR) {
		return;
	}

	if (!readEditableCutListForSelectedCut()) {
		return;
	}

	const cut = cutList[selectedCutIndex];
	cut.blur = normalizeBlurMask({
		...createDefaultBlurMask(),
		...(cut.blur || {}),
		...changes,
	});
	updateCutlistDisplay();
	renderBlurMaskCanvas();

	if (options.showMessage) {
		showToast("Blur updated", "Selected blur settings were changed.");
	}
}

function removeLastBlurShape() {
	if (selectedCutIndex === null || getCutMode(cutList[selectedCutIndex]) !== CUT_MODE_BLUR) {
		return;
	}

	const blur = getCutBlur(cutList[selectedCutIndex]);

	if (!blur.shapes.length) {
		return;
	}

	blur.shapes.pop();
	updateSelectedBlurMask({ shapes: blur.shapes }, { showMessage: true });
}

function clearBlurMask() {
	if (selectedCutIndex === null || getCutMode(cutList[selectedCutIndex]) !== CUT_MODE_BLUR) {
		return;
	}

	updateSelectedBlurMask({ shapes: [] }, { showMessage: true });
}

function getNormalizedVideoPoint(event) {
	const frame = getVideoFrameRect();

	if (!frame) {
		return null;
	}

	const relativeX = event.clientX - frame.left;
	const relativeY = event.clientY - frame.top;

	if (relativeX < 0 || relativeY < 0 || relativeX > frame.width || relativeY > frame.height) {
		return null;
	}

	return {
		x: clamp(relativeX / frame.width, 0, 1),
		y: clamp(relativeY / frame.height, 0, 1),
	};
}

function getVideoFrameRect() {
	const rect = videoElement.getBoundingClientRect();
	const videoWidth = videoElement.videoWidth;
	const videoHeight = videoElement.videoHeight;

	if (!rect.width || !rect.height || !videoWidth || !videoHeight) {
		return null;
	}

	const elementRatio = rect.width / rect.height;
	const videoRatio = videoWidth / videoHeight;
	let width = rect.width;
	let height = rect.height;
	let left = rect.left;
	let top = rect.top;

	if (elementRatio > videoRatio) {
		height = rect.height;
		width = height * videoRatio;
		left += (rect.width - width) / 2;
	} else {
		width = rect.width;
		height = width / videoRatio;
		top += (rect.height - height) / 2;
	}

	return { left, top, width, height };
}

function syncBlurCanvasSize() {
	const rect = videoStageElement.getBoundingClientRect();
	const width = Math.max(1, Math.round(rect.width));
	const height = Math.max(1, Math.round(rect.height));

	if (blurMaskCanvas.width !== width || blurMaskCanvas.height !== height) {
		blurMaskCanvas.width = width;
		blurMaskCanvas.height = height;
	}
}

function renderBlurMaskCanvas() {
	if (!blurMaskCanvas) {
		return;
	}

	syncBlurCanvasSize();

	const context = blurMaskCanvas.getContext("2d");
	context.clearRect(0, 0, blurMaskCanvas.width, blurMaskCanvas.height);

	if (selectedCutIndex === null || !cutList[selectedCutIndex] || getCutMode(cutList[selectedCutIndex]) !== CUT_MODE_BLUR) {
		return;
	}

	const frame = getCanvasVideoFrameRect();

	if (!frame) {
		return;
	}

	const blur = getCutBlur(cutList[selectedCutIndex]);
	context.fillStyle = "rgba(15, 118, 110, 0.24)";
	context.strokeStyle = "rgba(255, 255, 255, 0.9)";
	context.lineWidth = 2;
	blur.shapes.forEach((shape) => drawBlurShapeOnContext(context, shape, frame));

	if (activeBlurMaskDraft) {
		context.setLineDash([6, 4]);
		drawBlurShapeOnContext(context, createPreviewShapeFromDraft(activeBlurMaskDraft), frame);
		context.setLineDash([]);
	}
}

function getCanvasVideoFrameRect() {
	const frame = getVideoFrameRect();
	const stageRect = videoStageElement.getBoundingClientRect();

	if (!frame || !stageRect.width || !stageRect.height) {
		return null;
	}

	return {
		x: frame.left - stageRect.left,
		y: frame.top - stageRect.top,
		width: frame.width,
		height: frame.height,
	};
}

function createPreviewShapeFromDraft(draft) {
	if (draft.tool === "rectangle") {
		const start = draft.start;
		const end = draft.end || draft.start;
		return {
			tool: "rectangle",
			rect: {
				x: Math.min(start.x, end.x),
				y: Math.min(start.y, end.y),
				width: Math.abs(end.x - start.x),
				height: Math.abs(end.y - start.y),
			},
		};
	}

	if (draft.tool === "lasso") {
		return { tool: "lasso", points: draft.points };
	}

	return {
		tool: "brush",
		points: draft.points,
		brushSize: Number(blurBrushSizeInputElement.value) / Math.max(videoElement.videoWidth || 1280, videoElement.videoHeight || 720),
	};
}

function drawBlurShapeOnContext(context, shape, frame) {
	if (!shape) {
		return;
	}

	context.beginPath();

	if (shape.tool === "rectangle" && shape.rect) {
		const rect = shape.rect;
		context.rect(
			frame.x + rect.x * frame.width,
			frame.y + rect.y * frame.height,
			rect.width * frame.width,
			rect.height * frame.height
		);
		context.fill();
		context.stroke();
		return;
	}

	if (shape.tool === "lasso" && shape.points && shape.points.length) {
		shape.points.forEach((point, index) => {
			const x = frame.x + point.x * frame.width;
			const y = frame.y + point.y * frame.height;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.closePath();
		context.fill();
		context.stroke();
		return;
	}

	if (shape.tool === "brush" && shape.points && shape.points.length) {
		context.lineCap = "round";
		context.lineJoin = "round";
		context.lineWidth = Math.max(4, (shape.brushSize || DEFAULT_BLUR_BRUSH_SIZE) * Math.max(frame.width, frame.height));
		context.strokeStyle = "rgba(15, 118, 110, 0.42)";
		shape.points.forEach((point, index) => {
			const x = frame.x + point.x * frame.width;
			const y = frame.y + point.y * frame.height;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.stroke();
		context.strokeStyle = "rgba(255, 255, 255, 0.9)";
		context.lineWidth = 2;
	}
}

function getCutMode(cut) {
	if (cut && cut.mode === CUT_MODE_REPLACE) {
		return CUT_MODE_REPLACE;
	}

	if (cut && cut.mode === CUT_MODE_BLUR) {
		return CUT_MODE_BLUR;
	}

	return CUT_MODE_REMOVE;
}

function normalizeCutMode(mode) {
	if (mode === CUT_MODE_REPLACE) {
		return CUT_MODE_REPLACE;
	}

	if (mode === CUT_MODE_BLUR) {
		return CUT_MODE_BLUR;
	}

	return CUT_MODE_REMOVE;
}

function getCutColor(cut) {
	return normalizeHexColor(cut && cut.color) || DEFAULT_REPLACEMENT_COLOR;
}

function getCutBlur(cut) {
	return normalizeBlurMask(cut && cut.blur);
}

function createDefaultBlurMask() {
	return {
		amount: DEFAULT_BLUR_AMOUNT,
		shapes: [],
	};
}

function normalizeBlurMask(blur) {
	const amount = clamp(Math.round(Number(blur && blur.amount) || DEFAULT_BLUR_AMOUNT), 2, 64);
	const shapes = Array.isArray(blur && blur.shapes)
		? blur.shapes.map(normalizeBlurShape).filter(Boolean)
		: [];

	return { amount, shapes };
}

function normalizeBlurShape(shape) {
	if (!shape || typeof shape !== "object") {
		return null;
	}

	if (shape.tool === "rectangle" && shape.rect) {
		const x = clamp(Number(shape.rect.x) || 0, 0, 1);
		const y = clamp(Number(shape.rect.y) || 0, 0, 1);
		const width = clamp(Number(shape.rect.width) || 0, 0, 1 - x);
		const height = clamp(Number(shape.rect.height) || 0, 0, 1 - y);
		return width > 0 && height > 0 ? { tool: "rectangle", rect: { x, y, width, height } } : null;
	}

	if (shape.tool === "lasso") {
		const points = normalizeBlurPoints(shape.points);
		return points.length >= 3 ? { tool: "lasso", points } : null;
	}

	if (shape.tool === "brush") {
		const points = normalizeBlurPoints(shape.points);
		const brushSize = clamp(Number(shape.brushSize) || DEFAULT_BLUR_BRUSH_SIZE, 0.005, 0.35);
		return points.length ? { tool: "brush", points, brushSize } : null;
	}

	return null;
}

function normalizeBlurPoints(points) {
	if (!Array.isArray(points)) {
		return [];
	}

	return points
		.map((point) => {
			if (!point || typeof point !== "object") {
				return null;
			}

			return {
				x: clamp(Number(point.x) || 0, 0, 1),
				y: clamp(Number(point.y) || 0, 0, 1),
			};
		})
		.filter(Boolean);
}

function getCutActionSummary(cut) {
	const mode = getCutMode(cut);

	if (mode === CUT_MODE_REPLACE) {
		return `Replace video with ${getCutColor(cut)}; keep audio`;
	}

	if (mode === CUT_MODE_BLUR) {
		const blur = getCutBlur(cut);
		return `Blur ${blur.shapes.length || "selected"} area${blur.shapes.length === 1 ? "" : "s"}; keep audio`;
	}

	return "Remove from final edit";
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

function getCutReason(cut) {
	return normalizeCutReasonDraft(cut && cut.reason);
}

function normalizeCutReasonDraft(reason) {
	if (!reason || typeof reason !== "object" || Array.isArray(reason)) {
		return null;
	}

	const category = getCutReasonCategory(reason.category);
	const note = normalizeCutReasonNote(reason.note);
	const normalized = {};

	if (category) {
		normalized.category = category.id;

		const subcategory = getCutReasonSubcategory(category.id, reason.subcategory);

		if (subcategory) {
			normalized.subcategory = subcategory.id;
		}
	}

	if (note) {
		normalized.note = note;
	}

	return Object.keys(normalized).length ? normalized : null;
}

function normalizeCutReasonNote(note) {
	if (note === null || note === undefined) {
		return "";
	}

	const normalized = String(note).replace(/\s+/g, " ").slice(0, 280);

	return normalized.trim() ? normalized : "";
}

function getCutReasonCategory(categoryId) {
	return CUT_REASON_CATEGORIES.find((category) => category.id === categoryId) || null;
}

function getCutReasonSubcategory(categoryId, subcategoryId) {
	const category = getCutReasonCategory(categoryId);

	if (!category) {
		return null;
	}

	return category.subcategories.find((subcategory) => subcategory.id === subcategoryId) || null;
}

function getCutReasonSummary(reason) {
	const normalizedReason = normalizeCutReasonDraft(reason);

	if (!normalizedReason) {
		return "";
	}

	const category = getCutReasonCategory(normalizedReason.category);
	const subcategory = getCutReasonSubcategory(normalizedReason.category, normalizedReason.subcategory);
	const classification = [
		category && category.label,
		subcategory && subcategory.label,
	].filter(Boolean).join(": ");
	const note = normalizedReason.note ? normalizedReason.note.trim() : "";

	return [classification, note].filter(Boolean).join(" - ");
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
	if (!hasLoadedCurrentVideoPreview()) {
		showToast("Load preview first", "Load the local preview before saving a cutlist.", "warning");
		return;
	}

	try {
		const data = await saveCutlist();

		if (data.local) {
			statusElement.textContent = `Cutlist saved in this browser and downloaded as ${data.downloadName}.\n\nThe video file was not uploaded.`;
			showToast("Cutlist saved", data.downloadName);
		} else {
			statusElement.textContent = `Cutlist saved to ${data.path}\n\nEdit Video now renders locally in the browser. Legacy command:\n${data.editCommand}`;
			showToast("Cutlist saved", "You can edit locally now.");
		}
	} catch (error) {
		console.error("Error saving cutlist: ", error);
		statusElement.textContent = error.message;
		showToast("Could not save cutlist", error.message, "error");
	}
});

async function saveCutlist(options = {}) {
	cutList = readCutlistFromEditor();
	updateCutlistDisplay();

	if (currentVideoSource && currentVideoSource.type === "local") {
		return saveLocalCutlist(options);
	}

	const response = await fetch("/cutlists", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(buildCutlistPayload()),
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "Failed to save cutlist.");
	}

	return data;
}

function saveLocalCutlist(options = {}) {
	const payload = buildCutlistPayload();
	const storageKey = getLocalCutlistStorageKey();
	const downloadName = getCutlistDownloadName();

	if (storageKey) {
		window.localStorage.setItem(storageKey, JSON.stringify(payload));
	}

	if (options.download !== false) {
		downloadJson(payload, downloadName);
	}

	return {
		local: true,
		path: "browser local storage",
		downloadName,
		editCommand: "Use Edit Video for a browser-local export.",
	};
}

function buildCutlistPayload() {
	return {
		videoSrc,
		sourceType: currentVideoSource ? currentVideoSource.type : "unknown",
		videoIdentity: currentVideoSource ? currentVideoSource.identity : null,
		cutList,
		episodeIdentity,
		introSrc: introSelect.value,
		outroSrc: outroSelect.value,
		savedAt: new Date().toISOString(),
	};
}

function getLocalCutlistStorageKey() {
	if (!currentVideoSource || currentVideoSource.type !== "local") {
		return "";
	}

	return `${LOCAL_CUTLIST_STORAGE_PREFIX}${btoa(unescape(encodeURIComponent(JSON.stringify(currentVideoSource.identity))))}`;
}

function getCutlistDownloadName() {
	const baseName = currentVideoSource ? currentVideoSource.displayName : "cutlist";
	return `${sanitizeFileName(baseName)}.cutlist.json`;
}

function getEditedVideoDownloadName() {
	const baseName = currentVideoSource ? currentVideoSource.displayName : "edited-video";
	return `${sanitizeFileName(baseName)}-edited.${CLIENT_EXPORT_OUTPUT_EXTENSION}`;
}

function downloadJson(data, fileName) {
	const blob = new Blob([JSON.stringify(data, null, "\t")], { type: "application/json" });
	downloadBlob(blob, fileName);
}

function downloadBlob(blob, fileName) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFileName(value) {
	const sanitized = String(value || "video")
		.replace(/\.[^.]+$/, "")
		.replace(/[^a-z0-9._-]+/gi, "-")
		.replace(/^-+|-+$/g, "");

	return sanitized || "video";
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

function hideEditProgress() {
	editProgressElement.hidden = true;
	editProgressBar.value = 0;
	editProgressLabel.textContent = "Preparing edit...";
	editProgressPercent.textContent = "0%";
	resetSegmentProgress();
}

function showFinalVideo(outputUrl) {
	if (finalVideoObjectUrl && finalVideoObjectUrl !== outputUrl) {
		URL.revokeObjectURL(finalVideoObjectUrl);
		finalVideoObjectUrl = null;
	}

	if (outputUrl.startsWith("blob:")) {
		finalVideoObjectUrl = outputUrl;
		finalVideoElement.src = outputUrl;
	} else {
		finalVideoElement.src = `${outputUrl}?t=${Date.now()}`;
	}

	finalVideoElement.hidden = false;
	document.body.classList.add("has-final-video");
	finalVideoElement.load();
}

function hideFinalVideo() {
	if (finalVideoObjectUrl) {
		URL.revokeObjectURL(finalVideoObjectUrl);
		finalVideoObjectUrl = null;
	}

	finalVideoElement.hidden = true;
	finalVideoElement.removeAttribute("src");
	finalVideoElement.load();
	document.body.classList.remove("has-final-video");
}

async function runClientSideEdit() {
	const unsupportedReasons = getClientExportUnsupportedReasons();

	if (unsupportedReasons.length) {
		throw new Error(`Browser-local export is started, but this cutlist needs more exporter work:\n- ${unsupportedReasons.join("\n- ")}`);
	}

	const duration = getCurrentVideoDuration();
	const keepRanges = getKeepRangesForExport(cutList, duration);
	const replacementSegments = getReplacementExportSegments(cutList, duration);
	const exportSegments = replacementSegments.length
		? replacementSegments
		: keepRanges.map((range) => ({ type: "video", start: range.start, end: range.end }));
	const shouldRenderReplacementSegments = exportSegments.some((segment) => segment.type === "color" || segment.type === "blur");

	if (!keepRanges.length && !replacementSegments.length) {
		throw new Error("Every part of the video is marked for removal. Leave at least one range in the final edit.");
	}

	updateEditProgress({ percent: 8, message: "Loading local video engine..." });
	const { ffmpeg, fetchFile } = await loadFfmpegTools();
	const exportId = `export-${Date.now().toString(36)}`;
	const inputName = `${exportId}${getInputFileExtension()}`;
	const outputName = `${exportId}-edited.${CLIENT_EXPORT_OUTPUT_EXTENSION}`;
	const segmentNames = [];

	try {
		clientFfmpegLogs = [];
		updateEditProgress({ percent: 16, message: "Reading source video locally..." });
		await ffmpeg.writeFile(inputName, await fetchFile(getFfmpegInputSource()));

		if (shouldRenderReplacementSegments || !shouldCopyWholeVideo(keepRanges, duration)) {
			const videoInfo = getClientExportVideoInfo();

			for (let index = 0; index < exportSegments.length; index += 1) {
				const segment = exportSegments[index];
				const segmentName = `${exportId}-segment-${String(index).padStart(3, "0")}.mp4`;
				const segmentStartPercent = 18 + (index / exportSegments.length) * 60;
				const segmentEndPercent = 18 + ((index + 1) / exportSegments.length) * 60;
				const segmentLabel = segment.type === "color"
					? "Replacing video with color"
					: segment.type === "blur"
						? "Blurring selected area"
						: "Creating video segment";

				segmentNames.push(segmentName);
				clientExportProgress = {
					start: segmentStartPercent,
					end: segmentEndPercent,
					message: `${segmentLabel} ${index + 1}/${exportSegments.length}...`,
				};
				updateSegmentProgress({
					percent: (index / exportSegments.length) * 100,
					message: `Segment ${index + 1}/${exportSegments.length}`,
				});
				if (segment.type === "blur") {
					await ffmpeg.writeFile(`${segmentName}.mask.pgm`, createBlurMaskPgm(segment.blur, videoInfo.width, videoInfo.height));
				}
				await runFfmpegCommand(
					ffmpeg,
					createReplacementSegmentCommand(inputName, segmentName, segment, videoInfo),
					`Segment ${index + 1}/${exportSegments.length}`
				);
			}

			updateSegmentProgress({ percent: 100, message: "Segments ready" });
			updateEditProgress({ percent: 80, message: "Joining segments locally..." });
			await ffmpeg.writeFile(`${exportId}-segments.txt`, new TextEncoder().encode(createConcatList(segmentNames)));
			clientExportProgress = { start: 80, end: 92, message: "Joining segments locally..." };
			await runFfmpegCommand(ffmpeg, [
				"-f",
				"concat",
				"-safe",
				"0",
				"-i",
				`${exportId}-segments.txt`,
				"-c",
				"copy",
				outputName,
			], "Joining segments");
		} else if (shouldCopyWholeVideo(keepRanges, duration)) {
			clientExportProgress = { start: 18, end: 88, message: "Copying video locally..." };
			await runFfmpegCommand(ffmpeg, ["-i", inputName, "-map", "0:v:0", "-map", "0:a:0?", "-c", "copy", outputName], "Copying video");
		}

		clientExportProgress = null;
		updateEditProgress({ percent: 94, message: "Preparing download..." });
		const outputData = await ffmpeg.readFile(outputName);
		const blob = new Blob([outputData], { type: "video/mp4" });
		const outputUrl = URL.createObjectURL(blob);
		const fileName = getEditedVideoDownloadName();

		return { blob, outputUrl, fileName };
	} finally {
		clientExportProgress = null;
		await cleanupFfmpegFiles(ffmpeg, [
			inputName,
			outputName,
			`${exportId}-segments.txt`,
			...segmentNames,
			...segmentNames.map((name) => `${name}.mask.pgm`),
		]);
	}
}

function getClientExportUnsupportedReasons() {
	const reasons = [];

	if (introSelect.value || outroSelect.value) {
		reasons.push("intro/outro concatenation is selected");
	}

	if (debugBlackCutsInput.checked) {
		reasons.push("debug black removals are enabled");
	}

	return reasons;
}

async function loadFfmpegTools() {
	if (!ffmpegToolsPromise) {
		ffmpegToolsPromise = (async () => {
			const { FFmpeg } = await import(FFMPEG_MODULE_URL);
			const ffmpeg = new FFmpeg();

			ffmpeg.on("log", ({ message }) => {
				if (message) {
					clientFfmpegLogs.push(message);
					clientFfmpegLogs = clientFfmpegLogs.slice(-80);
					console.debug("[ffmpeg]", message);
				}
			});
			ffmpeg.on("progress", ({ progress }) => {
				if (!clientExportProgress) {
					return;
				}

				const safeProgress = clamp(Number(progress) || 0, 0, 1);
				const percent = clientExportProgress.start + (clientExportProgress.end - clientExportProgress.start) * safeProgress;
				updateEditProgress({
					percent,
					message: clientExportProgress.message,
				});
			});

			await ffmpeg.load({
				coreURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
				wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
			});

			return { ffmpeg, fetchFile };
		})().catch((error) => {
			ffmpegToolsPromise = null;
			throw error;
		});
	}

	return ffmpegToolsPromise;
}

async function toBlobURL(url, mimeType) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not load ${url}: ${response.status}`);
	}

	const blob = await response.blob();
	return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

async function fetchFile(input) {
	if (input instanceof Blob) {
		return new Uint8Array(await input.arrayBuffer());
	}

	const response = await fetch(input);

	if (!response.ok) {
		throw new Error(`Could not read source video: ${response.status}`);
	}

	return new Uint8Array(await response.arrayBuffer());
}

async function runFfmpegCommand(ffmpeg, args, label) {
	const exitCode = await ffmpeg.exec(args);

	if (exitCode === 0) {
		return;
	}

	const recentLog = getRecentFfmpegLogSummary();
	throw new Error(`${label} failed in FFmpeg.${recentLog ? `\n\n${recentLog}` : ""}`);
}

function getRecentFfmpegLogSummary() {
	const importantLines = clientFfmpegLogs
		.filter((line) => {
			const normalized = line.toLowerCase();
			return normalized.includes("error")
				|| normalized.includes("failed")
				|| normalized.includes("invalid")
				|| normalized.includes("not found")
				|| normalized.includes("impossible")
				|| normalized.includes("unknown")
				|| normalized.includes("unsupported")
				|| normalized.includes("aborted");
		})
		.slice(-8);

	const lines = importantLines.length ? importantLines : clientFfmpegLogs.slice(-8);

	return lines.length ? `Recent FFmpeg output:\n${lines.join("\n")}` : "";
}

function getFfmpegInputSource() {
	if (!currentVideoSource) {
		throw new Error("Choose a video first.");
	}

	return currentVideoSource.file || currentVideoSource.playbackSrc;
}

function getInputFileExtension() {
	const match = currentVideoSource && currentVideoSource.fileName.match(/(\.[a-z0-9]+)$/i);
	return match ? match[1].toLowerCase() : ".mp4";
}

function getCurrentVideoDuration() {
	const duration = timelineDuration || videoElement.duration;

	if (!Number.isFinite(duration) || duration <= 0) {
		throw new Error("Video duration is unavailable. Wait for the source video to finish loading.");
	}

	return duration;
}

function getKeepRangesForExport(cuts, duration) {
	const removeRanges = mergeCutRanges(
		normalizeCutRanges(cuts, duration)
			.filter((cut) => cut.mode === CUT_MODE_REMOVE)
			.map((cut) => ({
				start: cut.start,
				end: cut.end,
			}))
			.sort((a, b) => a.start - b.start)
	);
	const keepRanges = [];
	let cursor = 0;

	removeRanges.forEach((range) => {
		if (range.start > cursor + CUT_POINT_MIN_GAP) {
			keepRanges.push({ start: cursor, end: range.start });
		}

		cursor = Math.max(cursor, range.end);
	});

	if (cursor < duration - CUT_POINT_MIN_GAP) {
		keepRanges.push({ start: cursor, end: duration });
	}

	return keepRanges.filter((range) => range.end - range.start > CUT_POINT_MIN_GAP);
}

function getReplacementExportSegments(cuts, duration) {
	const segments = [];
	let cursor = 0;

	normalizeCutRanges(cuts, duration)
		.sort((a, b) => a.start - b.start)
		.forEach((cut) => {
			const effectiveStart = Math.max(cut.start, cursor);

			if (cut.start > cursor + CUT_POINT_MIN_GAP) {
				segments.push({ type: "video", start: cursor, end: cut.start });
			}

			if (cut.end > cursor + CUT_POINT_MIN_GAP && cut.mode === CUT_MODE_REPLACE) {
				segments.push({
					type: "color",
					start: effectiveStart,
					end: cut.end,
					color: cut.color || DEFAULT_REPLACEMENT_COLOR,
				});
			} else if (cut.end > cursor + CUT_POINT_MIN_GAP && cut.mode === CUT_MODE_BLUR) {
				segments.push({
					type: "blur",
					start: effectiveStart,
					end: cut.end,
					blur: cut.blur || createDefaultBlurMask(),
				});
			}

			cursor = Math.max(cursor, cut.end);
		});

	if (cursor < duration - CUT_POINT_MIN_GAP) {
		segments.push({ type: "video", start: cursor, end: duration });
	}

	return segments.filter((segment) => segment.end - segment.start > CUT_POINT_MIN_GAP);
}

function getClientExportVideoInfo() {
	return {
		width: videoElement.videoWidth || 1280,
		height: videoElement.videoHeight || 720,
		frameRate: Number.isFinite(activeFrameRate) && activeFrameRate > 0
			? activeFrameRate
			: DEFAULT_LOCAL_FRAME_RATE,
	};
}

function createReplacementSegmentCommand(inputName, outputName, segment, videoInfo) {
	const duration = formatFfmpegSeconds(segment.end - segment.start);
	const encodeOptions = [
		"-c:v",
		"libx264",
		"-preset",
		"ultrafast",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
	];

	if (segment.type === "color") {
		return [
			"-ss",
			formatFfmpegSeconds(segment.start),
			"-t",
			duration,
			"-i",
			inputName,
			"-f",
			"lavfi",
			"-i",
			createColorFilter(segment, videoInfo),
			"-map",
			"1:v:0",
			"-map",
			"0:a:0?",
			"-t",
			duration,
			"-shortest",
			...encodeOptions,
			outputName,
		];
	}

	if (segment.type === "blur") {
		const maskName = `${outputName}.mask.pgm`;
		return createBlurSegmentCommand(inputName, outputName, maskName, segment, videoInfo);
	}

	return [
		"-i",
		inputName,
		"-ss",
		formatFfmpegSeconds(segment.start),
		"-t",
		duration,
		"-map",
		"0:v:0",
		"-map",
		"0:a:0?",
		...encodeOptions,
		"-avoid_negative_ts",
		"make_zero",
		outputName,
	];
}

function createBlurSegmentCommand(inputName, outputName, maskName, segment, videoInfo) {
	const duration = formatFfmpegSeconds(segment.end - segment.start);
	const blurAmount = Math.max(2, Math.min(64, Math.round(segment.blur && segment.blur.amount || DEFAULT_BLUR_AMOUNT)));

	return [
		"-ss",
		formatFfmpegSeconds(segment.start),
		"-t",
		duration,
		"-i",
		inputName,
		"-loop",
		"1",
		"-i",
		maskName,
		"-filter_complex",
		`[0:v]split[base][blurbase];[blurbase]boxblur=${blurAmount}:1[blurred];[1:v]format=gray,scale=${Math.round(videoInfo.width)}:${Math.round(videoInfo.height)}[mask];[blurred][mask]alphamerge[blurredalpha];[base][blurredalpha]overlay=0:0,format=yuv420p[v]`,
		"-map",
		"[v]",
		"-map",
		"0:a:0?",
		"-t",
		duration,
		"-c:v",
		"libx264",
		"-preset",
		"ultrafast",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		"-shortest",
		outputName,
	];
}

function createBlurMaskPgm(blur, width, height) {
	const maskWidth = Math.max(2, Math.round(width || 1280));
	const maskHeight = Math.max(2, Math.round(height || 720));
	const pixels = new Uint8Array(maskWidth * maskHeight);
	const normalizedBlur = normalizeBlurMask(blur);

	normalizedBlur.shapes.forEach((shape) => {
		if (shape.tool === "rectangle" && shape.rect) {
			fillMaskRect(pixels, maskWidth, maskHeight, shape.rect);
		} else if (shape.tool === "lasso" && shape.points) {
			fillMaskPolygon(pixels, maskWidth, maskHeight, shape.points);
		} else if (shape.tool === "brush" && shape.points) {
			fillMaskBrush(pixels, maskWidth, maskHeight, shape);
		}
	});

	const header = new TextEncoder().encode(`P5\n${maskWidth} ${maskHeight}\n255\n`);
	const file = new Uint8Array(header.length + pixels.length);
	file.set(header, 0);
	file.set(pixels, header.length);
	return file;
}

function fillMaskRect(pixels, width, height, rect) {
	const x1 = Math.floor(rect.x * width);
	const y1 = Math.floor(rect.y * height);
	const x2 = Math.ceil((rect.x + rect.width) * width);
	const y2 = Math.ceil((rect.y + rect.height) * height);

	for (let y = clamp(y1, 0, height - 1); y <= clamp(y2, 0, height - 1); y += 1) {
		for (let x = clamp(x1, 0, width - 1); x <= clamp(x2, 0, width - 1); x += 1) {
			pixels[y * width + x] = 255;
		}
	}
}

function fillMaskPolygon(pixels, width, height, points) {
	const scaled = points.map((point) => ({ x: point.x * width, y: point.y * height }));
	const minY = clamp(Math.floor(Math.min(...scaled.map((point) => point.y))), 0, height - 1);
	const maxY = clamp(Math.ceil(Math.max(...scaled.map((point) => point.y))), 0, height - 1);

	for (let y = minY; y <= maxY; y += 1) {
		const intersections = [];

		for (let index = 0; index < scaled.length; index += 1) {
			const a = scaled[index];
			const b = scaled[(index + 1) % scaled.length];

			if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
				intersections.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
			}
		}

		intersections.sort((a, b) => a - b);

		for (let index = 0; index < intersections.length; index += 2) {
			const start = clamp(Math.floor(intersections[index]), 0, width - 1);
			const end = clamp(Math.ceil(intersections[index + 1] || intersections[index]), 0, width - 1);

			for (let x = start; x <= end; x += 1) {
				pixels[y * width + x] = 255;
			}
		}
	}
}

function fillMaskBrush(pixels, width, height, shape) {
	const radius = Math.max(1, Math.round((shape.brushSize || DEFAULT_BLUR_BRUSH_SIZE) * Math.max(width, height) / 2));
	const points = shape.points.map((point) => ({
		x: Math.round(point.x * width),
		y: Math.round(point.y * height),
	}));

	for (let index = 0; index < points.length; index += 1) {
		fillMaskCircle(pixels, width, height, points[index].x, points[index].y, radius);

		if (index > 0) {
			const previous = points[index - 1];
			const current = points[index];
			const steps = Math.max(1, Math.ceil(Math.hypot(current.x - previous.x, current.y - previous.y) / Math.max(1, radius / 2)));

			for (let step = 1; step < steps; step += 1) {
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
	const minX = clamp(centerX - radius, 0, width - 1);
	const maxX = clamp(centerX + radius, 0, width - 1);
	const minY = clamp(centerY - radius, 0, height - 1);
	const maxY = clamp(centerY + radius, 0, height - 1);

	for (let y = minY; y <= maxY; y += 1) {
		for (let x = minX; x <= maxX; x += 1) {
			const dx = x - centerX;
			const dy = y - centerY;

			if (dx * dx + dy * dy <= radiusSquared) {
				pixels[y * width + x] = 255;
			}
		}
	}
}

function createColorFilter(segment, videoInfo) {
	const duration = formatFfmpegSeconds(segment.end - segment.start);
	const width = Math.max(2, Math.round(videoInfo.width));
	const height = Math.max(2, Math.round(videoInfo.height));
	const frameRate = Math.max(1, Math.round(videoInfo.frameRate || DEFAULT_LOCAL_FRAME_RATE));

	return `color=c=${hexColorToFfmpegColor(segment.color)}:s=${width}x${height}:r=${frameRate}:d=${duration}`;
}

function hexColorToFfmpegColor(color) {
	return `0x${String(normalizeHexColor(color) || DEFAULT_REPLACEMENT_COLOR).replace("#", "")}`;
}

function shouldCopyWholeVideo(keepRanges, duration) {
	return keepRanges.length === 1 && keepRanges[0].start <= CUT_POINT_MIN_GAP && keepRanges[0].end >= duration - CUT_POINT_MIN_GAP;
}

function formatFfmpegSeconds(value) {
	return Math.max(0, Number(value) || 0).toFixed(6);
}

function createConcatList(segmentNames) {
	return segmentNames.map((name) => `file '${name}'`).join("\n");
}

async function cleanupFfmpegFiles(ffmpeg, fileNames) {
	await Promise.all(
		fileNames.map(async (fileName) => {
			try {
				await ffmpeg.deleteFile(fileName);
			} catch (error) {
				// Best effort cleanup; missing temp files are harmless.
			}
		})
	);
}

editVideoButton.addEventListener("click", async () => {
	if (!hasLoadedCurrentVideoPreview()) {
		showToast("Load preview first", "Load the local preview before editing.", "warning");
		return;
	}

	editVideoButton.disabled = true;
	resetEditProgress();
	statusElement.textContent = "Rendering locally in this browser. The source video is not uploaded.";

	try {
		await saveCutlist({ download: false });
		const data = await runClientSideEdit();
		updateEditProgress({ percent: 100, message: "Edit complete." });
		resetSegmentProgress();
		statusElement.textContent = `Edit complete: ${data.fileName}\n\nRendered locally with FFmpeg WebAssembly.`;
		showFinalVideo(data.outputUrl);
		downloadBlob(data.blob, data.fileName);
		showToast("Edit complete", data.fileName);
	} catch (error) {
		console.error("Error editing video: ", error);
		statusElement.textContent = error.message;
		showToast("Could not edit video", error.message, "error");
	} finally {
		editVideoButton.disabled = false;
	}
});

playbackRateSlider.addEventListener("input", () => {
	videoElement.playbackRate = Number(playbackRateSlider.value);
	updatePlaybackRateDisplay();
});

videoElement.addEventListener("ratechange", updatePlaybackRateDisplay);
videoElement.addEventListener("loadedmetadata", renderBlurMaskCanvas);
window.addEventListener("resize", renderBlurMaskCanvas);

function setActionControlsEnabled(enabled) {
	saveCutlistButton.disabled = !enabled;
	editVideoButton.disabled = !enabled;
	debugBlackCutsInput.disabled = !enabled;
}

function setTransportControlsEnabled(enabled) {
	[seekBackwardButton, seekForwardButton, toggleCutButton].forEach((button) => {
		button.disabled = !enabled;
	});
	playbackRateSlider.disabled = !enabled;
	frameStepSeekInput.disabled = !enabled;
	skipCutsPreviewInput.disabled = !enabled;
}

function updateCutCount(count) {
	cutCountElement.textContent = `${count} ${count === 1 ? "cut" : "cuts"}`;
}

function updatePlaybackRateDisplay() {
	playbackRateElement.textContent = `${videoElement.playbackRate.toFixed(1)}x`;
	playbackRateSlider.value = String(videoElement.playbackRate);
}

function updateLocalPreviewButton() {
	const isLocalSource = currentVideoSource && currentVideoSource.type === "local";
	const isLoading = isLocalSource && currentVideoSource.previewLoading;
	const isLoaded = isLocalSource && currentVideoSource.previewLoaded;
	const canLoad = canLoadSelectedLocalPreview();
	const label = isLoading
		? "Loading Preview..."
		: isLoaded
			? "Preview Loaded"
			: "Load Preview";

	if (loadLocalPreviewButton) {
		loadLocalPreviewButton.disabled = !canLoad;
		loadLocalPreviewButton.textContent = label;
	}

	if (loadLocalPreviewStageButton) {
		loadLocalPreviewStageButton.hidden = !isLocalSource || isLoaded;
		loadLocalPreviewStageButton.disabled = !canLoad;
		loadLocalPreviewStageButton.textContent = label === "Load Preview" ? "Load Selected Preview" : label;
	}
}

function getFileName(src) {
	const fileName = decodeURIComponent(src.split("/").pop() || src);
	return fileName.replace(/\.[^.]+$/, "");
}

function getPathFileName(src) {
	return decodeURIComponent(String(src || "").split("/").pop() || src || "video.mp4");
}
