'use strict';

var stream = require('stream');
var request = require('request');
var pretty = require('pretty-hrtime');
var merge = require('merge');
var Vinyl = require('vinyl');
var col = require('ansi-colors');
var log = require('fancy-log');
var Error = require('plugin-error');

function canonicaliseUrls(urls) {
  urls = Array.isArray(urls) ? urls : [urls];
  return urls.map(function(url) {
    return typeof url === 'object' ? url : {
      url: url,
      file: url.split('/').pop(),
    };
  });
}

function getFile(urlObj, options) {
  var file = new Vinyl({
    path: urlObj.file,
    contents: stream.PassThrough()
  });

  // Request errors passed to file contents
  function emitError(e) {
    file.contents.emit('error', new Error('gulp-download-stream', e));
  }

  // Request pipes to file contents
  var start = process.hrtime();
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
    .on('end', function() {
      var end = process.hrtime(start);
      log('Downloaded', col.magenta(urlObj.url), 'after', col.magenta(pretty(end)));
    })
    .pipe(file.contents);

  return file;
}

module.exports = function(urls, options) {
  var urlObjs = canonicaliseUrls(urls);
  options = options || {};

  var urlIndex = 0;
  return stream.Readable({
    objectMode: true,
    read: function(size) {
      var i = 0;

      var more = true;
      while (urlIndex < urlObjs.length && i < size && more) {
        more = this.push(getFile(urlObjs[urlIndex], options));

        ++i;
        ++urlIndex;
      }

      if (urlIndex === urlObjs.length) {
        this.push(null);
      }
    }
  });
};

