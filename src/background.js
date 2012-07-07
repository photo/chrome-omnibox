var opOmniBox = (function() {
  var configs;
  var listeners;
  var utilities;
  var tags = [];

  // configs
  configs = {
    baseUrl: 'http://jmathai.openphoto.me'
  };

  // utilities
  utilities = {
    currentRequest: null,
    load: function () {
      var url = configs.baseUrl + "/tags/list.json";
      var req = new XMLHttpRequest();
      var result;
      req.open("GET", url, true);
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          var response = JSON.parse(req.responseText);

          if(response.code !== 200)
            return;

          result = response.result;
          for (i in result)
            tags.push(result[i]);
        }
      }
      req.send(null);
      return req;
    }
  };

  // listeners
  listeners = {
    onInputChanged: function(text, suggest) {
      if (text == '' || tags.length === 0) {
        if(text == '')
          chrome.omnibox.setDefaultSuggestion({description: 'Start typing tags to filter by.'});
        else
          chrome.omnibox.setDefaultSuggestion({description: 'We didn\'t find any tags to search through.'});
        return;
      }

      var results = [];
      var re = new RegExp("^"+text);
      var tag;
      for(i in tags) {
        tag = tags[i];
        if(tag.id.match(re)) {
          results.push({
            content: tag.id,
            description: "View " + tag.count + " photos tagged with " + tag.id
          });
        }
      }
      chrome.omnibox.setDefaultSuggestion({description: 'We found a total of ' + results.length + ' tags starting with ' + text + '.'});
      suggest(results);
    },
    onInputEntered: function(text) {
      var url = configs.baseUrl + "/photos/tags-" + text + "/list";
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.update(tab.id, {url: url});
      });
    }
  };

  return {
    init: function() {
      utilities.load();
      chrome.omnibox.onInputChanged.addListener(listeners.onInputChanged);
    }
  };
})();
opOmniBox.init();
