// node playlist_download.mjs "https://youtube.com/playlist?list=PLFm1tTY1NA4coPMrYuttluRQ1yzVO8gqp" "MumboJumbo/Season-8" --no-episode
// node playlist_download.mjs "https://www.youtube.com/@postmodernjukebox/videos" "PostmodernJukebox"
// node playlist_download.mjs "https://www.youtube.com/playlist?list=PLeNLZ73biGeuPLmw2BtvPysAZ9PEHOo3e" become-elite

import { exec, execFile } from "child_process";
import util from "util";
import fs from "fs";
import path from "path";
import axios from "axios";
// const execPromisified = util.promisify(exec);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
import { pipeline } from "stream/promises";
import fetch from "node-fetch";

const execPromisified = (command) => {
	return new Promise((resolve) => {
		exec(command, (error, stdout, stderr) => {
			resolve({ error, stdout, stderr });
		});
	});
};

const playlistUrl = process.argv[2];
const folderName = process.argv[3];
const flag = process.argv[4];
const cookiesFilePath = "cookies.txt";
// Change this to fit your environment
const defaultRoot = "/volume1/McCullohShare/Plex/TV/";

if (!fs.existsSync("downloads")) {
	fs.mkdirSync("downloads");
}

const execFilePromisified = (command, args, options = {}) => {
	return new Promise((resolve, reject) => {
		execFile(command, args, options, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve({ stdout, stderr });
			}
		});
	});
};

let downloadedVideosFile;
let outputDir;

if (playlistUrl.includes("playlist")) {
	const playlistId = new URL(playlistUrl).searchParams.get("list");
	downloadedVideosFile = `downloads/downloaded_videos_${playlistId}.json`;
	outputDir = `${defaultRoot}${folderName ? folderName : playlistId}`;
} else if (playlistUrl.includes("videos") || playlistUrl.includes("shorts")) {
	let channelName;

	try {
		const ytdlcommand = `yt-dlp -i --cookies ${cookiesFilePath} --get-filename --no-playlist --playlist-items 1 --output "%(uploader)s" "${playlistUrl}"`;
		console.log("about to run command", ytdlcommand);
		const { stdout: channelNames } = await execPromisified(ytdlcommand);
		console.log("found channel names", channelNames);
		channelName = channelNames.trim().split("\n")[0];
		console.log("channelName", channelName);
	} catch (error) {
		console.error(`Error getting channel name: ${error}`);
		process.exit(1);
	}

	downloadedVideosFile = `downloads/downloaded_videos_${channelName}.json`;
	outputDir = `${defaultRoot}${folderName ? folderName : channelName}`;
} else {
	console.error("Invalid URL format. Please provide a playlist or videos URL.");
	process.exit(1);
}

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

console.log("comparing with previous downloads in: ", downloadedVideosFile);

async function downloadThumbnail(thumbnailUrl, outputPath) {
	try {
		console.log();

		const response = await axios({
			method: "GET",
			url: thumbnailUrl,
			responseType: "stream",
		});

		const writer = fs.createWriteStream(outputPath);
		response.data.pipe(writer);

		await new Promise((resolve, reject) => {
			writer.on("finish", resolve);
			writer.on("error", reject);
		});

		console.log("Thumbnail downloaded:", outputPath);
	} catch (error) {
		console.error("Error downloading thumbnail:", error.message);
	}
}

async function downloadVideo(videoInfo, filename) {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(videoInfo.url);
			const totalBytes = parseInt(response.headers.get("content-length"), 10);
			let downloadedBytes = 0;

			const progressBarLength = 30;

			const updateProgressBar = () => {
				const progressPercentage = (downloadedBytes / totalBytes) * 100;
				const progressBarFilled = Math.floor(
					progressPercentage / (100 / progressBarLength)
				);
				const progressBarEmpty = progressBarLength - progressBarFilled;
				const progressBar = `[${"=".repeat(progressBarFilled)}${" ".repeat(
					progressBarEmpty
				)}]`;

				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write(
					`Downloading: ${progressBar} ${Math.floor(progressPercentage)}%`
				);
			};

			const tempFilename = `${filename}.temp`;
			const fileStream = fs.createWriteStream(tempFilename);
			response.body.on("data", (chunk) => {
				downloadedBytes += chunk.length;
				updateProgressBar();
			});

			await pipeline(response.body, fileStream);

			const thumbnailFilename = `${path.basename(filename, ".mp4")}.jpg`;
			const thumbnailOutputPath = path.join(outputDir, thumbnailFilename);
			await downloadThumbnail(videoInfo.thumbnail, thumbnailOutputPath);

			console.log("adding metadata");
			const metadataArgs = [
				"-i",
				tempFilename,
				"-c",
				"copy",
				"-metadata",
				`title=${videoInfo.title}`,
				"-metadata",
				`year=${videoInfo.year}`,
				filename,
			];
			await execFilePromisified("ffmpeg", metadataArgs);

			fs.unlinkSync(tempFilename);

			resolve();
		} catch (error) {
			fs.unlink(filename, () => {});
			console.log(`error downloading ${videoInfo.title}: ${error}`);
			resolve();
		}
	});
}

