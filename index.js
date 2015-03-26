'use strict';

var express = require('express'),
    http = require('https'),
    FeedParser = require('feedparser');

var app = express(),
    port = process.env.PORT || 3030,
    NEWS_SITE_URL = 'https://news.google.com/news?ned=us&ie=UTF-8&oe=UTF-8&output=rss';

app.get('/', function (req, res) {
  //console.log('GET /');
  var keywords = decodeURIComponent(req.query.keywords),
      url = NEWS_SITE_URL + '&q=' + keywords,
      feedMeta, episodes = [];

  http.get(url, function(response) {
    response.pipe(new FeedParser({}))
    .on('error', function() {
      response.status(500).json({
        'message': 'HTTP failure while fetching feed'
      });
    }).on('meta', function(meta) {
      feedMeta = meta;
    }).on('readable', function() {
      var stream = this, item;

      while (item = stream.read()) {
        var ep = {
          'title': item.title,
          'mediaUrl': item.link,
          'publicationDate': item.pubDate
        };
        episodes.push(ep);
      }
    }).on('end', function() {
/*
      var result;
      result = {
        'feedName': feedMeta.title,
        'feedArtist': feedMeta['itunes:author']['#'],
        'website': feedMeta.link,
        'albumArt': {
          'url': feedMeta.image.url,
          'width': parseInt(feedMeta['rss:image'].width['#']),
          'height': parseInt(feedMeta['rss:image'].height['#'])
        },
        'episodes': episodes
      };

      res.json(result);
*/
      res.json(episodes);
    });
  });
});

// Start server
if (require.main === module) {
  console.log('Server listening on port %s', port);
  app.listen(port);
}

module.exports = app;
