const express = require('express');
const fs = require('fs');
const stream = require('youtube-audio-stream')

const app = express();
app.use(express.static('public'));

const port = 3000;
app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});


const url = 'https://www.youtube.com/watch?v=SsUjydIX2IA'

app.get('/', function (req, res) {
    return fs.createReadStream('public/index.html').pipe(res);
});

app.get('/audio', function (rq, res) {
    stream(url).pipe(res);
})
