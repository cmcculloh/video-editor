const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const youtubeDl = require("youtube-dl-exec");

const videoUrl = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";
const outputPath = path.join(__dirname, "video.mp4");

(async () => {
	try {
		// Fetch video info
		const info = await youtubeDl(videoUrl, {
			dumpSingleJson: true,
			noWarnings: true,
			noCallHome: true,
			noCheckCertificate: true,
			preferFreeFormats: true,
			youtubeSkipDashManifest: true,
		});

		// Get the best quality video format available
		const videoFormat = info.formats.sort((a, b) => b.height - a.height)[0];

		// Download the video
		const videoStream = youtubeDl.raw(videoUrl, {
			format: videoFormat.format_id,
		});

		videoStream.pipe(fs.createWriteStream(outputPath));

		videoStream.on("end", () => {
			console.log("Video download completed");
		});
	} catch (error) {
		console.error("Error downloading video:", error);
	}
})();
