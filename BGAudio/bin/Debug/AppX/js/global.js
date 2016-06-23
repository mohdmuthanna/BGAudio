var positionUpdateInterval = 0;
var serverStarted = false;
var isMusicPlaying = false;
var initialized = false;

var MediaPlaybackStatus = Windows.Media.MediaPlaybackStatus;
var MediaPlayerState = Windows.Media.Playback.MediaPlayerState;
var mediaPlayer = Windows.Media.Playback.BackgroundMediaPlayer.current;
var smtc = Windows.Media.SystemMediaTransportControls.getForCurrentView();



function initializeBackgroundAudio() {
    setupSMTC();
    Windows.Media.Playback.BackgroundMediaPlayer.addEventListener("messagereceivedfrombackground", messagereceivedHandler);
    mediaPlayer.autoPlay = false;
    mediaPlayer.addEventListener("currentstatechanged", backgroundAudioStateChanged);
}

function addApplicationEventHandlers() {
    document.getElementById("PlayButton").addEventListener("click", startOrResume, false);
    document.getElementById("PauseButton").addEventListener("click", pausePlayback, false);
    document.getElementById("NextButton").addEventListener("click", playNextSong, false);
    document.getElementById("PreviousButton").addEventListener("click", playPrevSong, false);

    document.getElementById("trevxSearchButton").addEventListener("click", searchForQuery, false);
    //$("p").click(function () {
      //  console.log(this.id);
        //console.log(this.innerHTML);
    //});

    $('#results').on('click', '.audio-line', function () {
        console.log(this.id);
        console.log(this.innerHTML);
    });

    try {
        Windows.Media.Playback.BackgroundMediaPlayer.onmessagereceivedfrombackground = function (e) {
            messagereceivedHandler(e);
        }
        if (mediaPlayer.currentState != Windows.Media.Playback.MediaPlayerState.playing) {
            document.getElementById("PauseButton").disabled = true;
            document.getElementById("NextButton").disabled = true;
        }
    } catch (err) {
        console.log(err);
    }

}

function removeMediaPlayerEventHandlers() {
    mediaPlayer.removeEventListener("currentstatechanged", backgroundAudioStateChanged);
    Windows.Media.Playback.BackgroundMediaPlayer.removeEventListener("messagereceivedfrombackground", messagereceivedHandler);
}

// Messages from audio background task will be handled here
function messagereceivedHandler(e) {
    var messageSize = e.detail.length;
    for (var i = 0; i < messageSize; i++) {
        for (var key in e.detail[i].data) {
            switch (key) {
                case Messages.ServerStarted:
                    serverStarted = true;
                    break;
                case Messages.MyMusicIsPlaying:
                    isMusicPlaying = true;
                    smtc.playbackStatus = MediaPlaybackStatus.playing;
                    break;
                case Messages.CurrentSong:
                    updateCurrentSong(e.detail[i].data[key]);
                    break;
            }
        }
    }
}

function updateCurrentSong(songName) {
    smtc.displayUpdater.type = MediaPlaybackType.music;
    smtc.displayUpdater.musicProperties.title = songName;
    smtc.displayUpdater.update();
}

function startOrResume() {
    if (!initialized) {
        startPlaylist();
    } else {
        mediaPlayer.play();
    }
}

function pausePlayback() {
    if (mediaPlayer.canPause) {
        mediaPlayer.pause();
    }
}

var favoritesList = [];
function getAudioTitle(title) {
    if (title.length > 40) {
        title = title.substr(0, 39) + "..";
    }
    return title;
}
function getAudioImage(imgUrl) {
    if (imgUrl.length == 0) {
        imgUrl = "images/cover-img.jpg";
    }
    return imgUrl;
}

function searchForQuery() {
    var searchQueryValueEncoded = encodeURI(document.getElementById("trevxSearchBox").value);
    if (searchQueryValueEncoded.length > 0) {
        var url = 'http://trevx.com/v1/' + searchQueryValueEncoded + '/0/40/?format=json';
        $.getJSON(url, function (data) {
            var searchResultList = data.slice(0, data.length - 7);
            if (searchResultList.length > 0) {
                sendResultPlaylist(searchResultList);
                document.getElementById("results").innerHTML = createFavoriteLines(searchResultList);
            } else {
                document.getElementById("results").innerHTML = "No results found";
            }
        });

    }
  
};

