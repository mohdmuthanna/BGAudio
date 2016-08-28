/// <reference path="jquery-2.2.4.min.js" />

var positionUpdateInterval = 0;
var serverStarted = false;
var isMusicPlaying = false;
var initialized = false; //is start play list initialized

var resultList = [];
var favoritesList = [];
var firstRun = true;
var trendingList = [];
var worldList = [];

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

    $("#canvas").click(function (jqEvent) {
        var coords = {
            x: jqEvent.pageX - $("#canvas").offset().left,
        };
        var logicalCoords = {
            x: coords.x / (canvas.width) *100,
        }
        canvasTracker(logicalCoords.x);
    });


    $('#results').on('click', '.favorite', function () {
        //send onAppId & id wich is song id in trevx database
        AddRemoveFav(this.getAttribute('on-app-id'),this.id);
    });


    $('#results').on('click', '.avatar', function () {
        //send send to background
        PlayThisAudio("resultList", this.getAttribute('on-app-id'));
        //startOrResume();
        //startPlaylist();
        //document.getElementById("curr-song-name").innerText = this.getAttribute('title');
        console.log("event listener: this.getAttribute('on-app-id')= " + this.getAttribute('on-app-id'));
    });

    $('#results').on('click', '.name', function () {
        //send send to background
        PlayThisAudio("resultList", this.getAttribute('on-app-id'));;
    });

    $('#fav').on('click', '.name', function () {
        //send send to background
        PlayThisAudio("favoritesList", this.getAttribute('on-app-id'));
        console.log(this.id);
    });

    $('#fav').on('click', '.avatar', function () {
        //send send to background
        PlayThisAudio("favoritesList", this.getAttribute('on-app-id'));
    });

    $('#fav').on('click', '.remove', function () {
        //send onAppId & id wich is song id in trevx database
        AddRemoveFav(this.getAttribute('on-app-id'), this.id);
        console.log(this.id);
    });

    try {
        Windows.Media.Playback.BackgroundMediaPlayer.onmessagereceivedfrombackground = function (e) {
            messagereceivedHandler(e);
        }
        if (mediaPlayer.currentState != Windows.Media.Playback.MediaPlayerState.playing) {
            document.getElementById("PauseButton").disabled = true;
            //document.getElementById("NextButton").disabled = true;
        }
    } catch (err) {
        
        console.log(err);
    }
 

    $(function () {
        $("#search-box").autocomplete({
            source: function (request, response) {
                var suggestionUrl = "http://trevx.com/v1/suggestion/" + encodeURIComponent(request.term) + "/?format=json";
                $.getJSON(suggestionUrl, function (data) {
                    var searchTerms = data.slice(0, data.length - 4);
                    response(searchTerms);
                });
            },
            // on select suggestion item do
            select: function (event, ui) {
                searchForQuery(ui.item.value);
            },
            minLength: 2,
            //remove results status message
            messages: {
                noResults: '',
                results: function () { }
            },
        })
    });

    //enter
    $("#search-box").keyup(function (e) {
        //e.preventDefault();
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter
            searchForQuery(document.getElementById('search-box').value);
        }
    });

    //searchbutton clicked
    $("#trevxSearchButton").click(function (e) {
        searchForQuery(document.getElementById('search-box').value);
    });

    //trend box clicked
    $(".trend-box").click(function (e) {

    });

    $('#trending-list').on('click', '.trend-box', function () {
        var term = trendingList[this.id].Searchq.replace(/-/g, ' ');
        console.log(" fffg    "+this.id);
        searchForQuery(term);
    });

    $('#world-list').on('click', '.trend-box', function () {
        var term = worldList[this.id].Searchq.replace(/-/g, ' ');
        console.log(" fffg    " + this.id);
        searchForQuery(term);
    });
    
} // event listener

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
                case Messages.CurrentSongName:

                    document.getElementById("curr-song-name").innerText = e.data.first().current.value;
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
    try {
        if (mediaPlayer.canPause) {
            mediaPlayer.pause();
        }
    } catch (err) {
        console.log("can paused errrrrrrrrrrrror  ");
    }
}


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

