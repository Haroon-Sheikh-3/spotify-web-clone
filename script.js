document.querySelectorAll(".carousel").forEach((carousel) => {
  const container = carousel.querySelector(".container");
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");

  const cardWidth = container.querySelector(".card-container").offsetWidth;
  const scrollAmount = cardWidth * 2; // move 2 cards per click

  let currentIndex = 0;
  const cardsPerView = 7;
  const totalCards = container.querySelectorAll(".card-container").length;
  const maxIndex = totalCards - cardsPerView;

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex += 2;
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 2;
      if (currentIndex < 0) currentIndex = 0;
      container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
  });
});

//FOR SONG



async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/SONGS/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const masterAudio = document.getElementById('master-audio');
const masterPlayButton = document.getElementById('master-play-button');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
const volumeSlider = document.getElementById('volume-slider');

// New: Get progress bar and time display elements
const progressBarContainer = document.querySelector('.progress-bar-container');
const progressFill = document.getElementById('progress-fill');
const currentTimeSpan = document.getElementById('current-time');
const totalTimeSpan = document.getElementById('total-time');

let currentSongIndex = -1;
let allSongs = [];

function playSong(index) {
    if (index >= 0 && index < allSongs.length) {
        const audioSrc = allSongs[index];
        masterAudio.src = audioSrc;
        masterAudio.play();
        masterPlayButton.src = 'img/pause.svg';
        currentSongIndex = index;
        console.log('Now playing:', audioSrc);
    } else {
        console.error("Invalid song index:", index);
    }
}

// New: Helper function to format time
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}

async function main() {
    allSongs = await getSongs();
    console.log(allSongs);

    const cardPlayButtons = document.querySelectorAll('.image-wrapper .play');
    const allCards = document.querySelectorAll('.card-container');

    allCards.forEach((card, index) => {
        const songPath = allSongs[index % allSongs.length];
        card.querySelector('.image-wrapper').setAttribute('data-audio-src', songPath);
    });

    cardPlayButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentSongIndex === index) {
                if (masterAudio.paused) {
                    masterAudio.play();
                    masterPlayButton.src = 'img/pause.svg';
                } else {
                    masterAudio.pause();
                    masterPlayButton.src = 'img/play.svg';
                }
            } else {
                if (currentSongIndex !== -1) {
                    masterAudio.pause();
                }
                playSong(index);
            }
        });
    });

    masterPlayButton.addEventListener('click', () => {
        if (masterAudio.paused) {
            if (currentSongIndex === -1 && allSongs.length > 0) {
                playSong(0);
            } else {
                masterAudio.play();
                masterPlayButton.src = 'img/pause.svg';
            }
        } else {
            masterAudio.pause();
            masterPlayButton.src = 'img/play.svg';
        }
    });

    nextButton.addEventListener('click', () => {
        if (allSongs.length === 0) return;
        let newIndex = (currentSongIndex + 1) % allSongs.length;
        playSong(newIndex);
    });

    prevButton.addEventListener('click', () => {
        if (allSongs.length === 0) return;
        let newIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
        playSong(newIndex);
    });

    // New: Update time and progress as song plays
    masterAudio.addEventListener("timeupdate", () => {
        const progressPercentage = (masterAudio.currentTime / masterAudio.duration) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        currentTimeSpan.textContent = formatTime(masterAudio.currentTime);
    });

    // New: Update total time when the song loads
    masterAudio.addEventListener("loadedmetadata", () => {
        totalTimeSpan.textContent = formatTime(masterAudio.duration);
    });

    // New: Add click listener to the progress bar to allow seeking
    progressBarContainer.addEventListener('click', (e) => {
        const containerWidth = progressBarContainer.clientWidth;
        const clickPosition = e.offsetX;
        const seekTime = (clickPosition / containerWidth) * masterAudio.duration;
        masterAudio.currentTime = seekTime;
    });

    volumeSlider.addEventListener('input', (e) => {
        masterAudio.volume = e.target.value;
    });
}

main();