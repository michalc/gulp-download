'use strict';

var stream = require("stream");
var gutil = require("gulp-util");
var request = require("request");
var pretty = require("pretty-hrtime");
var merge = require("merge");
var col = gutil.colors;
var log = gutil.log;
var Error = gutil.PluginError;

function canonicaliseUrls(urls) {
  urls = Array.isArray(urls) ? urls : [urls];
  return urls.map(function(url, i) {
    return typeof url === 'object' ? url : {
      url: url,
      file: url.split('/').pop(),
    };
  });
}

function getFile(urlObj, options) {
  var file = new gutil.File({
    path: urlObj.file,
    contents: stream.PassThrough()
  });

  // Avoids "Unhandled stream error in pipe" messages.
  // gulp will still fail the containing task if there is
  // an error downloading
  file.contents.on('error', function() {});

  // Request errors passed to file contents
  function emitError(e) {
    errored = true;
    file.contents.emit('error', new Error('gulp-download-stream', e));
  }

  // Request pipes to file contents
  var start = process.hrtime();
  var errored = false;
  log('Downloading', col.magenta(urlObj.url) + '...');
  request(merge({
    url: urlObj.url,
    encoding: null
  }, options))
    .on('error', function(e) {
      emitError(e);
    })
    .on('response', function(response) {
      if (response.statusCode >= 400) {
        emitError(col.magenta(response.statusCode) + ' returned from ' + col.magenta(urlObj.url));
      }
    })
    .on('end', function(e) {
      if (!errored) {
        var end = process.hrtime(start);
        log('Downloaded', col.magenta(urlObj.url), 'after', col.magenta(pretty(end)));
      }
    })
    .pipe(file.contents);

  return file;
}

module.exports = function(urls, options) {
  var urlObjs = canonicaliseUrls(urls);
  options = options || {};

  var urlIndex = 0;
  var fileStream = stream.Readable({
    objectMode: true
  });
  fileStream._read = function(size) {
    var i = 0;

    var iCurrent = i;
    var urlIndexCurrent = urlIndex;
    var more = true;
    while (urlIndex < urlObjs.length && i < size && more) {
      more = this.push(getFile(urlObjs[urlIndex], options));

      ++i;
      ++urlIndex;
    }

    if (urlIndex === urlObjs.length) {
      this.push(null);
    }
  };
  return fileStream;
};

