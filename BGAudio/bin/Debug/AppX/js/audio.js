(function () {
    "use strict";
    importScripts("ms-appx:///WinJS/js/base.js", "ms-appx:///js/messages.js");
    var BackgroundMediaPlayer = Windows.Media.Playback.BackgroundMediaPlayer;
    var MediaPlayerState = Windows.Media.Playback.MediaPlayerState;
    var MediaPlaybackType = Windows.Media.MediaPlaybackType;

    var ForegroundAppStatus = {
        active: 0,
        suspended: 1,
        unknown: 2
    };
    

    var resultList = [];
    var favoritesList = [];
    var activeList = '';

    //Read and Wite file
    var applicationData = Windows.Storage.ApplicationData.current;
    var localFolder = applicationData.localFolder;
    function ReadTextFile() {
        localFolder.getFileAsync("searchResult.txt")
       .then(function (sampleFile) {
           return Windows.Storage.FileIO.readTextAsync(sampleFile);
       }).done(function (timestamp) {
           // Data is contained in timestamp 
           //MyPlaylist.songs = JSON.parse(timestamp);
           console.log(timestamp);
       }, function () {
           MyPlaylist.songs = {};
           console.log("not exisit");
       });
    }
     
    var SongChangedEvent = WinJS.Class.mix(WinJS.Class.define(function () { }), WinJS.Utilities.eventMixin);
    var MyPlaylist = WinJS.Class.define(
        function () {
            this.mediaPlayer.addEventListener("mediaopened", this.mediaPlayer_mediaOpened.bind(this));
            this.mediaPlayer.addEventListener("mediaended", this.mediaPlayer_mediaEnded.bind(this));
            this.mediaPlayer.addEventListener("mediafailed", this.mediaPlayer_mediaErorr.bind(this));
        },
        {
            currentSongId: 0,

            songChanged: new SongChangedEvent(),

            mediaPlayer: BackgroundMediaPlayer.current,

            mediaPlayer_mediaOpened: function (ev) {
                this.mediaPlayer.play();
                var songChangedEventDetails = new Object();
                songChangedEventDetails.songName = this.getCurrentSongName();
                this.songChanged.dispatchEvent("songchanged", songChangedEventDetails);
            },

            startSongAt: function(id) {
                if (this.currentSongId == id && this.mediaPlayer.currentState != MediaPlayerState.closed) {
                    this.mediaPlayer.play();
                } else {                    
                    if (MyPlaylist.songs.length > 0) {
                        // this try added because some worked link not work in this  App
                        this.currentSongId = id;
                        try {
                            var current = MyPlaylist.songs[id].link;
                            this.mediaPlayer.autoPlay = false;
                            this.mediaPlayer.setUriSource(new Windows.Foundation.Uri(current));
                            console.log("ok");
                        } catch (err) {
                            console.log(err);
                            //this.currentSongId = id+1;
                            //this.startSongAt(id+1);
                            //this.skipToNext();

                        }


                        

                    }
                                        
                }
            },

            mediaPlayer_mediaEnded: function(ev) {
                this.skipToNext();
            },
            mediaPlayer_mediaErorr: function (ev) {
                this.skipToNext();
            },

            playAllSongs: function () {
                this.startSongAt(0);
            },

            skipToNext: function() {
                if (this.currentSongId < MyPlaylist.songs.length -1) {
                    this.startSongAt(this.currentSongId + 1);
                } else {
                    this.startSongAt(0);
                };
            },

            backToPrevious: function () {
                if (this.currentSongId != 0) {
                    this.startSongAt(this.currentSongId - 1);
                } else {
                    this.startSongAt(0);
                };
            },
            
            getCurrentSongName: function () {
                if (this.currentSongId < MyPlaylist.songs.length) {
                    var fullUrl = MyPlaylist.songs[this.currentSongId].title;
                    console.log(fullUrl);
                    return fullUrl;
                } else {
                    throw "Song Id Is higher than total number of songs";
                }
            },

        },
        {

            
            songs: {},
        }
    );

    var MyPlaylistManager = WinJS.Class.define(
        function () {

        },
        {
            getCurrent: function () {
                return MyPlaylistManager.instance;
            }
        },
        {
            instance: new MyPlaylist()
        }
    );


    var MyBackgroundAudioTask = WinJS.Class.define(
        function () {
            
        },
        {
            playlistManager: new MyPlaylistManager(),
            deferral: null,
            foregroundAppState: null,
            taskInstance: Windows.UI.WebUI.WebUIBackgroundTaskInstance.current,

            getPlaylist: function () {
                return this.playlistManager.getCurrent();
            },

            run: function () {
                this.taskInstance.addEventListener("canceled", this.onCanceled.bind(this));
                this.taskInstance.task.addEventListener("completed", this.taskCompleted.bind(this));

                this.foregroundAppState = ForegroundAppStatus.active;
                BackgroundMediaPlayer.addEventListener("messagereceivedfromforeground", this.backgroundMediaPlayer_messageReceivedFromForeground.bind(this));
                var message = new Windows.Foundation.Collections.ValueSet();
                message.insert(Messages.ServerStarted, "");
                BackgroundMediaPlayer.sendMessageToForeground(message);
                this.getPlaylist().songChanged.addEventListener("songchanged", this.playlist_songChanged.bind(this));
                this.deferral = this.taskInstance.getDeferral();
            },

            startPlayback: function () {
                this.getPlaylist().playAllSongs();
            },

            playlist_songChanged: function(ev) {
                var message = new Windows.Foundation.Collections.ValueSet();
                message.insert(Messages.currentSong, this.getPlaylist().getCurrentSongName());
                message.insert(Messages.myMusicIsPlaying, "");
                if (this.foregroundAppState == ForegroundAppStatus.active)
                {
                    BackgroundMediaPlayer.sendMessageToForeground(message);
                }
            },

            backgroundMediaPlayer_messageReceivedFromForeground: function (ev) {
                console.log("msg recived ");
                var iter = ev.data.first();
                while (iter.hasCurrent) {
                    switch(iter.current.key.toLowerCase()) {
                        case Messages.AppSuspended:
                            this.foregroundAppState = ForegroundAppStatus.suspended;
                            break;
                        case Messages.AppResumed:
                            this.foregroundAppState = ForegroundAppStatus.active;
                            var message = new Windows.Foundation.Collections.ValueSet();
                            message.insert(Constants.myMusicIsPlaying, "Yes");
                            BackgroundMediaPlayer.sendMessageToForeground(message);
                            break;
                        case Messages.StartPlayback:
                            console.log("Starting playback");
                            this.startPlayback();
                            break;
                        case Messages.PrevSong:
                            console.log("Previouse songe");
                            this.prevSong();
                            break;
                        case Messages.SkipSong:
                            console.log("Skipping song");
                            this.skipSong();
                            break;
                        case Messages.PlayThisAudio:
                            var onAppId = JSON.parse(iter.current.value).onAppId
                            console.log("play this audio  " + onAppId);
                            
                            console.log("activ " + JSON.parse(iter.current.value).activeList);
                            if (JSON.parse(iter.current.value).activeList == "resultsList") {
                                MyPlaylist.songs = resultList;
                                console.log("fffffffffffffff"+resultList);
                            } else {
                                MyPlaylist.songs = favoritesList;
                            }

                            this.playThisAudio(onAppId);
                            break;
                        case Messages.ResultPlaylist:
                            console.log("audio.js recive message result");
                            console.log(JSON.parse(iter.current.value));
                            resultList = JSON.parse(iter.current.value);
                            //MyPlaylist.songs = JSON.parse(iter.current.value);
                            break;
                        case Messages.FavoritesList:
                            console.log("audio.js recive message result");
                            console.log(JSON.parse(iter.current.value));
                            //MyPlaylist.songs = JSON.parse(iter.current.value);
                            favoritesList = JSON.parse(iter.current.value);
                            break;
                    }
                    iter.moveNext();
                }
            },
            prevSong: function () {
                this.getPlaylist().backToPrevious();
            },

            skipSong: function() {
                this.getPlaylist().skipToNext();
            },

            playThisAudio: function(onAppId){
                this.getPlaylist().startSongAt(onAppId);
            },

            taskCompleted: function (ev) {
                console.log("MyBackgroundAudioTaskJS Completed...");
                BackgroundMediaPlayer.shutdown();
                if (this.deferral) {
                    this.deferral.complete();
                }
            },

            onCanceled: function (ev) {
                console.log("MyBackgroundAudioTaskJS cancel requested...");
                BackgroundMediaPlayer.shutdown();
                if (this.deferral) {
                    this.deferral.complete();
                }
            }
        }
    );
    
    var task = new MyBackgroundAudioTask();
    task.run();

    //ReadTextFile();

})();
