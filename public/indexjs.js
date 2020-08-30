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

// presenting the search results on the DOM
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
    playBtn.addEventListener("click", addAudioPlayer);
    
    const addToPlaylistBtn = document.createElement("button");
    addToPlaylistBtn.id = data[i].id+'@addAudio';
    addToPlaylistBtn.classList.add("addto-playlist-btn");
    addToPlaylistBtn.addEventListener("click", addAudioToPlaylist);

    title.append(playBtn, addToPlaylistBtn);
    newResult.append(title);
    searchResultsDiv.append(newResult);
  }
  
}

// sends request to add the audio to playlist
async function addAudioToPlaylist(){
  const videoId = this.id.toString().replace('@addAudio','');
  const addAudioRequestURL = `/playlist/add`;

  const res = await fetch(addAudioRequestURL, {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({videoId})
  })
  const data = await res.text();
  console.log(data);
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
  console.log(data);
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
    playBtn.addEventListener("click", addAudioPlayer);
    
    const removeBtn = document.createElement("button");
    removeBtn.id = data[i].videoID + "@remove-playlist"; // determines that this play btn is for playlist(not to be confused with search play btn)
    removeBtn.classList.add("removefrom-playlist-btn");
    removeBtn.addEventListener('click', removeAudioFromPlaylist);

    title.append(playBtn, removeBtn);
    newResult.append(title);
    playlistDiv.append(newResult);
  }

  async function removeAudioFromPlaylist(){
    const videoID = this.id.toString().replace('@remove-playlist', '');
    const deleteRequestURL = `/playlist/delete/${videoID}`;
    const res = await fetch(deleteRequestURL, {method:'DELETE'});
    const data = await res.text();
    loadPlaylist();
    console.log(data);
  }

}
