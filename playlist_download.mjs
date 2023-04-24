import { exec } from "child_process";
import util from "util";
import fs from "fs";
import https from "https";
const execPromisified = util.promisify(exec);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
import { pipeline } from "stream/promises";
import stream from "stream";
import fetch from "node-fetch";

const playlistUrl = process.argv[2];
const cookiesFilePath = "cookies.txt";

if (!fs.existsSync("downloads")) {
	fs.mkdirSync("downloads");
}

let downloadedVideosFile;
let outputDir;

if (playlistUrl.includes("playlist")) {
	const playlistId = new URL(playlistUrl).searchParams.get("list");
	downloadedVideosFile = `downloads/downloaded_videos_${playlistId}.json`;
	outputDir = `/Volumes/McCullohShare/Plex/TV/${playlistId}`;
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
	outputDir = `/Volumes/McCullohShare/Plex/TV/${channelName}`;
} else {
	console.error("Invalid URL format. Please provide a playlist or videos URL.");
	process.exit(1);
}

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

async function downloadVideo(url, filename) {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(url);
			const fileStream = fs.createWriteStream(filename);
			await pipeline(response.body, fileStream);
			resolve();
		} catch (error) {
			fs.unlink(filename, () => {});
			reject(error);
		}
	});
}
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
		console.log(`Getting info for videoId: ${videoIds[0]}`, videoIds.join(", "));
		const firstVideoInfo = await getVideoInfo(videoIds[0]);
		const firstVideoUploadDate = firstVideoInfo.upload_date;

		let seasonCounter;
		let episodeCounter;

		if (downloadedData.length > 0) {
			const lastEntry = downloadedData[downloadedData.length - 1];
			seasonCounter = lastEntry.season;
			episodeCounter = lastEntry.episode + 1;
		} else {
			const firstYear = parseInt(firstVideoUploadDate.slice(0, 4), 10);
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
			const title = videoInfo.title;
			const videoUploadDate = videoInfo.upload_date;

			const currentYear = parseInt(videoUploadDate.slice(0, 4), 10);
			const firstYear = parseInt(firstVideoUploadDate.slice(0, 4), 10);
			const seasonCounter = currentYear - firstYear + 1;

			const fileName = `${outputDir}/S${seasonCounter
				.toString()
				.padStart(2, "0")}E${episodeCounter.toString().padStart(2, "0")}-${title.replace(
				/[\/:*?"<>|]/g,
				"_"
			)}.mp4`;

			console.log(`Downloading video: ${title}`);
			await downloadVideo(videoUrl.trim(), fileName);
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

