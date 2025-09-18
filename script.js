let audio = null;
let isPlaying = false;
let songs = [];
let songTitles = [];
let currentSongIndex = 0;

let seekbar = null;
let circle = null;

// Format seconds into mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get songs from HTML instead of API
function getSongsFromHTML() {
    let songCards = document.querySelectorAll(".s1");
    let songList = [];
    let titleList = [];

    songCards.forEach(card => {
        let songLink = card.querySelector("a[href$='.mp3']");
        let songTitleDiv = card.querySelector(".s1-1");

        if (songLink && songTitleDiv) {
            songList.push(songLink.getAttribute("href"));
            titleList.push(songTitleDiv.textContent.trim());
        }
    });

    return { songList, titleList };
}

// Play a song at given index
function playSong(index) {
    if (songs.length === 0) return;

    if (audio) {
        audio.pause();
    }

    currentSongIndex = index;
    audio = new Audio(songs[currentSongIndex]);

    audio.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").textContent =
            `00:00 / ${formatTime(audio.duration)}`;
        circle.style.left = "0%"; // reset to start
    });

    audio.addEventListener("timeupdate", () => {
        let current = formatTime(audio.currentTime);
        let total = formatTime(audio.duration);
        document.querySelector(".songtime").textContent = `${current} / ${total}`;

        // Update circle position based on progress
        let progressPercent = (audio.currentTime / audio.duration) * 100;
        circle.style.left = `${progressPercent}%`;
    });

    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton(true, songTitles[currentSongIndex]);
        })
        .catch(err => console.error(err));

    audio.addEventListener("ended", () => {
        if (currentSongIndex < songs.length - 1) {
            playSong(currentSongIndex + 1);
        } else {
            isPlaying = false;
            updatePlayButton(false);
        }
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (!audio) {
        playSong(currentSongIndex);
        return;
    }
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updatePlayButton(false);
    } else {
        audio.play()
            .then(() => {
                isPlaying = true;
                updatePlayButton(true, songTitles[currentSongIndex]);
            })
            .catch(err => console.error(err));
    }
}

// Update play button & song info
function updatePlayButton(isPlaying, songName = "") {
    let playBtnImg = document.querySelector("#playBtn img");
    if (playBtnImg) {
        playBtnImg.src = isPlaying
            ? "play_pause_prv_next/pause.svg"
            : "play_pause_prv_next/play.svg";
    }

    if (songName) {
        document.querySelector(".songinfo").textContent = songName;
    }

    if (!isPlaying) {
        document.querySelector(".songtime").textContent = "00:00 / 00:00";
    }
}

// Handle seek when clicking on seekbar
function handleSeek(event) {
    if (!audio || isNaN(audio.duration)) return;

    let rect = seekbar.getBoundingClientRect();
    let clickX = event.clientX - rect.left; // position clicked
    let percent = clickX / rect.width;
    percent = Math.max(0, Math.min(1, percent)); // clamp between 0 and 1
    audio.currentTime = percent * audio.duration;
}

// Initialize player
function init() {
    let { songList, titleList } = getSongsFromHTML();
    songs = songList;
    songTitles = titleList;

    seekbar = document.querySelector(".seekbar");
    circle = document.querySelector(".circle");

    let songCards = document.querySelectorAll(".s1");
    songCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            playSong(index);
        });
    });

    let playBtn = document.getElementById("playBtn");
    if (playBtn) {
        playBtn.addEventListener("click", togglePlayPause);
    }

    let nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentSongIndex < songs.length - 1) {
                playSong(currentSongIndex + 1);
            }
        });
    }

    let prevBtn = document.getElementById("prevBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentSongIndex > 0) {
                playSong(currentSongIndex - 1);
            }
        });
    }

    // Seekbar click event
    if (seekbar) {
        seekbar.addEventListener("click", handleSeek);
    }
}

document.addEventListener("DOMContentLoaded", init);