// http://trevx.com/discover-api.php?type=categories&lan=en&country=us&order=random&categories_limit=6&songs_limit=6&artists_limit=3&world_discover_limit=5
//Trending API
function trending() {

    var url = 'http://trevx.com/discover-api.php?type=categories&lan=en&country=us&order=random&categories_limit=6&songs_limit=6&artists_limit=3&world_discover_limit=5';
    $.getJSON(url, function (trend) {
            trendingList = trend;
            if (trend.length > 0) {
                document.getElementById("trending-list").innerHTML = createTrending(trend);
            } else {
                document.getElementById("trending-list").innerHTML = "Sorry, an erorr accrued";
            }
        });
};

function getWorldList() {

    var url = 'http://trevx.com/discover-api.php?type=world_discover&lan=en&country=us&order=random&categories_limit=6&songs_limit=6&artists_limit=3&world_discover_limit=6';
    $.getJSON(url, function (list) {
        worldList = list;
        if (list.length > 0) {
            console.log("fgtgfrtgdfff");
                document.getElementById("world-list").innerHTML = createWorldList(list);
            } else {
                document.getElementById("world-list").innerHTML = "Sorry, an erorr accrued";
            }
        });
};



// search API
function searchForQuery(searchQueryValueEncoded) {
    if (typeof searchQueryValueEncoded !== "string") {
        var searchQueryValueEncoded = encodeURI(document.getElementById("search-box").value);
    }

    document.getElementById('search-box').value = "";
    $("#search-box").autocomplete("close");
    $('.tab.discover').show().siblings('div').hide();
    $('.columns').removeClass('on');
    $('.discover').addClass('on');
    $('.audio-field').attr('style', "display: none;");

    if (searchQueryValueEncoded.length > 0) {
        var url = 'http://trevx.com/v1/' + searchQueryValueEncoded + '/0/40/?format=json';
        document.getElementById("results").innerHTML = "<div id='loading-msg' class='loading'><img src='assets/imgs/load.gif' alt='loading' width='64' height='64'></div>";
        $.getJSON(url, function (data) {

            resultList = data.slice(0, data.length - 7);
            removeRedundentResult();
            WriteTextFileResult(resultList);
            sendResultList(JSON.stringify(resultList));

            if (resultList.length > 0) {
                document.getElementById("results").innerHTML = createAudioLines(resultList);
                changeFavoriteIconsState();
            } else {
                document.getElementById("results").innerHTML = "No results found";
            }
        });
    }

    //document.getElementById("trevxSearchBox").value = '';
};

// this function ricive stringfy JSON object to send it in message
function sendResultList(list) {
       // console.log("555555555555555555");
        var message = new Windows.Foundation.Collections.ValueSet();
        message.insert(Messages.ResultList, list);
        Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
      //  console.log("66666666666666666666666");


};

function changeFavoriteIconsState() {
            var favoriteIcons = document.querySelectorAll('.fav-item');
            for (var i = 0; i < favoriteIcons.length; i++) {
                favoriteIcons[i].setAttribute("class", "fav-item favorite");
                for (var j = 0; j < favoritesList.length; j++) {
                    if (favoritesList[j].id == favoriteIcons[i].id) {
                        favoriteIcons[i].setAttribute("class", "fav-item favorite on");
                    }
                }
            }
}

function sendFavoritesList(list) {
    var message = new Windows.Foundation.Collections.ValueSet();
    message.insert(Messages.FavoritesList, list);
    Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
    //console.log("sendfavoritesList function");
};

function PlayThisAudio(activeList, onAppId) {
    //console.log("active in global " + activeList);
    startPlaylist();  
    var message = new Windows.Foundation.Collections.ValueSet();
    var detail = { activeList: activeList, onAppId: onAppId };
    message.insert(Messages.PlayThisAudio, JSON.stringify(detail));
    Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
};

function canvasTracker(percentage) {
    var message = new Windows.Foundation.Collections.ValueSet();
    message.insert(Messages.CanvasTracker, percentage);
    Windows.Media.Playback.BackgroundMediaPlayer.sendMessageToBackground(message);
};