function sendResultPlaylist(searchResultList) {
        var message = new Windows.Foundation.Collections.ValueSet();
        message.insert(Messages.ResultPlaylist, JSON.stringify(searchResultList));
        Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
};


function createFavoriteLines(list) {
    var links = '';
    for (var i = 0; i < list.length; i++) {
        //"<a class='action' id='" + searchResultList[i].id + "'href='#'>"
        links += "<p id='"+ list[i].id +"' class='audio-line'>" + list[i].title + "</p>";
    }
    return links;

}

//
// To start playback send message to the background
//
function startPlaylist() {
    if (!initialized) {
        initializeBackgroundAudio();
        var message = new Windows.Foundation.Collections.ValueSet();
        if (serverStarted == true) {
            message.insert(Messages.StartPlayback, "");
            Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
            initialized = true;
        }
    }

    document.getElementById("PauseButton").disabled = false;
    document.getElementById("NextButton").disabled = false;
    

}

function playNextSong() {
    var message = new Windows.Foundation.Collections.ValueSet();
    message.insert("SkipSong", "");
    Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
}

function playPrevSong() {
    var message = new Windows.Foundation.Collections.ValueSet();
    message.insert("PrevSong", "");
    Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
}

//
// Display and update progress bar
//
function progressBar() {
    try {
        //get current position 
        var elapsedTime = Math.round(mediaPlayer.position);
        //update the progress bar
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            //clear canvas before painting
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.fillStyle = "#DD4433";
            var fWidth = (elapsedTime / mediaPlayer.naturalDuration) * (canvas.clientWidth);
            if (fWidth > 0) {
                ctx.fillRect(0, 0, fWidth, canvas.clientHeight);
            }
        }
    }
    catch (error) {

        log(error.message);
        log(error.description);
    }

}

//
// This method sets the interval to update the progress bar on the UI
//
function backgroundAudioStateChanged() {
    if (mediaPlayer != null) {
        var currentState = mediaPlayer.currentState;
        if (currentState == Windows.Media.Playback.MediaPlayerState.playing) {
            smtc.playbackStatus = MediaPlaybackStatus.playing;
            document.getElementById("PauseButton").disabled = false;
            document.getElementById("PlayButton").disabled = true;
            if (positionUpdateInterval == 0) {
                positionUpdateInterval = window.setInterval(progressBar, 1000, "test");
            }
        }
        else if (currentState == Windows.Media.Playback.MediaPlayerState.paused) {
            smtc.playbackStatus = MediaPlaybackStatus.paused;
            document.getElementById("PauseButton").disabled = true;
            document.getElementById("PlayButton").disabled = false;
            if (positionUpdateInterval != 0) {
                window.clearInterval(positionUpdateInterval);
                positionUpdateInterval = 0;
            }
        }
        else if (currentState == MediaPlayerState.stopped) {
            smtc.playbackStatus = MediaPlaybackStatus.closed;
            if (positionUpdateInterval != 0) {
                window.clearInterval(positionUpdateInterval);
                positionUpdateInterval = 0;
            }
        }
    }
}

function log(message) {
    var statusDiv = document.getElementById("statusMessage");
    if (statusDiv) {
        message += "\n";
        statusDiv.innerText += message;
    }
}

function skipSong()
{
    smtc.playbackStatus = MediaPlaybackStatus.changing;
    playNextSong();
}

function prevSong() {
    smtc.playbackStatus = MediaPlaybackStatus.changing;
    playPrevSong();
}


function smtc_buttonPressed(ev) {
    try {
        console.log(ev.button);
        switch (ev.button) {
            case 0:
                mediaPlayer.play();
                break;
            case 1:
                mediaPlayer.pause();
                break;
            //case SystemMediaTransportControlsButton.next: 
            case 6:
                this.skipSong();
                break;
            case 7:
                this.prevSong();
                break;
        }
    } catch (err) {
        console.log(ev.button);
        console.log(err);
    }

};

function systemmediatransportcontrol_propertyChanged(ev) {};

function setupSMTC()
{
    smtc.addEventListener("buttonpressed", this.smtc_buttonPressed.bind(this));
    smtc.addEventListener("propertychanged", this.systemmediatransportcontrol_propertyChanged.bind(this));
    smtc.isEnabled = true;
    smtc.isPauseEnabled = true;
    smtc.isPlayEnabled = true;
    smtc.isNextEnabled = true;
    smtc.isPreviousEnabled = true;
}