var through = require("through2");
var from = require("from2");
var gutil = require("gulp-util");
var request = require("request");
var pretty = require("pretty-hrtime");
var merge = require("merge");
var col = gutil.colors;
var log = gutil.log;
var Error = gutil.PluginError;

module.exports = function(urls, options) {
  urls = typeof urls === 'string' ? [urls] : urls;
  urlIndex = 0;

  options = options || {};

  function getFile(url) {
    if (typeof url === "object") {
      fileName = url.file;
      url = url.url;
    } else {
      fileName = url.split('/').pop();
    }

    var contents = through();

    function emitError(e) {
      errored = true;
      contents.emit('error', new Error('gulp-download-stream', e));
    }

    var start = process.hrtime();
    var errored = false;
    log('Downloading', col.magenta(url) + '...');
    var r = request(merge({
      url: url,
      encoding: null
    }, options))
      .on('error', function(e) {
        emitError(e);
      })
      .on('response', function(response) {
        if (response.statusCode >= 400) {
          emitError(col.magenta(response.statusCode) + ' returned from ' + col.magenta(url));
        }
      })
      .on('end', function(e) {
        if (!errored) {
          var end = process.hrtime(start);
          log('Downloaded', col.magenta(url), 'after', col.magenta(pretty(end)));
        }
      })
      .pipe(contents)
      .on('error', function() {
        // Avoids "Unhandled stream error in pipe" messages.
        // gulp will still fail the containing task if there is
        // an error downloading
      });

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

