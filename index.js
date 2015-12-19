'use strict';

var through = require("through2");
var from = require("from2");
var gutil = require("gulp-util");
var request = require("request");
var pretty = require("pretty-hrtime");
var merge = require("merge");
var col = gutil.colors;
var log = gutil.log;
var Error = gutil.PluginError;

function getFile(obj, options) {
  var contents = through();
  var file = new gutil.File({
    path: obj.file,
    contents: contents
  });

  // Request errors passed to file contents
  function emitError(e) {
    errored = true;
    contents.emit('error', new Error('gulp-download-stream', e));
  }

  // Request pipes to file contents
  var start = process.hrtime();
  var errored = false;
  log('Downloading', col.magenta(obj.url) + '...');
  var r = request(merge({
    url: obj.url,
    encoding: null
  }, options))
    .on('error', function(e) {
      emitError(e);
    })
    .on('response', function(response) {
      if (response.statusCode >= 400) {
        emitError(col.magenta(response.statusCode) + ' returned from ' + col.magenta(obj.url));
      }
    })
    .on('end', function(e) {
      if (!errored) {
        var end = process.hrtime(start);
        log('Downloaded', col.magenta(obj.url), 'after', col.magenta(pretty(end)));
      }
    })
    .pipe(contents)
    .on('error', function() {
      // Avoids "Unhandled stream error in pipe" messages.
      // gulp will still fail the containing task if there is
      // an error downloading
    });

  return file;
}



module.exports = function(urls, options) {

  options = options || {};
  
  // Canonicalise urls to array of objects
  urls = typeof urls === 'string' ? [urls] : urls;
  urls.forEach(function(url, i) {
    if (typeof url === 'string') {
      urls[i] = {
        url: url,
        file: url.split('/').pop(),
      };
    }
  });
  var urlIndex = 0;

  return from({
    objectMode: true
  }, function(size, next) {
    var i = 0;

    while (urlIndex < urls.length && i < size) {
      next(null, getFile(urls[urlIndex], options));

      ++i;
      ++urlIndex;
    }

    if (urlIndex == urls.length) {
      next(null, null);
    }
  });
};

