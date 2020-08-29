const player = new window.Audio();
function addAudioPlayer() {
  const videoId = String(this.id).replace("@playlist", "");
  console.log(videoId);
  player.src = `/audio/${videoId}`;
  player;
  player.preload = "metadata";
  player.play();
  player.controls = true;
  player.id = "player";
  document.getElementById("player-div").appendChild(player);
}

document.getElementById("search").addEventListener("click", async function () {
  const res = await fetch(
    `/search/${document.getElementById("search-input").value}`
  );
  const data = await res.json();
  console.log(data);
  presentData(data);
});

function presentData(data) {
  const searchResultsDiv = document.getElementById("search-results");
  while (
    searchResultsDiv.childElementCount > 0 // clears the previous results before showing the current results
  )
    searchResultsDiv.firstChild.remove();

  for (let i = 0; i < data.length; i++) {
    const newResult = document.createElement("div");
    newResult.classList.add("search-result-div");

    const title = document.createElement("p");
    title.innerText = (i + 1).toString() + ". " + data[i].title;
    title.classList.add("search-result-paragraph");

    const playBtn = document.createElement("button");
    playBtn.id = data[i].id;
    playBtn.classList.add("search-play-btn");
    playBtn.innerText = "";

    title.append(playBtn);
    newResult.append(title);
    searchResultsDiv.append(newResult);
  }
  for (let btn of document.getElementsByClassName("search-play-btn")) {
    document.getElementById(btn.id).addEventListener("click", addAudioPlayer);
  }
}

document.getElementById("show-playlist").addEventListener("click", function () {
  togglePlaylist();
});

function togglePlaylist() {
  document.getElementById("search-results").classList.toggle("hide");
  document.getElementById("playlist").classList.toggle("hide");
  document.getElementById("search").classList.toggle("hide");
  document.getElementById("show-playlist").innerText = "Show playlist";

  if (!document.getElementById("playlist").classList.contains("hide")) {
    document.getElementById("show-playlist").innerText = "Hide playlist"; // changes the inner text of show playlist btn to make more sence for user to hide and show playlist
    loadPlaylist();
  }
}
async function loadPlaylist() {
  const getPlaylistURL = "/playlist/get";
  const res = await fetch(getPlaylistURL);
  const data = await res.json();
  console.log(data);
  presentPlaylist(data.userPlaylist);
}

function presentPlaylist(data) {
  console.log("blah", data);
  const playlistDiv = document.getElementById("playlist");
  while (
    playlistDiv.childElementCount > 0 // clears the playlist
  )
    playlistDiv.firstChild.remove();

  // adding elements to the DOM
  for (let i = 0; i < data.length; i++) {
    const newResult = document.createElement("div");
    newResult.classList.add("playlist-div");

    const title = document.createElement("p");
    title.innerText = (i + 1).toString() + ". " + data[i].videoTitle;
    title.classList.add("playlist-paragraph");

    const playBtn = document.createElement("button");
    playBtn.id = data[i].videoID + "@playlist"; // determines that this play btn is for playlist(not to be confused with search play btn)
    playBtn.classList.add("playlist-play-btn");
    playBtn.innerText = "";

    title.append(playBtn);
    newResult.append(title);
    playlistDiv.append(newResult);
    console.log("appended");
  }
  for (let btn of document.getElementsByClassName("playlist-play-btn")) {
    document.getElementById(btn.id).addEventListener("click", addAudioPlayer);
  }
}
