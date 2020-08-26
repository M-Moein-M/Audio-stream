const express = require('express');
// const yas = require('youtube-audio-server');

// hiding api key while sharing on github :P
// require('dotenv').config();
// const APP_KEY = process.env.APP_KEY;
// yas.setKey(APP_KEY);

const app = express();
app.use(express.static('public'));

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});


const stream = require('youtube-audio-stream')
const url = 'http://youtube.com/watch?v=34aQNMvGEZQ'
const decoder = require('lame').Decoder
const Speaker = require('speaker')
const speaker = new Speaker({
    channels: 2,          // 2 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 44100     // 44,100 Hz sample rate
});

const data = stream(url).pipe(decoder());
data.pipe(speaker);