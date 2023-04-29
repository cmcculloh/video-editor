import express from "express";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";

import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();

app.use(express.json());

app.post("/create-video", async (req, res) => {
	try {
		const { youtubeUrl, audioUrl, localMp4Path, outputPath } = req.body;

		if (!youtubeUrl || (!audioUrl && !localMp4Path) || !outputPath) {
			return res.status(400).json({ error: "Missing required fields" });
		}

        console.log(youtubeUrl, audioUrl, localMp4Path, outputPath);

		const youtubeAudioStream = ytdl(youtubeUrl, {
			filter: "audioonly",
			quality: "highestaudio",
		});
		const inputAudioStream = audioUrl
			? ytdl(audioUrl, { filter: "audioonly", quality: "highestaudio" })
			: fs.createReadStream(localMp4Path);

        const youtubeVideoStream = ytdl(youtubeUrl, {
			filter: "videoandaudio",
			quality: "highest",
		});



		if (!youtubeVideoStream) {
			return res.status(400).json({ error: "No suitable video format found" });
		}

        // save Video stream to file with ffmpeg
        const ytvscommand = ffmpeg(youtubeVideoStream)
            .output(path.resolve("vs.mp4"))
            .on("end", () => {
                console.log("Video stream saved successfully");
                		// const command = ffmpeg()
						// 	.input(path.resolve("vs.mp4"))
						// 	.inputOptions(["-r 30"])
						// 	.input(inputAudioStream)
						// 	.inputOptions(["-vn"])
						// 	.complexFilter(
						// 		[
						// 			"[0:v]scale=-1:360[top]",
						// 			"[1:v]scale=-1:360[bottom]",
						// 			"[top][bottom]vstack[outv]",
						// 			"[2:a]atrim=0:900[a1]",
						// 			"[3:a]atrim=0:900[a2]",
						// 			"[a1][a2]amix[outa]",
						// 		],
						// 		["outv", "outa"]
						// 	)
						// 	.outputOptions(["-map [outv]", "-map [outa]", "-shortest"])
						// 	.output(path.resolve(outputPath))
						// 	.on("end", () => {
						// 		res.status(200).json({ success: "Video created successfully" });
						// 	})
						// 	.on("error", (err) => {
						// 		console.error(err);
						// 		res.status(500).json({ error: "Video creation failed" });
						// 	});

						// command.run();
            })

        ytvscommand.run();



	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred" });
	}
});

const port = process.env.PORT || 3000;

const startServer = async () => {
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
};

startServer();
