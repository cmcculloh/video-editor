const express = require("express");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/get-frame-rate", async (req, res) => {
	try {
		const frameRate = await getFrameRate("./public/spiderman.mp4");
		res.json({ frameRate });
	} catch (error) {
		console.error("Error fetching frame rate:", error);
		res.status(500).json({ error: "Failed to fetch frame rate" });
	}
});

app.listen(3000, () => {
	console.log("Server listening on port 3000");
});

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
