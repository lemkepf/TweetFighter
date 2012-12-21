var maxPageNumber = 3;
var numberPerPage = 100;
var tweetVariance = 50;
var timer;

var graphWinnerColor = { colors: ["#00CC00", "#CCFFCC"] };
var graphLooserColor = { colors: ["#CC0000", "#FFCCCC"] };

var graphOptions = {
    series: {
        lines: { show: false },
        points: { show: false }
    },
    legend: {
        show: false
    },
    grid: {
        show: false,
        margin: {
            top: "1px",
            left: "1px",
            bottom: "1px",
            right: "1px",
        }
    }
};

$(document).ready(function () {

    // This is a simple viewmodel - JavaScript that defines the data and behavior of the UI
    // Class to represent one side of a FightEntry 
    var FightEntry = function (searchTermIn) {
        var self = this;
        self.searchTerm = ko.observable(searchTermIn);
        self.totalTweets = ko.observable(0);
        self.oldestTweetDate = ko.observable(new Date());
        self.tweetsPerMinute = ko.observable(0);
        self.loading = ko.observable(false);
        self.winner = ko.observable(false);

        self.encodedSearchTerm = ko.computed(function () {
            return encodeURIComponent(self.searchTerm());
        });

        // Operations
        self.loadTweetStatistics = function () {
            //get tweet statistics for this entry. 
            self.loading(true);
            //reset stats
            self.totalTweets(0);
            self.winner(false);
            self.oldestTweetDate(new Date());
            self.tweetsPerMinute(0);

            var twitterHelper = new TwitterSearchHelper();
            twitterHelper.getTotalTweets(self.encodedSearchTerm(), self.totalTweets, self.oldestTweetDate, self.loading);
        };

        self.calculateTweetsPerMinute = function () {
            //calculate tweets per minute. 
            //get millisecond difference between now and the oldest date. 
            var dateDiff = Math.abs(new Date() - self.oldestTweetDate());
            var tweetPerMillis = (self.totalTweets() / dateDiff);

            self.tweetsPerMinute(Math.floor((tweetPerMillis * 1000 * 60) * 10000) / 10000);

        };
    }

    //This is our main view model. It holds all the important information. 
    var TweetFightViewModel = function () {
        var self = this;
        self.firstEntry = ko.observable(new FightEntry("openshift")); //set some default terms
        self.secondEntry = ko.observable(new FightEntry("azure"));
        self.dateSubmitted = new Date();
        self.fightHistory = ko.observableArray();

        // Compare the two terms listed
        self.compareTerms = function () {
            //validate all is ok and do searches
            if (isBlank(self.firstEntry().searchTerm()) || isBlank(self.firstEntry().searchTerm())) {
                alert("You must enter a term in both fields.");
                return;
            }

            self.dateSubmitted = new Date();

            self.firstEntry().loadTweetStatistics();
            self.secondEntry().loadTweetStatistics();

            //setup timer to see if they are both done. 
            timer = setInterval(self.populateView, 10);
        };

        self.populateView = function () {
            if (self.firstEntry().loading() == false && self.secondEntry().loading() == false) {
                window.clearInterval(timer);
                var maxResults = (maxPageNumber * numberPerPage) - tweetVariance;

                //Scenario 1: Both results hit their max results. 
                if (self.firstEntry().totalTweets() > maxResults && self.secondEntry().totalTweets() > maxResults) {
                    //just calculate tweets per minute for each. 

                } else if (self.firstEntry().totalTweets() < maxResults && self.secondEntry().totalTweets() < maxResults) {
                    //Scenario 2: Both results are less than max. 
                    //use oldest date and calculate tweets per minute.

                    if (self.firstEntry().oldestTweetDate().getTime() < self.secondEntry().oldestTweetDate().getTime()) {
                        self.secondEntry().oldestTweetDate(self.firstEntry().oldestTweetDate());
                    } else {
                        self.firstEntry().oldestTweetDate(self.secondEntry().oldestTweetDate())
                    }

                } else {
                    //Scenario 3: one has max results, one does not. 

                    //find one with max results
                    var maxEntry;
                    var minEntry;
                    if (self.firstEntry().totalTweets() > maxResults) {
                        //first one
                        maxEntry = self.firstEntry;
                        minEntry = self.secondEntry;
                    } else {
                        //second one
                        maxEntry = self.secondEntry;
                        minEntry = self.firstEntry;
                    }

                    if (maxEntry().oldestTweetDate().getTime() > minEntry().oldestTweetDate().getTime()) {
                        //Scenario 3.1: maxEntry date is sooner than minEntry date. 
                        //juse calculate each seperate. 

                    } else {
                        //Scenario 3.2: maxEntry date is older than minEntry date. 
                        //use max results date for both calculations. 
                        minEntry().oldestTweetDate(maxEntry().oldestTweetDate());
                    }
                }

                //calculate tweets per minute
                self.firstEntry().calculateTweetsPerMinute();
                self.secondEntry().calculateTweetsPerMinute();

                //find winner!
                var firstEntryColor, secondEntryColor;
                firstEntryColor = graphLooserColor;
                secondEntryColor = graphLooserColor;
                if (self.firstEntry().tweetsPerMinute() > self.secondEntry().tweetsPerMinute()) {
                    self.firstEntry().winner(true);
                    firstEntryColor = graphWinnerColor;
                } else if (self.secondEntry().tweetsPerMinute() > self.firstEntry().tweetsPerMinute()) {
                    self.secondEntry().winner(true);
                    secondEntryColor = graphWinnerColor;
                } else {
                    //tie
                    self.secondEntry().winner(true);
                    self.firstEntry().winner(true);
                    secondEntryColor = graphWinnerColor;
                    firstEntryColor = graphWinnerColor;
                }

                //save it to the history
                self.addToHistory();

                //Put the data into a graph to display green/red based on who wins. 
                $.plot($("#graphPlaceholder"), [
                    {
                        data: [[1, self.firstEntry().tweetsPerMinute()]],
                        bars: {
                            show: true,
                            lineWidth: 0,
                            fill: true,
                            fillColor: firstEntryColor
                        }
                    },
                    {
                        data: [[3, self.secondEntry().tweetsPerMinute()]],
                        bars: {
                            show: true,
                            lineWidth: 0,
                            fill: true,
                            fillColor: secondEntryColor
                        }
                    }

                ], graphOptions);
            };

            self.addToHistory = function () {
                //save for postarity using SignalR. 
                //parse the existing Knockout objects into JSON Strings, then create a plain JavaScript object out of it. 
                //This is mainly a limitation of SignalR in that it needs plain JSON, not KnockOut objects. 
                var viewModelInJson = ko.toJSON(this);
                viewModelInJson = jQuery.parseJSON(viewModelInJson)
                clipHub.server.addFightEntry(viewModelInJson);
            };

            self.sortHistory = function (a, b) {
                a = new Date(a.dateSubmitted());
                b = new Date(b.dateSubmitted());
                return a > b ? -1 : a < b ? 1 : 0;
            };
        }
    }

    // Activates knockout.js for the view binding
    var tweetFightModel = new TweetFightViewModel();
    ko.applyBindings(tweetFightModel);

    ko.bindingHandlers.date = {
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            var datetime = new Date(value());
            $(element).text(datetime.toLocaleString());
        }
    };

    //Realtime Communication via SignalR
    var clipHub; //holds global reference to our SignalR hub

    // Proxy created on the fly based on the script include above. 
    $.connection.hub.logging = true;

    clipHub = $.connection.tweetFightHub;

    // Declare a function on the chat hub so the server can invoke it          
    clipHub.client.newFightEntry = function (newTweetFight) {
        //add to knockout history view model array
        var viewModel = ko.mapping.fromJS(newTweetFight);
        tweetFightModel.fightHistory.push(viewModel);
        tweetFightModel.fightHistory.sort(tweetFightModel.sortHistory)
    };

    clipHub.client.loadHistory = function (previousFights) {
        //add to knockout view model array
        for (var i = 0; i < previousFights.length - 1; i++) {
            var viewModel = ko.mapping.fromJS(previousFights[i]);
            tweetFightModel.fightHistory.push(viewModel);
        }
        tweetFightModel.fightHistory.sort(tweetFightModel.sortHistory)
    };

    $.connection.hub.start()
        .fail(function () {
            alert("Could not connect to backend storage!");
        });


});