function AddRemoveFav(onAppId, id) {
    var isFavored = checkIfFavored(id);
    //console.log("id = " +id +  "  isFavored = " + isFavored);
    
    if (isFavored == -1) {
        addToFavorites(onAppId);
    } else {
        removeFromFavorites(id);
    };

    WriteTextFileFav(favoritesList);
    sendFavoritesList(JSON.stringify(favoritesList));
    document.getElementById("fav").innerHTML = createFavAudioLines(favoritesList);
    changeFavoriteIconsState();
}

function checkIfFavored(target) {
        for (var i = 0; i < favoritesList.length; i++) {
            if (favoritesList[i].id == target) {
                return [i];
            }
        }
        return -1;

}

function addToFavorites(target){
  // max length should not be more than 250, because google SafeSearch API cant handel more than 500 links
  // and every audio has tow links, image & audio url
    if (favoritesList.length < 249) {
        console.log("ddddd  " + resultList.length);
    for (var i = 0; i < resultList.length; i++) {
      if (resultList[i].id == target) {
        var active = i;
      }
    }
    var element = resultList[active];
    favoritesList.push(resultList[target]);
  } else {
    alert("Sorry, your favorites list is full, remove some items and the try add new item");
  }

} // add to favorite

function removeFromFavorites(target){
  for (var i = 0; i < favoritesList.length; i++) {
    if (favoritesList[i].id == target) {
      favoritesList.splice( i, 1 );
    }
  }
}



function createAudioLines(list) {
    var links = '';

    for (var i = 0; i < list.length; i++) {
        links += "<li>" +
       "<div class='avatar'  on-app-id=" + i + "> <img src=" + getAudioImage(list[i].image) + "> <span class='icon play'></span> <span class='icon pause'></span> </div> " +
       "<h2 class='name' on-app-id=" + i + " >" + list[i].title + "</h2> " +
       "<div class='actions'> </a> <a href='#' class='fav-item favorite'  id=" + list[i].id + " on-app-id=" + i + "></a> </div></li>";
    }
    return "<ul class='results'>" + links + "</ul>";
}


function createFavAudioLines(list) {
    var links = '';
    for (var i = 0; i < list.length; i++) {
        links += '<li>'+
          "<div class='avatar'  on-app-id=" + i + "> <img src=" + getAudioImage(list[i].image) + "> <span class='icon play'></span> <span class='icon pause'></span> </div> " +
          "<h2 class='name' on-app-id="+i+" >" + list[i].title + "</h2> " +
          "<div class='actions'> <a href='#' id=" + list[i].id + " class='remove' on-app-id=" + i + ">x</a> </div>" +
        '</li>';
       // links += "<span id=" + list[i].id + " class='add-remove-fav' on-app-id=" + i + ">add to fav</span>" + "<p id=" + list[i].id + " title ='" + list[i].title + "' on-app-id=" + i + " class='audio-line'>" + list[i].title + "</p>";
    }
    return links;
}


var gggg =
 "<li class='columns large-2 medium-3 small-6'>" +
 "<div class='block'> <a href='#' class='action'> <img src='assets/imgs/avatar.jpg' alt=''> <span class='icon play'></span> <span class='icon pause'></span> </a> <a href='#' class='name'>" +
 "<h3>Track Name 2 <span>Music</span></h3>" +
 "</a> </div>" +
 "</li>";


function createTrending(trend) {
    var boxes = '';
    for (var i = 0; i < trend.length; i++) {
        boxes +=
            "<li class='columns large-2 medium-3 small-6 trend-box' id=" + i + " >" +
                 "<div class='block'> <a href='#' class='action'> <img src=" + (trend[i].Imgurl) + " alt=''> </a>" +
                    "<a href='#' class='name'>" +
                      "<h3>" + trend[i].Qtitle +
                            "<span>Music</span>" +
                            "</h3>" +
                    "</a>" +
                "</div>" +
            "</li>";
    }
    return boxes;

}
function createWorldList(list) {
    var boxes = '';
    for (var i = 0; i < list.length; i++) {
        boxes +=
            "<li class='columns large-2 medium-3 small-6 trend-box' id=" + i + " >" +
                 "<div class='block'> <a href='#' class='action'> <img src=" + (list[i].Imgurl) + " alt=''> </a>" +
                    "<a href='#' class='name'>" +
                      "<h3>" + list[i].Qtitle +
                            "<span>Worldwide</span>" +
                            "</h3>" +
                    "</a>" +
                "</div>" +
            "</li>";
    }
    return boxes;

}


