var baseUrl = 'http://jmathai.openphoto.me';
var currentRequest = null;

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    if (currentRequest != null) {
      currentRequest.onreadystatechange = null;
      currentRequest.abort();
      currentRequest = null;
    }

    if (text == '' || text == 'halp')
      return;

    currentRequest = search(text, function(response) {
      if(response.code !== 200) {
        // no tags 
        return;
      }
      var tags = response.result;
      var results = [];
      var description;
      var content;
      var tag;
      for (i in tags) {
        tag = tags[i];
        content = "View " + tag.count + " photos tagged with " + tag.id;
        results.push({
          content: tag.id,
          description: content
        });
      }
      suggest(results);
    });
  }
);

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Start typing tags to filter by'
  });
}

function search(query, callback) {
  var url = baseUrl + "/tags/list.json?search="+query;

  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.setRequestHeader("GData-Version", "2");
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      var response = JSON.parse(req.responseText);
      callback(response);
    }
  }
  req.send(null);
  return req;
}

function navigate(url) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, {url: url});
  });
}

chrome.omnibox.onInputEntered.addListener(function(text) {
  navigate(baseUrl + "/photos/tags-" + text + "/list");
});
