# Audio-stream
A Youtube audio stream using nodejs

Major node packages: 
1) https://www.npmjs.com/package/youtube-search For searching the youtube and showing the results on the page
2) https://www.npmjs.com/package/youtube-mp3-downloader For downloading the audio files to the database and then stream it to the client with 'file system' Readable stream.

For this application first you need your google API key associated with your account to be abable to use the Youtube API services. There's tons of guides on how to get your API key.
After that in order to let the application to use it you should create a file named ".env" and put your API key like this: APP_KEY=YOUR_API_KEY. Check the .env_sample file. The .env file is used by 'dotenv' package to load environment variables.

For 'ffmpeg' file you need to install the ffmpeg on your system. After that you can go to the installation location or in Linux use command 'whereis ffmpeg' to find the location of ffmpeg binary file. You need to copy that beside the app.js file beacuse the application uses the binary(.exe file) of ffmpeg.

If during the running of application you had some server error, that might be beacause of the internet connection to the Youtube server due to some filtering in some countries.

Soon there will be more details here about the project.