//Read and Wite file
var applicationData = Windows.Storage.ApplicationData.current;
var localFolder = applicationData.localFolder;

// This  to read fav-list file
function WriteTextFileResult(JSONlist) {
    localFolder.createFileAsync("searchResult.txt", Windows.Storage.CreationCollisionOption.replaceExisting)
   .then(function (sampleFile) {
       return Windows.Storage.FileIO.writeTextAsync(sampleFile, JSON.stringify(JSONlist));

   }).done(function () {
       console.log("Saved completely ");
       // console.log("beforddddd  " + JSON.stringify(sx).length);
   }, function () {
       console.log("Not saved ");
   });
}

// This  to read fav-list file
function ReadTextFileResult() {
    localFolder.getFileAsync("searchResult.txt")
   .then(function (sampleFile) {

       return Windows.Storage.FileIO.readTextAsync(sampleFile);;
   }).done(function (timestamp) {
       //list to html
       if (JSON.parse(timestamp).length > 0) {
           resultList = JSON.parse(timestamp);
           sendResultList(JSON.stringify(resultList));
           document.getElementById("results").innerHTML = createAudioLines(resultList);
           //console.log("read done, msg should sent " + JSON.stringify(resultList));
          // sendResultList(JSON.stringify(resultList));
           
       } else {
           document.getElementById("results").innerHTML = "search for a music";
       }

       changeFavoriteIconsState();
       
   }, function () {
       document.getElementById("results").innerHTML = "Welcome to Trevx, make new search";
       console.log("not exisit");
   });
    
}


function WriteTextFileFav(JSONlist) {
    localFolder.createFileAsync("fav.txt", Windows.Storage.CreationCollisionOption.replaceExisting)
   .then(function (sampleFile) {
       return Windows.Storage.FileIO.writeTextAsync(sampleFile, JSON.stringify(JSONlist));

   }).done(function () {
       console.log("Saved completely ");
       // console.log("beforddddd  " + JSON.stringify(sx).length);
   }, function () {
       console.log("Not saved ");
   });
}

// This  to read fav-list file
function ReadTextFileFav() {
    localFolder.getFileAsync("fav.txt")
   .then(function (sampleFile) {

       return Windows.Storage.FileIO.readTextAsync(sampleFile);;
   }).done(function (timestamp) {
       //list to html
       try {
           if (JSON.parse(timestamp).length > 0) {
               favoritesList = JSON.parse(timestamp);
               //sendFavoritesList(JSON.stringify(favoritesList));
               document.getElementById("fav").innerHTML = createFavAudioLines(favoritesList);
               //console.log("read done, msg should sent ");
           } else {
               document.getElementById("fav").innerHTML = "no fav added yet";
           }
       } catch (err) {
           console.log(err);
       }


   }, function () {
       document.getElementById("fav").innerHTML = "Welcome to Trevx, Add to fav";
       console.log("not exisit");
   });
}

function removeRedundentResult() {
    resultList = resultList.reduceRight(function (r, a) {
        r.some(function (b) { return a.link === b.link; }) || r.push(a);
        return r;
    }, []);
    resultList = resultList.reverse();
};

function getAudioImage(imgUrl) {
    if (imgUrl.length == 0) {
        imgUrl = "assets/imgs/cover-img.jpg";
    }
    return imgUrl;
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
    //document.getElementById("NextButton").disabled = false;
    

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
            //document.getElementById("curr-song-name").innerText = "fffff";
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
    var mediaButton = Windows.Media.SystemMediaTransportControlsButton;
    try {
        console.log("mediaButton preseddddddddddddddddd");
        switch (ev.button) {
            case mediaButton.play:
                mediaPlayer.play();
                break;
            case mediaButton.pause:
                mediaPlayer.pause();
                break;
            case mediaButton.next:
                this.skipSong();
                break;
            case mediaButton.previous:
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

window.onload = function () {
    trending();
    getWorldList();

    ReadTextFileFav();
    ReadTextFileResult();
    //document.querySelector(".search-result").setAttribute("style", "display: block;");

}

function read() {
    ReadTextFileFav();
    ReadTextFileResult();

}
