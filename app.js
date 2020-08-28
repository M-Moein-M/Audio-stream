const express = require("express");
const search = require("youtube-search");
const fileSystem = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Datastore = require("nedb");
require("dotenv").config();

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const app = express();
app.use(express.static("public"));

const port = 3000;
app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

// creating downloader for downloading the audio file
const audioPath = path.join(__dirname, "database"); // the folder to store the mp3 files
const YD = new YoutubeMp3Downloader({
  //Configure YoutubeMp3Downloader with your settings
  ffmpegPath: path.join(__dirname, "ffmpeg"), // Where is the FFmpeg binary located? I moved it to the current directory
  outputPath: audioPath, // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: "highest", // What video quality should be used?
  queueParallelism: 2, // How many parallel downloads/encodes should be started?
  progressTimeout: 2000, // How long should be the interval of the progress reports
});

app.get("/audio/:videoId", function (req, res) {
  //Download video and save as MP3 file
  const videoID = req.params.videoId;
  console.log(videoID);
  YD.download(videoID, `${videoID}.mp3`);

  YD.on("finished", function (err, data) {
    console.log("download finished");
    console.log(JSON.stringify(data));

    // stream the audio
    const filePath = path.join(__dirname, "database", `${videoID}.mp3`);
    const stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
      "Content-Type": "audio/mp3",
      "Content-Length": stat.size,
    });

    const readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  });

  YD.on("error", function (error) {
    console.log(error);
  });
});

// database managment

const database = new Datastore({
  filename: path.join(__dirname, "database", "database.db"),
});

// loading database
database.loadDatabase((err) => {
  if (!err) console.log("Database loaded");
  else console.log(err);
});

const fs = require("fs");
loadDatabase();

// inserts information about downloaded mp3 tracks to the database
function loadDatabase() {
  const databaseDir = path.join(__dirname, "database"); // where all mp3 files are stored

  fs.readdir(databaseDir, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    // get the title of each audio to save it in data base
    for (let i = 0; i < files.length; i++) {
      if (files[i].includes(".mp3")) {
        // if the file is mp3 file
        const videoID = files[i].replace(".mp3", "");
        getVideoTitle(videoID, (title) => {
          console.log(videoID, "====>", title);
        });
      }
    }
  });
}

// getVideoTitle("akvGANKiiY8");

async function getVideoTitle(videoID, callBackFunc) {
  // returns details of the input video
  const requestURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${process.env.APP_KEY}`;
  const response = await fetch(requestURL);
  const data = await response.json();
  const detail = data.items[0].snippet.localized.title;
  callBackFunc(detail);
}

// searching

app.get("/search/:searchPhrase", function (req, res) {
  const opts = {
    maxResults: 7,
    key: process.env.APP_KEY,
  };
  const term = req.params.searchPhrase;
  search(term, opts, (err, results) => {
    if (err) return console.log(err);
    res.send(results);
  });
});
