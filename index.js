var through = require("through2");
var from = require("from2");
var gutil = require("gulp-util");
var request = require("request");
var progress = require("request-progress");
var pretty = require("pretty-hrtime");
var col = gutil.colors;
var log = gutil.log;

module.exports = function(urls) {
  urls = typeof urls === 'string' ? [urls] : urls;
  urlIndex = 0;

  function getFile(url) {
    if (typeof url === "object") {
      fileName = url.file;
      url = url.url;
    } else {
      fileName = url.split('/').pop();
    }

    var contents = through();

    var start = process.hrtime();
    log('Downloading', col.magenta(url) + '...');

    var r = request({
      url: url,
      encoding: null
    })
    .on('end', function() {
      var end = process.hrtime(start);
      log('Downloaded', col.magenta(url), 'after', col.magenta(pretty(end)));
    }).pipe(contents);

    return new gutil.File({
      path: fileName,
      contents: contents
    });
  }

  return from({
    objectMode: true
  }, function(size, next) {
    var i = 0;

    while (urlIndex < urls.length && i < size) {
      url = urls[urlIndex];
      next(null, getFile(url));

      ++i;
      ++urlIndex;
    }

    if (urlIndex == urls.length) {
      next(null, null);
    }
  });
};

