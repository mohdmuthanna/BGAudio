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
                    //var source = "ms-appx:///Media/Assets/" + MyPlaylist.songs[id];
                    //var source = ["http://www.aldwaihi.com/ram/24frzdq37.mp3", "http://abdulrazzak.com/sounds/ya_sbr_ayob.mp3", "http://abdulrazzak.com/sounds/dmo3_alro7.mp3", "http://abdulrazzak.com/sounds/oj3_ora2_bab_la_ytrk.mp3"];
                    var current = MyPlaylist.songs[id].link;
                    console.log(MyPlaylist.songs[id].link);
                    this.currentSongId = id;
                    this.mediaPlayer.autoPlay = false;
                    this.mediaPlayer.setUriSource(new Windows.Foundation.Uri(current));                    
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
            }
        },
        {

            songs: [{ id: "2623100", title: "ولما تلاقينا عبدالرحمن محمد mp3", link: "http://songily.com/new/file//111615619.mp3", image: "https://i1.sndcdn.com/artworks-000058328741-agkukr-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=ولما تلاقينا عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMTE2MTU2MTkubXAz&key=f5cbd3948e9fc8d86c35c33f00a03a40&resultid=2623100&queryid=192558" }, { id: "2623115", title: "Abdelrahman Mohammed - B ro7y fatah | عبدالرحمن محمد - بروحي فتاة mp3", link: "http://songily.com/new/file//139735897.mp3", image: "https://i1.sndcdn.com/artworks-000073619505-i94b1r-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdelrahman Mohammed - B ro7y fatah | عبدالرحمن محمد - بروحي فتاة mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMzk3MzU4OTcubXAz&key=1de304b7abdf5a25ca22ea2c67667fe4&resultid=2623115&queryid=192558" }, { id: "2623096", title: "أصابك عشق . عبدالرحمن محمد ومهاب عمر mp3", link: "http://songily.com/new/file//123071879.mp3", image: "https://i1.sndcdn.com/artworks-000064354991-r5vmzp-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=أصابك عشق . عبدالرحمن محمد ومهاب عمر mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjMwNzE4NzkubXAz&key=2336b55a053c6ec50c396e145f5a956a&resultid=2623096&queryid=192558" }, { id: "2623097", title: "عبدالرحمن محمد - روحي إليك mp3", link: "http://songily.com/new/file//90093790.mp3", image: "https://i1.sndcdn.com/artworks-000066320016-m9s8az-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - روحي إليك mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy85MDA5Mzc5MC5tcDM=&key=b33bb38d7eb9ffd42903e5cfe43ad79b&resultid=2623097&queryid=192558" }, { id: "2623104", title: "Abdulrahman mohammed- عبدالرحمن محمد - ألم الهوا mp3", link: "http://songily.com/new/file//83332284.mp3", image: "https://i1.sndcdn.com/artworks-000042988395-wt1k1q-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman mohammed- عبدالرحمن محمد - ألم الهوا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy84MzMzMjI4NC5tcDM=&key=0ee955ffe3053329c775bd0ee72df0c7&resultid=2623104&queryid=192558" }, { id: "2623098", title: "عبدالرحمن محمد - يا مَن إليهِ المُشتكى والمفزعُ mp3", link: "http://songily.com/new/file//93354242.mp3", image: "https://i1.sndcdn.com/artworks-000048673667-axmmr9-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - يا مَن إليهِ المُشتكى والمفزعُ mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy85MzM1NDI0Mi5tcDM=&key=db398c87a1ffb935d6d8eae684cebd36&resultid=2623098&queryid=192558" }, { id: "2623101", title: "اغار عليها .. عبدالرحمن محمد .. كاملة mp3", link: "http://songily.com/new/file//161373071.mp3", image: "https://i1.sndcdn.com/artworks-000086924899-1we4k5-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=اغار عليها .. عبدالرحمن محمد .. كاملة mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xNjEzNzMwNzEubXAz&key=beebe2da5b20793b1720d15b449cdb4d&resultid=2623101&queryid=192558" }, { id: "2623102", title: "Abdulrahman Mohammed Mohab Omer - Craziness مهاب عمر و عبدالرحمن محمد - أصابك عشق mp3", link: "http://songily.com/new/file//123030132.mp3", image: "https://i1.sndcdn.com/artworks-000064332152-x17rfn-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed Mohab Omer - Craziness مهاب عمر و عبدالرحمن محمد - أصابك عشق mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjMwMzAxMzIubXAz&key=e23cdab9e35a17ecc342313c77911fdc&resultid=2623102&queryid=192558" }, { id: "2623103", title: "Abdulrahman Mohammed Mohab Omer - Lama Talakayna مهاب عمر و عبدالرحمن محمد - لما تلاقينا mp3", link: "http://songily.com/new/file//111300167.mp3", image: "https://i1.sndcdn.com/artworks-000058182203-4ur92y-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed Mohab Omer - Lama Talakayna مهاب عمر و عبدالرحمن محمد - لما تلاقينا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMTEzMDAxNjcubXAz&key=2db84c4ff07ea6944f7f7a301159b90c&resultid=2623103&queryid=192558" }, { id: "2623105", title: "قولوا لها .. عبدالرحمن محمد mp3", link: "http://songily.com/new/file//89913937.mp3", image: "https://i1.sndcdn.com/artworks-000046708156-9ehx0e-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=قولوا لها .. عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy84OTkxMzkzNy5tcDM=&key=a5c9b4c7340e67698699144eae840ca2&resultid=2623105&queryid=192558" }, { id: "2623106", title: "عبدالرحمن محمد - أصابك عشق mp3", link: "http://songily.com/new/file//122951350.mp3", image: "https://i1.sndcdn.com/artworks-000064290172-7gy1pr-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - أصابك عشق mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjI5NTEzNTAubXAz&key=f7cd09060784f515becf496ee1f00c46&resultid=2623106&queryid=192558" }, { id: "2623107", title: "حبيتك انا عبدالرحمن محمد جديد mp3", link: "http://songily.com/new/file//126343097.mp3", image: "https://i1.sndcdn.com/artworks-000066189133-an83h2-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=حبيتك انا عبدالرحمن محمد جديد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjYzNDMwOTcubXAz&key=aeb7866b57cc5122028a78c1fc69dbad&resultid=2623107&queryid=192558" }, { id: "2623108", title: "ولمَّا بَـدا لِــي | عبدالرحمن محمد mp3", link: "http://songily.com/new/file//132807539.mp3", image: "https://i1.sndcdn.com/artworks-000069772372-00dgxd-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=ولمَّا بَـدا لِــي | عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMzI4MDc1MzkubXAz&key=516aed91a5e9ac5e0127c6a81dc9c6e7&resultid=2623108&queryid=192558" }, { id: "2623109", title: "Abdulrahman Mohammed - Tomorrow عبدالرحمن محمد - بكره mp3", link: "http://songily.com/new/file//165762096.mp3", image: "https://i1.sndcdn.com/artworks-000089765564-gl9h0n-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed - Tomorrow عبدالرحمن محمد - بكره mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xNjU3NjIwOTYubXAz&key=60255aa2778479549ef55c2bcfe14638&resultid=2623109&queryid=192558" }, { id: "2623110", title: "Abdulrahman MohamedBTB | عبدالرحمن محمد - حبيبى على الدنيا mp3", link: "http://songily.com/new/file//185097793.mp3", image: "https://i1.sndcdn.com/artworks-000102697409-44j03j-large.jpg", filename: "", queryId: "192558", downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman MohamedBTB | عبدالرحمن محمد - حبيبى على الدنيا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xODUwOTc3OTMubXAz&key=36334a78a9d6a083994c575e2ce5cea2&resultid=2623110&queryid=192558" }],
            songs2: [
                "http://www.aldwaihi.com/ram/24frzdq37.mp3",
                "http://abdulrazzak.com/sounds/ya_sbr_ayob.mp3",
                "http://abdulrazzak.com/sounds/dmo3_alro7.mp3",
                "http://abdulrazzak.com/sounds/oj3_ora2_bab_la_ytrk.mp3",
            ]
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

})();

var songsJson0 = [{
    id: "2623100",
    title: "ولما تلاقينا عبدالرحمن محمد mp3",
    link: "http://songily.com/new/file//111615619.mp3",
    image: "https://i1.sndcdn.com/artworks-000058328741-agkukr-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=ولما تلاقينا عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMTE2MTU2MTkubXAz&key=f5cbd3948e9fc8d86c35c33f00a03a40&resultid=2623100&queryid=192558"
},
{
id: "2623115",
    title: "Abdelrahman Mohammed - B ro7y fatah | عبدالرحمن محمد - بروحي فتاة mp3",
link: "http://songily.com/new/file//139735897.mp3",
image: "https://i1.sndcdn.com/artworks-000073619505-i94b1r-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=Abdelrahman Mohammed - B ro7y fatah | عبدالرحمن محمد - بروحي فتاة mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMzk3MzU4OTcubXAz&key=1de304b7abdf5a25ca22ea2c67667fe4&resultid=2623115&queryid=192558"
},
{
    id: "2623096",
    title: "أصابك عشق . عبدالرحمن محمد ومهاب عمر mp3",
    link: "http://songily.com/new/file//123071879.mp3",
    image: "https://i1.sndcdn.com/artworks-000064354991-r5vmzp-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=أصابك عشق . عبدالرحمن محمد ومهاب عمر mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjMwNzE4NzkubXAz&key=2336b55a053c6ec50c396e145f5a956a&resultid=2623096&queryid=192558"
},
{
id: "2623097",
    title: "عبدالرحمن محمد - روحي إليك mp3",
link: "http://songily.com/new/file//90093790.mp3",
image: "https://i1.sndcdn.com/artworks-000066320016-m9s8az-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - روحي إليك mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy85MDA5Mzc5MC5tcDM=&key=b33bb38d7eb9ffd42903e5cfe43ad79b&resultid=2623097&queryid=192558"
},
{
    id: "2623104",
    title: "Abdulrahman mohammed- عبدالرحمن محمد - ألم الهوا mp3",
    link: "http://songily.com/new/file//83332284.mp3",
    image: "https://i1.sndcdn.com/artworks-000042988395-wt1k1q-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman mohammed- عبدالرحمن محمد - ألم الهوا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy84MzMzMjI4NC5tcDM=&key=0ee955ffe3053329c775bd0ee72df0c7&resultid=2623104&queryid=192558"
},
{
id: "2623098",
    title: "عبدالرحمن محمد - يا مَن إليهِ المُشتكى والمفزعُ mp3",
link: "http://songily.com/new/file//93354242.mp3",
image: "https://i1.sndcdn.com/artworks-000048673667-axmmr9-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - يا مَن إليهِ المُشتكى والمفزعُ mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy85MzM1NDI0Mi5tcDM=&key=db398c87a1ffb935d6d8eae684cebd36&resultid=2623098&queryid=192558"
},
{
    id: "2623101",
    title: "اغار عليها .. عبدالرحمن محمد .. كاملة mp3",
    link: "http://songily.com/new/file//161373071.mp3",
    image: "https://i1.sndcdn.com/artworks-000086924899-1we4k5-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=اغار عليها .. عبدالرحمن محمد .. كاملة mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xNjEzNzMwNzEubXAz&key=beebe2da5b20793b1720d15b449cdb4d&resultid=2623101&queryid=192558"
},
{
id: "2623102",
    title: "Abdulrahman Mohammed Mohab Omer - Craziness مهاب عمر و عبدالرحمن محمد - أصابك عشق mp3",
link: "http://songily.com/new/file//123030132.mp3",
image: "https://i1.sndcdn.com/artworks-000064332152-x17rfn-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed Mohab Omer - Craziness مهاب عمر و عبدالرحمن محمد - أصابك عشق mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjMwMzAxMzIubXAz&key=e23cdab9e35a17ecc342313c77911fdc&resultid=2623102&queryid=192558"
},
{
    id: "2623103",
    title: "Abdulrahman Mohammed Mohab Omer - Lama Talakayna مهاب عمر و عبدالرحمن محمد - لما تلاقينا mp3",
    link: "http://songily.com/new/file//111300167.mp3",
    image: "https://i1.sndcdn.com/artworks-000058182203-4ur92y-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed Mohab Omer - Lama Talakayna مهاب عمر و عبدالرحمن محمد - لما تلاقينا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMTEzMDAxNjcubXAz&key=2db84c4ff07ea6944f7f7a301159b90c&resultid=2623103&queryid=192558"
},
{
id: "2623105",
    title: "قولوا لها .. عبدالرحمن محمد mp3",
link: "http://songily.com/new/file//89913937.mp3",
image: "https://i1.sndcdn.com/artworks-000046708156-9ehx0e-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=قولوا لها .. عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy84OTkxMzkzNy5tcDM=&key=a5c9b4c7340e67698699144eae840ca2&resultid=2623105&queryid=192558"
},
{
    id: "2623106",
    title: "عبدالرحمن محمد - أصابك عشق mp3",
    link: "http://songily.com/new/file//122951350.mp3",
    image: "https://i1.sndcdn.com/artworks-000064290172-7gy1pr-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=عبدالرحمن محمد - أصابك عشق mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjI5NTEzNTAubXAz&key=f7cd09060784f515becf496ee1f00c46&resultid=2623106&queryid=192558"
},
{
id: "2623107",
    title: "حبيتك انا عبدالرحمن محمد جديد mp3",
link: "http://songily.com/new/file//126343097.mp3",
image: "https://i1.sndcdn.com/artworks-000066189133-an83h2-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=حبيتك انا عبدالرحمن محمد جديد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMjYzNDMwOTcubXAz&key=aeb7866b57cc5122028a78c1fc69dbad&resultid=2623107&queryid=192558"
},
{
    id: "2623108",
    title: "ولمَّا بَـدا لِــي | عبدالرحمن محمد mp3",
    link: "http://songily.com/new/file//132807539.mp3",
    image: "https://i1.sndcdn.com/artworks-000069772372-00dgxd-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=ولمَّا بَـدا لِــي | عبدالرحمن محمد mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xMzI4MDc1MzkubXAz&key=516aed91a5e9ac5e0127c6a81dc9c6e7&resultid=2623108&queryid=192558"
},
{
id: "2623109",
    title: "Abdulrahman Mohammed - Tomorrow عبدالرحمن محمد - بكره mp3",
link: "http://songily.com/new/file//165762096.mp3",
image: "https://i1.sndcdn.com/artworks-000089765564-gl9h0n-large.jpg",
filename: "",
queryId: "192558",
downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman Mohammed - Tomorrow عبدالرحمن محمد - بكره mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xNjU3NjIwOTYubXAz&key=60255aa2778479549ef55c2bcfe14638&resultid=2623109&queryid=192558"
},
{
    id: "2623110",
    title: "Abdulrahman MohamedBTB | عبدالرحمن محمد - حبيبى على الدنيا mp3",
    link: "http://songily.com/new/file//185097793.mp3",
    image: "https://i1.sndcdn.com/artworks-000102697409-44j03j-large.jpg",
    filename: "",
    queryId: "192558",
    downloadUrl: "http://trevx.com/download.php?songTitle=Abdulrahman MohamedBTB | عبدالرحمن محمد - حبيبى على الدنيا mp3&fileloc=aHR0cDovL3NvbmdpbHkuY29tL25ldy9maWxlLy8xODUwOTc3OTMubXAz&key=36334a78a9d6a083994c575e2ce5cea2&resultid=2623110&queryid=192558"
}];