// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    function handleExternalURLs() {
        //         Handle click events for all external URLs
        if (device.platform.toUpperCase() === 'ANDROID') {
            $(document).on('click', 'a[href^="http"]', function (e) {
                var url = $(this).attr('href');
                navigator.app.loadUrl(url, { openExternal: true });
                e.preventDefault();
            });
        }
        else if (device.platform.toUpperCase() === 'IOS') {
            $(document).on('click', 'a[href^="http"]', function (e) {
                var url = $(this).attr('href');
                window.open(url, '_system');
                e.preventDefault();
            });
        }
        else {
            // Leave standard behaviour
        }
    }

    var admobid = {};
    var firstTimeLoaded = false;
    var adshown = false;
    if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
        admobid = {
            banner: 'ca-app-pub-9449306347745476/1384235344', // or DFP format "/6253334/dfp_example_ad"
            interstitial: 'ca-app-pub-xxx/yyy'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
        admobid = {
            banner: 'ca-app-pub-xxx/zzz', // or DFP format "/6253334/dfp_example_ad"
            interstitial: 'ca-app-pub-xxx/kkk'
        };
    } else { // for windows phone
        admobid = {
            banner: 'ca-app-pub-xxx/zzz', // or DFP format "/6253334/dfp_example_ad"
            interstitial: 'ca-app-pub-xxx/kkk'
        };
    }
    function createAndShowBanner() {
        if (!AdMob) return;
        AdMob.createBanner({
            adId: admobid.banner,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true,
            success: function () {
                adshown = true;
            },
            error: function () {
                adshown = false;
            }
        });
    
    }
    function showBanner() {
        if(AdMob) AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    }
    function hideBanner() {
        if (AdMob)  AdMob.hideBanner();
    }
    function removeBanner() {
        if (AdMob)  AdMob.removeBanner();
    }
    

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.

        // Mock device.platform property if not available
        if (!window.device) {
            window.device = { platform: 'Browser' };
        }
        handleExternalURLs();

        
        createAndShowBanner();
        
    };

    function onPause() {
        //removeBanner();
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        createAndShowBanner();
        // TODO: This application has been reactivated. Restore application state here.
    };


    //**************************
    
    var reloadApp = function () {
        window.location.reload(true);
        //if (!adshown) {
        //    setTimeout(function () {
        //        createAndShowBanner();
        //    }, 5000);
        //}
    }
    var loadFeedFromGoogle = function (url, num, callback) {
        if (google.feeds) {
            var feed = new google.feeds.Feed(url);
            feed.includeHistoricalEntries();
            if (!num) num = 4;
            feed.setNumEntries(num);
            if (typeof (callback) === 'function') {
                try{
                    feed.load(callback);
                }
                catch (e) {
                    $('#console').text("Network Error");
                }
            }
        }
        else {

            try {
                setTimeout(function () {
                    reloadApp();
                }, 5000)
                $('#console').text("Reloading..");
            }
            catch (e) { }
        }
    }
        // var callback_function = function (result) {
        //     if (!result.error) {
       

    //***************************

    var myApp = angular.module('app', ['onsen', 'ngSanitize']);
    
    myApp.directive('backImg', function () {
        return function (scope, element, attrs) {
            var url = attrs.backImg;
            element.css({
                'background-image': 'url(' + url + ')',
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            });
        };
    });
 
    var fulltextfeedAPI = 'http://www.fulltextrssfeed.com/'; // use by appending rss url like: http://www.fulltextrssfeed.com/www.theverge.com/rss/full.xml
       

    myApp.controller('feed-controller', function ($scope, programDatabase, $filter) {

        $scope.feeds = [];
        $scope.feedsProviderTitle = '';
        $scope.feedsProviderDesc = '';
        $scope.feedsProviderWebsite = '';

        $scope.currentFeedIndex = 0;
        $scope.currentURL = '';
        $scope.defaultURL = "https://aeon.co/feed.rss";
        $scope.loadSuccess = false;
        var allFeedPageLoaded = false;
        
        $scope.carouselReadItems = [];// collection of feeds to be read in full screen
        $scope.carouselShowReadIndex = 0;
        $scope.layoutClass = "one-column-five-row";

        $scope.carouselItems = [];// collection of many corouselFeeds index
        $scope.noOfFeedPerItem = 6;
        var carouselFeeds = [];// collection of 5 feeds index
        
        var currentResourceIndex = 0;// Aeon
        $scope.isCurrentFavorite = false;
        $scope.exploreMenuCategories = [];
        
        //USER*******************
        var uTop = [];
        var uAllFeed = [];
        var uFavorite = [];
        var uLastFeedURL = '';
        var uCategory = [];
        var uLastTimeDataCollected = 0;
        if (store_js.enabled) {
            uTop = store_js.get('uTop');
            if (!uTop) uTop = [];
            uAllFeed = store_js.get('uAllFeed');
            if (!uAllFeed) uAllFeed = [];
            uFavorite = store_js.get('uFavorite');
            console.log(uFavorite);
            if (!uFavorite) uFavorite = [];
            uLastFeedURL = store_js.get('uLastFeedURL');
            if (!uLastFeedURL) uLastFeedURL = $scope.defaultURL;
            uCategory = store_js.get('uCategory');
            if (!uCategory) uCategory = [];
            uLastTimeDataCollected = store_js.get('uLastTimeDataCollected');
            console.log('ulast time stored', uLastTimeDataCollected);
        }
        
        $scope.searchFilterBy = function (str) {
            $scope.filterFeedResourcesBy(str);
            menu.setMenuPage('search.html');
        }
        $scope.toggleFavorite = function () {
            
            if ($scope.isCurrentFavorite) {
                $scope.isCurrentFavorite = false;
                $scope.feedResources[currentResourceIndex].fav = '';
                for (var i = 0; i < uFavorite.length; i++) {
                    if (uFavorite[i].name == $scope.feedResources[currentResourceIndex].name) {
                        uFavorite.splice(i, 1);
                    }
                }
            }
            else {
                $scope.isCurrentFavorite = true;
                console.log(currentResourceIndex, $scope.feedResources[currentResourceIndex].name)
                uFavorite.push($scope.feedResources[currentResourceIndex].name);
                $scope.feedResources[currentResourceIndex].fav = 'favorite';
            }
            storejsSave('uFavorite', uFavorite);
        }
        //USER/******************

        $scope.addCarouselItem = function (toEnd) {
                       
            if (toEnd) {
                var _lay = 'one-column-six-row';
                //if ($scope.noOfFeedPerItem == 5) _lay = 'one-column-five-row';
                if ($scope.noOfFeedPerItem == 6) _lay = 'one-column-six-row';
                if (ons.orientation.isLandscape() && $scope.noOfFeedPerItem == 6) _lay = 'two-column-three-row';
                $scope.carouselItems.push({ feeds: carouselFeeds, layout: _lay, id: $scope.carouselItems.length });
                
            }
            else {
                //$scope.carouselItems.unshift({ feeds: carouselFeeds });
            }
            
            
        }
        var storejsSave= function(key, val){
            if(store_js.enabled) store_js.set(key, val);
            
        }
        var setupReadMode = function () {
            //store_js.clear();
            $scope.carouselReadItems.length = 0;

            for (var i = 0; i < $scope.feeds.length ; i++) {
                $scope.carouselReadItems.push(i);
            }
            $scope.carouselShowReadIndex = $scope.currentFeedIndex;

        }
        $scope.readFeed = function (idx) {
            $scope.currentFeedIndex = idx;
            setupReadMode();
            
            myNavigator.pushPage("read-feed.html", {animation:'none'});
        }
        $scope.carouselsReadScroll = function (e) {
            //console.log('activeindex', e.activeIndex, 'size', $scope.carouselItems.length, $scope.carouselItems);
            if (e.activeIndex === 0) {
                //$scope.addCarouselItem(false);
            }
            else if (e.activeIndex === $scope.carouselItems.length - 1) {
                //$scope.addCarouselItem(true);
            }
        }
        $scope.popReadCarouselPage = function(){
            carouselElm.setActiveCarouselItemIndex(Math.floor((carouselReadElm.getActiveCarouselItemIndex()) / $scope.noOfFeedPerItem), { animation: 'none' });
            myNavigator.popPage();

        }

        $scope.reset = function () {
            
            trimExtraHeight(true);
                
            //$scope.feeds.length = 0;
        }

        var sanitizeReadHTML = function (must) {
            var _$htmlDesc = $('.feed-htmlDesc');
            if (!_$htmlDesc.length && must) {
                console.log('elms not available');
                setTimeout(function () {
                    sanitizeReadHTML(false);
                }, 200);

                return;
            }

            _$htmlDesc.each(function () {
                $(this).find('img').each(function () {
                    if (!(this.naturalWidth > 100 || this.naturalHeight > 100)) {// may be icon
                        $(this).remove();
                        console.log('found icon');
                    }
                });
            })

        };
        var trimExtraHeight = function (must) {
            var _$textDesc = $('.layout').find('.feed-textDesc');
            if (!_$textDesc.length && must) {
                console.log('elms not available');
                setTimeout(function () {
                    trimExtraHeight(false);
                }, 200);

                return;
            }
                
            _$textDesc.each(function (index) {
                if ($(this).is(':visible') == false) return;
                var ph = $(this).parent().height();//parent height
                var lh = parseFloat($(this).css('line-height').replace('px', ''));
                var top = $(this).position().top;// top position wrt parent

                var esth = ph - top;//estimated height of textDesc
                var exth = esth % lh;// extra height
                var reqh = esth - exth;// required height
                $(this).height(reqh);
                console.log('trimming extra spaces');

            });
        }

        ons.ready(function () {
            
            setImmediate(function () {
                $scope.init();

                //if (carouselReadElm) {
                //    carouselReadElm.on('postchange', function (e) {
                //        $scope.$apply(function () {
                //            $scope.carouselsScroll(e);
                //        });
                //        setImmediate(function () {
                //            carouselReadElm.refresh();
                //        });
                //    });
                //}

                                
                $(document).on('pageinit', '#read-feed-page', function () {
                    console.log('read-feed-page');
                    setImmediate(function () {
                        setTimeout(function () {
                            sanitizeReadHTML(true);
                            carouselReadElm.setActiveCarouselItemIndex($scope.carouselShowReadIndex, { animation: "none" });
                            carouselReadElm.refresh();
                        }, 10)

                    });
                    //because starus bar was being shown every time we try searching something
                    StatusBar.hide();
                    //hideBanner();

                });

                $(document).on('pageinit', '#all-feed-page', function () {
                    console.log('#all-feed-page');
                    setTimeout(function () {
                        trimExtraHeight(true);
                        carouselElm.refresh();
                        StatusBar.hide();
                        allFeedPageLoaded = true;
                    }, 40);
                    if (firstTimeLoaded == false) {
                        createAndShowBanner();
                        firstTimeLoaded = true;
                    }
                });

                

                
                //ons.createPopover('popover.html')
                //.then(function (popover) {
                //    $scope.menuPopover = popover;
                //    $scope.showMenuPopover = function (e) {
                //        $scope.popover.show(e);
                //    };
                //});
                              
            });
        });
            

        
        var setPageAllFeed = function () {
            //set heart if favorite
            if ($scope.feedResources[currentResourceIndex].fav && $scope.feedResources[currentResourceIndex].fav == 'favorite') {
                $scope.isCurrentFavorite = true;
            }
            else {
                $scope.isCurrentFavorite = false;
            }
            
            menu.setMainPage('all-feed.html');
        }
        var clearCurrentData = function(){
            $scope.feeds.length = 0;
            $scope.currentFeedIndex = 0;

            $scope.carouselReadItems.length = 0;
            $scope.carouselShowReadIndex = 0;
            
            $scope.carouselItems.length = 0;
            carouselFeeds.length = 0;
        }
        $scope.loadRSSFrom = function (url, index) {
            if(index > -1)currentResourceIndex = index;// could be -1
            clearCurrentData();
            $scope.currentURL = url;
            storejsSave('uLastFeedURL', url);
            downloadFeed();
        }

        var gotNewFeeds = function (fds) {
            for (var i = 0; i < fds.length ; i++) {
                var feed = {
                    title: '',
                    author: '',
                    publishedDate: '',
                    contentSnippet: '',
                    link: '',
                    htmlDesc: '',
                    textDesc: '',
                    tags: '',
                    img_url: ''
                }

                for (var key in feed) {
                    if (fds[i].hasOwnProperty(key)) {
                        var val = fds[i][key];
                        if (val && typeof (val) == 'string') {
                            feed[key] = val;
                        }
                    }
                }

                $scope.feeds.push(feed);            
                carouselFeeds.push($scope.feeds.length-1);

                if (carouselFeeds.length >= $scope.noOfFeedPerItem) {
                    $scope.addCarouselItem(true);
                    carouselFeeds = [];
                }
                if (i == fds.length-1 && carouselFeeds.length) {//extra item which donot fall into a complete set
                    $scope.addCarouselItem(true);
                    carouselFeeds = [];
                }
            }
            
        }


        var downloadFeed = function () {
      
            var callback_function = function (result) {
                if (!result.error) {
                    var feeds = [];
                    $scope.feedsProviderTitle = result.feed.title;
                    $scope.feedsProviderWebsite = result.feed.link;
                    $scope.feedsProviderDesc = result.feed.description;

                    for (var i = 0; i < result.feed.entries.length; i++) {
                        var entry = result.feed.entries[i];
                        var TAT = '';//title author time
                        if(entry.title) TAT = "<div class='feed-htmlTitle'>" + entry.title + "</div>";
                        if (entry.author && entry.publishedDate) TAT = TAT + "<span class='author-time' style='margin-bottom:1rem'>by " + entry.author + "  |  " + (new Date(entry.publishedDate)).toLocaleDateString()  + "</span><br>";
                        else if(entry.author)TAT = TAT + "<span class='author-time' style='margin-bottom:1rem'>by " + entry.author + "</span><br>";
                        else if(entry.publishedDate)TAT = TAT + "<span class='author-time' style='margin-bottom:1rem'>" + (new Date(entry.publishedDate)).toDateString()  + "</span><br>";
                        

                        var htmlDesc = TAT + entry.content;
                        
                        var feed = {
                            title: entry.title,
                            author: entry.author,
                            publishedDate: entry.publishedDate,
                            contentSnippet: entry.contentSnippet,
                            link: entry.link,
                            htmlDesc: htmlDesc,
                            textDesc: htmlDecode(entry.content),//entry.content.stripTags(),//entry.contentSnippet
                            tags: '',
                            img_url: entry.content.extractImgUrl()
                        }
                        feeds.push(feed);
                    }
                    gotNewFeeds(feeds);
                    $scope.loadSuccess = true;
                }
                else {
                    $scope.loadSuccess = false;
                    $('#console').text("failed to load... Trying to reload");
                    downloadFeed();
                    //setTimeout(function () { downloadFeed(); $('#console').text("failed downloading after 5 sec"); }, 5000);
                    //$('#console').text("failed");
                }

                //At last
                $('#console').text("Feed loaded");
                setPageAllFeed();
                
            }
            loadFeedFromGoogle($scope.currentURL, 25, callback_function);

        }
        var beginPageLoad = function () {
            if (uLastFeedURL && uLastFeedURL.length) $scope.loadRSSFrom(uLastFeedURL, -1);
            else $scope.loadRSSFrom($scope.defaultURL, -1);
        }

        $scope.removeLocalCache = function () {
            if (store_js.enabled) store_js.clear();
        }
        $scope.updateDataFromCloud = function () {
            if (fb_rss_top) {
                fb_rss_top.once('value', function (snapshot) {
                    programDatabase.populateFeedSearchResources(snapshot.val(), uFavorite, 'top');
                    console.log('uTop', snapshot.val());
                    if (store_js.enabled) {
                        store_js.set('uTop', snapshot.val());
                    }
                })
            }
            if (fb_rss_category) {
                fb_rss_category.once('value', function (snapshot) {
                    console.log('uCategory', snapshot.val());
                    var values = snapshot.val();
                    for (var key in values) {
                        if (typeof (values[key]) == 'string') {
                            $scope.exploreMenuCategories.push(values[key]);
                        }
                    }
                    if (store_js.enabled) {
                        store_js.set('uCategory', snapshot.val());
                    }
                })
            }
            if (fb_rss_allfeed) {
                fb_rss_allfeed.once('value', function (snapshot) {
                    console.log('uAllFeed', snapshot.val());
                    programDatabase.populateFeedSearchResources(snapshot.val(), uFavorite, 'allfeed');
                    if (store_js.enabled) {
                        store_js.set('uAllFeed', snapshot.val());
                    }
                })
            }
            
        }
        $scope.init = function () {
            var shouldiupdate = false;
            var _fetch = true;
            var today = (new Date).getDate();
            //console.log('today - uLastTimeDataCollected', today - uLastTimeDataCollected);
            if (uLastTimeDataCollected && today - uLastTimeDataCollected < 1) _fetch = false;
            if (!uTop || !uCategory || !uAllFeed || (uTop.length < 10 )) _fetch = true;
            
            if (_fetch) {
                if (fb_rss_top) {
                    fb_rss_top.once('value', function (snapshot) {
                        programDatabase.populateFeedSearchResources(snapshot.val(), uFavorite, 'top');
                        console.log('uTop',snapshot.val());
                        if (store_js.enabled) {
                            store_js.set('uTop', snapshot.val());
                        }
                    })
                }
                if (fb_rss_category) {
                    fb_rss_category.once('value', function (snapshot) {
                        console.log('uCategory', snapshot.val());
                        var values = snapshot.val();
                        for (var key in values) {
                            if (typeof (values[key]) == 'string') {
                                $scope.exploreMenuCategories.push(values[key]);
                            }
                        }
                        if (store_js.enabled) {
                            store_js.set('uCategory', snapshot.val());
                        }
                    })
                }
                if (fb_rss_allfeed) {
                    fb_rss_allfeed.once('value', function (snapshot) {
                        console.log('uAllFeed', snapshot.val());
                        programDatabase.populateFeedSearchResources(snapshot.val(), uFavorite, 'allfeed');
                        if (store_js.enabled) {
                            store_js.set('uAllFeed', snapshot.val());
                        }
                    })
                }
                uLastTimeDataCollected = today;
                if (store_js.enabled) store_js.set('uLastTimeDataCollected', uLastTimeDataCollected);
            }
            else {// use stored values
                if(uTop) programDatabase.populateFeedSearchResources(uTop, uFavorite, 'top');
                if(uCategory){
                    for (var key in uCategory) {
                        if (typeof (uCategory[key]) == 'string') {
                            $scope.exploreMenuCategories.push(uCategory[key]);
                        }
                    }
                }
                if(uAllFeed) programDatabase.populateFeedSearchResources(uAllFeed, uFavorite, 'allfeed');
            }

            beginPageLoad();

        }


        $scope.faviconAPI = 'http://www.google.com/s2/favicons?domain=';// use it by appending domain like: http://www.google.com/s2/favicons?domain=fb.com   gives 16 X 16 image
        $scope.feed_search = '';
        $scope.feedResources = [];
        
        $scope.feedTags = [];

        $scope.feedTags = programDatabase.getFeedTags();
        $scope.feedResources = programDatabase.getFeedResources();

        $scope.filterFeedResourcesBy = function (filter) {
            $scope.feed_search = filter;
        };
        
    });


    myApp.factory('programDatabase', function ($filter) {
        var feedTags = ['Philosophy', 'Science', 'Tech', 'Business', 'Design'];
 
        var feedResources = [
            { name: 'Aeon', rss_url: 'https://aeon.co/feed.rss', website: 'www.aeon.co', feedTag: 'Philosophy', fav:'favorite' },// must default

            //{ name: 'The Verge', rss_url: 'http://www.theverge.com/rss/full.xml', website: 'www.theverge.com', feedTag: 'Tech' },
            //{ name: 'Engadget', rss_url: 'http://www.engadget.com/rss.xml', website: 'www.engadget.com', feedTag: 'Tech' },
            //{ name: 'VentureBeat', rss_url: 'http://venturebeat.com/feed/', website: 'www.venturebeat.com', feedTag: 'Business' },
            //{ name: 'SethGodin', rss_url: 'http://feeds.feedblitz.com/sethsblog&x=1', website: 'www.feedblitz.com', feedTag: 'Business' },
            //{ name: 'Co.Design', rss_url: 'http://feeds.feedburner.com/fastcodesign/feed', website: 'www.fastcodesign.com', feedTag: 'Design' },
            //{ name: 'Fubiz', rss_url: 'http://www.fubiz.net/en/feed/', website: 'www.fubiz.net', feedTag: 'Design' },
            //{ name: 'Space.com', rss_url: 'http://www.space.com/home/feed/site.xml', website: 'www.space.com', feedTag: 'Science' },
            //{ name: 'Scientific American Content', rss_url: 'http://www.sciam.com/xml/sciam.xml', website: 'www.sciam.com', feedTag: 'Science' },
            //{ name: 'CNN', rss_url: 'http://rss.cnn.com/rss/cnn_topstories.rss', website: 'www.cnn.com', feedTag: 'News' },
            //{ name: 'New York Times', rss_url: 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml', website: 'www.nytimes.com', feedTag: 'News' },
            //{ name: 'Mashable', rss_url: 'http://mashable.com/feed/', website: 'http://mashable.com', feedTag: 'Information' },
            
            
        ];
        
        return {
            getFeedTags: function () {
                return feedTags;
            },
            getFeedResources: function () {
                return feedResources;
            },
            populateFeedSearchResources: function (values, uFavorite, _cat) {
                console.log('value', values);
                for (var key in values) {
                    var val = values[key];
                    val.fav = '';
                    if(typeof(_cat) == 'string') val[_cat] = _cat;
                    for (var i = 0; i < uFavorite.length; i++) {
                        if (val.name == uFavorite[i]) {
                            val.fav = 'favorite';
                            break;
                        }
                    }
                    feedResources.push(val);
                    if (feedTags.indexOf(val.feedTag) > -1);
                    else feedTags.push(val.feedTag);
                }
                feedResources = $filter('orderBy')(feedResources, 'name');
            },
        };
    });

    $(function () {
        String.prototype.stripTags = function () {
            var rtag = /<.*?[^>]>/g;
            return this.replace(rtag, '');
        }

        String.prototype.extractImgUrl = function () {

            var img_src = $('<div>' + this + '</div>').find('img').attr('src');
            if (img_src && img_src.length > 6) return img_src;
            return "no-image";

        }
        window.htmlDecode = function (value) {
            return $('<div/>').html(value).text();
        }

    });

    //******************ends here*****************
})();