//Helper functions
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

//Twitter search api helper
function TwitterSearchHelper() {
    var self = this;
    self.getNextPageHelper = new RegExp(/page=([^&]+)/);
    self.url = "http://search.twitter.com/search.json?result_type=recent&q=";
    self.searchTerm;
    self.startPageNumber = 1;
    self.tweetData;
    self.totalTweets;
    self.oldestTweetDate;
    self.loading;

    //Main function gather search term, and the reference to the total tweets and oldest date. 
    self.getTotalTweets = function (searchTermIn, totalTweetsRef, oldestTweetDateRef, loadingRef) {

        self.searchTerm = searchTermIn;
        self.totalTweets = totalTweetsRef;
        self.oldestTweetDate = oldestTweetDateRef;
        self.loading = loadingRef;

        //go ahead and get the total tweets for page 1.  
        self.getTotalTweetsPerPage(self.startPageNumber);

        return;
    };

    self.getTotalTweetsPerPage = function (pageNumber) {
        //this get's the tweets per page. It is a recursive function. 

        $.getJSON(self.url + self.searchTerm + '&rpp=' + numberPerPage + '&page=' + pageNumber + '&callback=?',
          function (tweetData) {
              if (tweetData.results != null && tweetData.results.length != 0 && pageNumber <= maxPageNumber) {
                  //Parse the results of the tweet stream. 
                  self.parseTweetData(tweetData);
              }
              else {
                  //no more data, all done. 
                  self.loading(false);
                  return;
              }
          }
        );
    };

    self.parseTweetData = function (tweetData) {
        var currentTweets = tweetData.results;
        self.totalTweets(self.totalTweets() + currentTweets.length);

        //get oldest date
        for (var i = 0; i < currentTweets.length - 1; i++) {
            var tweetDate = currentTweets[i].created_at;

            if (tweetDate != null) {
                var currentTweetDate = new Date(Date.parse(tweetDate));

                //compare to existing oldest date
                if (currentTweetDate.getTime() < self.oldestTweetDate().getTime()) {
                    self.oldestTweetDate(currentTweetDate);
                }
            }
        }

        var nextPageData = self.getNextPageHelper.exec(tweetData.next_page);
        if (nextPageData == null) {
            //no more pages, moving on
            self.loading(false);
            return;
        }
        var nextPageNumber = nextPageData[1];
        self.getTotalTweetsPerPage(nextPageNumber);
    };
}