const getPlaylistInfo = async (url) => {
	try {
		const { stdout: jsonInfo } = await execFilePromisified(
			"yt-dlp",
			["--cookies", cookiesFilePath, "--skip-download", "--print-json", url],
			{ maxBuffer: 10 * 1024 * 1024 }
		);

		const jsonObjects = jsonInfo.split("\n").filter((obj) => obj.trim() !== "");
		let playlistInfo = null;

		for (const jsonObject of jsonObjects) {
			try {
				const parsedInfo = JSON.parse(jsonObject);

				playlistInfo = {
					id: parsedInfo.playlist_id || parsedInfo.channel_id,
					title: parsedInfo.playlist_title || parsedInfo.channel,
					description: parsedInfo.playlist_description || parsedInfo.channel_description,
				};

				if (playlistInfo.id && playlistInfo.title) {
					break;
				}
			} catch (error) {
				console.error(`Error parsing JSON object: ${error}`);
			}
		}

		if (!playlistInfo || !playlistInfo.id || !playlistInfo.title) {
			throw new Error("Unable to get playlist or channel information");
		}

		return playlistInfo;
	} catch (error) {
		console.error(`Error getting playlist info: ${error}`);
		return null;
	}
};

const fetchVideoInfo = async (videoId) => {
	const { stdout: jsonOutput } = await execPromisified(
		`yt-dlp --cookies ${cookiesFilePath} -j https://www.youtube.com/watch?v=${videoId}`,
		{ maxBuffer: 10 * 1024 * 1024 }
	);

	return JSON.parse(jsonOutput);
};

// videoIds could actually be just an array of video ids, or an array of objects with video ids and season/episode numbers
const getVideoInfo = async (videoIds) => {
	const video = videoIds[0];
	const videoInfo = await fetchVideoInfo(video.id || video);
	const videoUploadDate = videoInfo.upload_date;
	const lastyear = parseInt(videoUploadDate.slice(0, 4), 10);
	const seasonCounter = video.season || 1;
	const episodeCounter = video.episode + 1 || 1;

	return { lastyear, episodeCounter, seasonCounter };
};

(async () => {
	try {
		console.log("starting");

		const ytdlCommand = `yt-dlp -i -f best --cookies ${cookiesFilePath} --get-id ${playlistUrl}`;
		console.log("running", ytdlCommand);
		const {
			error: ytDlpError,
			stdout: ids,
			stderr: errors,
		} = await execPromisified(ytdlCommand);

		console.log(`got ${ids.split("\n").length} ids`);

		// if (ytDlpError) {
		// 	console.warn("yt-dlp error:", ytDlpError);
		// }

		let downloadedData = [];
		if (fs.existsSync(downloadedVideosFile)) {
			const content = await readFile(downloadedVideosFile, "utf-8");
			downloadedData = JSON.parse(content);
		}

		const videoIds = ids
			.split("\n")
			.filter(
				(id) =>
					id &&
					!id.startsWith("ERROR:") &&
					!downloadedData.some((entry) => entry.id === id)
			);

		console.log("videoIds", videoIds);
		if (videoIds.length === 0) {
			console.log("No new videos to download");
			return;
		}

		if (playlistUrl.includes("videos")) {
			videoIds.reverse();
		}

		let { lastyear, episodeCounter, seasonCounter } = await getVideoInfo(
			downloadedData.lengh > 0 ? downloadedData.toReversed() : videoIds
		);

		for (const videoId of videoIds) {
			const ytdlpcommand = `yt-dlp -i -f best --cookies ${cookiesFilePath} --get-url https://www.youtube.com/watch?v=${videoId}`;
			console.log();
			console.log(`Getting info for videoId: ${videoId} with command: ${ytdlpcommand}`);
			const { stdout: videoUrl } = await execPromisified(ytdlpcommand, {
				maxBuffer: 10 * 1024 * 1024,
			});

			const videoInfo = await fetchVideoInfo(videoId);
			videoInfo.url = videoUrl;
			const title = videoInfo.title;
			const videoUploadDate = videoInfo.upload_date;

			const currentYear = parseInt(videoUploadDate.slice(0, 4), 10);
			if (currentYear > lastyear) {
				seasonCounter = seasonCounter += 1;
				episodeCounter = 1;
				lastyear = currentYear;
			}

			const season =
				flag === "--no-season" ? "" : `S${seasonCounter.toString().padStart(2, "0")}`;
			const episode =
				flag === "--no-episode"
					? ""
					: `${season}E${episodeCounter.toString().padStart(2, "0")}-`;

			const fileName = `${outputDir}/${episode}${title.replace(/[\/:*?"<>|]/g, "_")}.mp4`;

			console.log(`Downloading video: ${title}`);
			await downloadVideo(videoInfo, fileName);
			console.log(`Downloaded video: ${title}`);

			// Append downloaded video data to the file
			downloadedData.push({
				id: videoId,
				season: seasonCounter,
				episode: episodeCounter,
				url: videoUrl.trim(),
			});
			await writeFile(downloadedVideosFile, JSON.stringify(downloadedData, null, 2));

			episodeCounter++;
		}
	} catch (error) {
		console.error(`Error in main loop: ${error}`);
	}
})();
