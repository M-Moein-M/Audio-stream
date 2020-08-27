const express = require('express');
const search = require('youtube-search');
const fileSystem = require('fs');
require('dotenv').config();

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const app = express();
app.use(express.static('public'));

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});


app.get('/audio/:videoId', function (req, res) {
    const audioPath = '/home/moein/web Development/Nodejs/Audio-stream/database';   // this will cause problem after uploading the file to actual server
    //Configure YoutubeMp3Downloader with your settings
    const YD = new YoutubeMp3Downloader({
        "ffmpegPath": "/usr/bin/ffmpeg",        // Where is the FFmpeg binary located?
        "outputPath": audioPath,    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });

    //Download video and save as MP3 file
    const videoID = req.params.videoId;
    console.log(videoID);
    YD.download(videoID, `${videoID}.mp3`);

    YD.on("finished", function (err, data) {
        console.log('download finished');
        console.log(JSON.stringify(data));

        // stream the audio
        const filePath = `database/${videoID}.mp3`;
        const stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'audio/mp3',
            'Content-Length': stat.size
        });

        const readStream = fileSystem.createReadStream(filePath);
        // We replaced all the event handlers with a simple call to readStream.pipe()
        readStream.pipe(res);
    });

    YD.on("error", function (error) {
        console.log(error);
    });

})


// searching

app.get('/search/:searchPhrase', function (req, res) {
    const opts = {
        maxResults: 7,
        key: process.env.APP_KEY
    };
    const term = req.params.searchPhrase;
    search(term, opts, (err, results) => {
        if (err) return console.log(err);
        res.send(results);
    });

});


