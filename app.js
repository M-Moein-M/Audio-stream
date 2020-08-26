const express = require('express');
const search = require('youtube-search');
const fs = require('fs');
require('dotenv').config();
const stream = require('youtube-audio-stream');

const app = express();
app.use(express.static('public'));

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});


// loading audio to page.

app.get('/', function (req, res) {
    return fs.createReadStream('public/index.html').pipe(res);
});


app.get('/audio/:videoId', function (req, res) {
    const url = `https://www.youtube.com/watch?v=${req.params.videoId}` ;
    stream(url).pipe(res);
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


