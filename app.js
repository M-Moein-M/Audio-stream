const express = require("express");
const search = require("youtube-search");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const Datastore = require("nedb");
require("dotenv").config();

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const app = express();
app.use(express.static("public"));

app.use(express.json());

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

// streams the requested audio
app.get("/audio/:videoId", function (req, res) {
  try {
    const videoID = req.params.videoId;
    // if the requested file doesn't exist in database the app will download it
    // if the video doesnt exists in database then inserts it
    database.find({ videoID: videoID }, (err, docs) => {
      if (docs.length === 0) {
        //Download video and save as MP3 file
        console.log(`Downloading ${videoID}...`);
        YD.download(videoID, `${videoID}.mp3`);

        YD.on("finished", function (err, data) {
          console.log(`Finished downloading${videoID}`);

          insertVideo(videoID); // inserts the new downloaded video to database
          streamAudio(videoID, res);
        });

        YD.on("error", function (error) {
          console.log(error);
        });
      } else {
        streamAudio(videoID, res);
      }
    });
  } catch (error) {
    console.log("@@@Error in get request /audio/videoId: ", error);
  }
});

function streamAudio(videoID, res) {
  // stream the audio
  const filePath = path.join(__dirname, "database", `${videoID}.mp3`);
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    "Content-Type": "audio/mp3",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
}

// database managment
const database = new Datastore({
  filename: path.join(__dirname, "database", "database.db"),
});

// loading database
database.loadDatabase((err) => {
  if (!err) {
    console.log("Database loaded");
    initDatabase();
  } else {
    console.log(err);
  }
});

// inserts information about downloaded mp3 tracks to the database
function initDatabase() {
  const databaseDir = path.join(__dirname, "database"); // where all mp3 files are stored

  fs.readdir(databaseDir, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    // get the title of each audio to save it in data base
    for (let i = 0; i < files.length; i++) {
      // if the file is mp3 file

      if (files[i].includes(".mp3")) {
        const videoID = files[i].replace(".mp3", "");
        console.log(`Added ${videoID}.mp3 to the databse`);
        insertVideo(videoID);
      }
    }
  });
}

//inserts the video information to database
function insertVideo(videoID, addToPlaylist = false) {
  getVideoTitle(videoID, (title) => {
    // if the video doesnt exists in database then inserts it
    database.find({ videoID: videoID }, (err, docs) => {
      if (docs.length === 0) {
        const videoData = {
          videoID: videoID,
          videoTitle: title,
          playlist: addToPlaylist,
        };
        database.insert(videoData);
      }else if (addToPlaylist){ // if the audio exists we add it to play list
        database.update({videoID:videoID},{ $set: { playlist:true } },{},(err, numReplaced)=>{
          if (err) throw err;
        });
      }
    });
  });
}

async function getVideoTitle(videoID, callBackFunc) {
  try {
    // returns details of the input video
    const requestURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${process.env.APP_KEY}`;
    const response = await fetch(requestURL);
    const data = await response.json();
    const detail = data.items[0].snippet.localized.title;
    callBackFunc(detail);
  } catch (error) {
    console.log("@@@Error in getVideoTitle function: ", error);
  }
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

// managing playlist
// playlist attribute in database shows whether the mp3 file is on user's playlist or not
app.get("/playlist/get", function (req, res) {
  database.find({ playlist: true }, (err, docs) => {
    if (err) throw err;
    res.json({ userPlaylist: docs });
  });
});


// request to add audio to play list
app.post('/playlist/add', (req, res)=>{
  
  const videoID = req.body.videoId;
  console.log(videoID, 'added to play list');
  
  const YD = new YoutubeMp3Downloader({
    //Configure YoutubeMp3Downloader with your settings
    ffmpegPath: path.join(__dirname, "ffmpeg"), // Where is the FFmpeg binary located? I moved it to the current directory
    outputPath: audioPath, // Where should the downloaded and encoded files be stored?
    youtubeVideoQuality: "highest", // What video quality should be used?
    queueParallelism: 2, // How many parallel downloads/encodes should be started?
    progressTimeout: 2000, // How long should be the interval of the progress reports
  });

  database.find({ videoID: videoID }, (err, docs) => {
    if (docs.length === 0) {  // if the added audio file doesn't exist in database then download it
      //Download video and save as MP3 file
      console.log(`Downloading ${videoID}...`);
      YD.download(videoID, `${videoID}.mp3`);

      YD.on("finished", function (err, data) {
        console.log(`Finished downloading${videoID}`);
        insertVideo(videoID, true); // inserts the new downloaded video to database
        res.end('success');
      });

      YD.on("error", function (error) {
        res.end('ERROR');
        console.log(error);
      });
    } else {
      insertVideo(req.body.videoId, true);
      res.end('success');
    }
  });  
});
