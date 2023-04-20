const video = document.getElementById("video");
const timestamps = document.getElementById("timestamps");
const copyCutlistButton = document.getElementById("copy-cutlist");

let cutStart = null;
let cutList = [];

(async function () {
	const frameRateFraction = await getFrameRate();
	console.log("frame rate:", frameRateFraction);
	setupEventListeners(frameRateFraction);
})();

async function getFrameRate() {
	try {
		const response = await fetch("/get-frame-rate");
		const data = await response.json();
		return data.frameRate;
	} catch (error) {
		console.error("Error fetching frame rate:", error);
		return 30; // Default frame rate if fetching fails
	}
}

function setupEventListeners(frameRateFraction) {
	console.log("setupEventListeners frameRateFraction: ", frameRateFraction);
	document.addEventListener("keydown", (event) => {
		const key = event.key;

		if (key === "ArrowRight") {
			console.log("advance", frameRateFraction);
			event.preventDefault();
			event.stopPropagation();
			advanceFrame(1, frameRateFraction);
		} else if (key === "ArrowLeft") {
			event.preventDefault();
			event.stopPropagation();
			advanceFrame(-1, frameRateFraction);
		}
	});

	const currentTimeElement = document.getElementById("currentTime");
	const video = document.getElementById("video");
	const seekBackwardButton = document.getElementById("seekBackward");
	const seekForwardButton = document.getElementById("seekForward");
	const toggleCutButton = document.getElementById("toggleCut");
	const cutlistElement = document.getElementById("cutlist");

	const cutlist = [];
	let cutInProgress = null;

	seekBackwardButton.addEventListener("click", () => {
		console.log("back");
		advanceFrame(video, frameRateFraction, false);
	});

	seekForwardButton.addEventListener("click", () => {
		console.log("forward");
		advanceFrame(video, frameRateFraction, true);
	});

	toggleCutButton.addEventListener("click", () => {
		if (cutInProgress) {
			cutInProgress.end = video.currentTime.toFixed(3);
			cutlist.push(cutInProgress);
			cutInProgress = null;
			toggleCutButton.textContent = "Cut Start";
		} else {
			cutInProgress = { start: video.currentTime.toFixed(3) };
			toggleCutButton.textContent = "Cut End";
		}
		updateCutlistDisplay();
	});
	const updateCutlistDisplay = () => {
		cutlistElement.textContent = JSON.stringify(cutlist, null, 2);
	};
	video.addEventListener("timeupdate", () => {
		currentTimeElement.textContent = formatTime(video.currentTime);
	});
}

function advanceFrame(video, frameRateFraction, forward = true) {
	const [numerator, denominator] = frameRateFraction.split("/").map(Number);
	const frameRate = numerator / denominator;

	if (isFinite(frameRate)) {
		const frameDuration = 1 / frameRate;
		const timeChange = forward ? frameDuration : -frameDuration;
		console.log("currentTime", video.currentTime, "timeChange: ", timeChange);
		video.currentTime += timeChange;
	} else {
		console.error("Invalid frame rate:", frameRateFraction);
	}
}

const formatTime = (time) => {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);
	const milliseconds = Math.floor((time % 1) * 1000);

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
};

copyCutlistButton.addEventListener("click", () => {
	const cutListString = JSON.stringify(cutList, null, 2);
	navigator.clipboard.writeText(cutListString).then(
		() => {
			alert("Cutlist copied to clipboard");
		},
		(err) => {
			console.error("Error copying cutlist: ", err);
		}
	);
});
