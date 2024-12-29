import { PassThrough, Readable } from 'stream';
import request from 'request';
import pretty from 'pretty-hrtime';
import merge from 'merge';
import Vinyl from 'vinyl';
import col from 'ansi-colors';
import log from 'fancy-log';
import PluginError from 'plugin-error';

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
  const file = new Vinyl({
    path: urlObj.file,
    contents: new PassThrough()
  });

  // Request errors passed to file contents
  function emitError(e) {
    file.contents.emit('error', new PluginError('gulp-download-stream', e));
  }

  // Request pipes to file contents
  const start = process.hrtime();
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
      const end = process.hrtime(start);
      log('Downloaded', col.magenta(urlObj.url), 'after', col.magenta(pretty(end)));
    })
    .pipe(file.contents);

  return file;
}

export default function(urls, options) {
  const urlObjs = canonicaliseUrls(urls);
  options = options || {};

  let urlIndex = 0;
  return new Readable({
    objectMode: true,
    read: function(size) {
      let i = 0;

      let more = true;
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
}
