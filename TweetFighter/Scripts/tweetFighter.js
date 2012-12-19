var getPage = new RegExp(/page=([^&]+)/);
var url = "http://search.twitter.com/search.json?result_type=recent&rpp=100&q=";
var search, page, pageTotal, tweets, loading;
var beforeCounter = "<b>";
var afterCounter = "</b>";
var totalTweets = 0;

function getTweets(search, page, pageTotal) {
    $.getJSON(url + search + '&page=' + page + '&callback=?',
      function (data) {
          if (data.results != null && data.results.length != 0 && page > pageTotal) {
              $('#pagesDone span').html(page);
              getData(data);
          }
          else {
              showTotal();
          }
      }
    );
}

function showTotal() {
    $('#totalTweets span').html(beforeCounter + totalTweets + afterCounter);
    $('#pagesDone span').html('0');
    totalTweets = 0;
    loading = false;
}

function getData(data) {
    tweets = data.results;
    page = getPage.exec(data.next_page);
    if (page == null) {
        showTotal();
        return;
    }
    page = page[1];
    totalTweets += tweets.length;
    getTweets(search, page, pageTotal);
}

function submitTerms() {
    $('#totalTweets span').html('');
    $('#pagesDone span').html('0');
    search = encodeURIComponent($('#firstTerm').prop('value'));
    page = 1;
    pageTotal = 100;
    if (search == '') {
        alert('Please enter search query');
        return;
    }
    loading = true;
    getTweets(search, page, pageTotal);
}