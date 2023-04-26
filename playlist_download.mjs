import { exec, execFile } from "child_process";
import util from "util";
import fs from "fs";
import path from "path";
import axios from "axios";
const execPromisified = util.promisify(exec);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
import { pipeline } from "stream/promises";
import fetch from "node-fetch";

const playlistUrl = process.argv[2];
const folderName = process.argv[3];
const cookiesFilePath = "cookies.txt";

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
	outputDir = `/volume1/McCullohShare/Plex/TV/${folderName ? folderName : playlistId}`;
} else if (playlistUrl.includes("videos")) {
	let channelName;

	try {
		({ stdout: channelName } = await execPromisified(
			`yt-dlp --cookies ${cookiesFilePath} --get-filename --no-playlist --output "%(uploader)s" "${playlistUrl}"`
		));
		channelName = channelName.trim().split("\n")[0];
		console.log("channelName", channelName);
	} catch (error) {
		console.error(`Error getting channel name: ${error}`);
		process.exit(1);
	}

	downloadedVideosFile = `downloads/downloaded_videos_${channelName}.json`;
	outputDir = `/volume1/McCullohShare/Plex/TV/${folderName ? folderName : channelName}`;
} else {
	console.error("Invalid URL format. Please provide a playlist or videos URL.");
	process.exit(1);
}

console.log("comparing with previous downloads in: ", downloadedVideosFile);

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

async function downloadThumbnail(thumbnailUrl, outputPath) {
	try {
		console.log();
		console.log("Downloading thumbnail...", thumbnailUrl, outputPath);

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

		console.log();
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

			console.log(); // Print a newline after the progress bar

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
			reject(error);
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

async function getVideoInfo(videoId) {
	const { stdout: jsonOutput } = await execPromisified(
		`yt-dlp --cookies ${cookiesFilePath} -j https://www.youtube.com/watch?v=${videoId}`,
		{ maxBuffer: 10 * 1024 * 1024 }
	);

	return JSON.parse(jsonOutput);
}

(async () => {
	try {
		const { stdout: ids } = await execPromisified(
			`yt-dlp -i -f best --cookies ${cookiesFilePath} --get-id ${playlistUrl}`
		);

		let downloadedData = [];
		if (fs.existsSync(downloadedVideosFile)) {
			const content = await readFile(downloadedVideosFile, "utf-8");
			downloadedData = JSON.parse(content);
		}

		const videoIds = ids
			.split("\n")
			.filter((id) => id && !downloadedData.some((entry) => entry.id === id));

		if (playlistUrl.includes("videos")) {
			videoIds.reverse();
		}
		let seasonCounter;
		let episodeCounter;
		let lastyear;

		if (downloadedData.length > 0) {
			const lastEntry = downloadedData[downloadedData.length - 1];
			const lastEntryInfo = await getVideoInfo(lastEntry.id);
			const lastEntryUploadDate = lastEntryInfo.upload_date;
			lastyear = parseInt(lastEntryUploadDate.slice(0, 4), 10);
			seasonCounter = lastEntry.season;
			episodeCounter = lastEntry.episode + 1;
		} else {
			console.log(`Getting info for videoId: ${videoIds[0]}`, videoIds.join(", "));
			const firstVideoInfo = await getVideoInfo(videoIds[0]);
			const firstVideoUploadDate = firstVideoInfo.upload_date;
			lastyear = parseInt(firstVideoUploadDate.slice(0, 4), 10);
			seasonCounter = 1;
			episodeCounter = 1;
		}

		for (const videoId of videoIds) {
			console.log(`Getting info for videoId: ${videoId}`);
			const { stdout: videoUrl } = await execPromisified(
				`yt-dlp -i -f best --cookies ${cookiesFilePath} --get-url https://www.youtube.com/watch?v=${videoId}`,
				{ maxBuffer: 10 * 1024 * 1024 }
			);

			const videoInfo = await getVideoInfo(videoId);
			videoInfo.url = videoUrl;
			const title = videoInfo.title;
			const videoUploadDate = videoInfo.upload_date;

			const currentYear = parseInt(videoUploadDate.slice(0, 4), 10);
			if (currentYear > lastyear) {
				seasonCounter = seasonCounter += 1;
				episodeCounter = 1;
				lastyear = currentYear;
			}

			const fileName = `${outputDir}/S${seasonCounter
				.toString()
				.padStart(2, "0")}E${episodeCounter.toString().padStart(2, "0")}-${title.replace(
				/[\/:*?"<>|]/g,
				"_"
			)}.mp4`;

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
		console.error(`Error: ${error}`);
	}
})();
