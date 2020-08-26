const express = require('express');
const yas = require('youtube-audio-server');

// hiding api key while sharing on github :P
require('dotenv').config();
const APP_KEY = process.env.APP_KEY.toString();
yas.setKey(APP_KEY);

const app = express();
app.use(express.static('public'));

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});


const id = 'HQmmM_qwG4k'; // "Whole Lotta Love" by Led Zeppelin.
const file = 'whole-lotta-love.mp3';
console.log(`Downloading ${id} into ${file}...`);
yas.downloader
    .onSuccess(({id, file}) => {
        console.log(`Yay! Audio (${id}) downloaded successfully into "${file}"!`)
    })
    .onError(({id, file, error}) => {
        console.error(`Sorry, an error ocurred when trying to download ${id}`, error)
    })
    .download({id, file})
