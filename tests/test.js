/*eslint-env mocha */

'use strict';

var chai = require('chai');

var describe = require('mocha').describe;
var it = require('mocha').it;
var expect = chai.expect;

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var stream = require('stream');
var stripAnsi = require('strip-ansi');

var dummy1 = 'http://dummy.com/file1.txt';
var dummy2 = 'http://dummy.com/file2.txt';
var dummyContent = 'This is the content of the request';

describe('gulp-download-stream', function() {
  var download, mockRequest, source, mockery;

  beforeEach(function() {
    mockery = require('mockery');
    mockery.enable({
      warnOnUnregistered: false
    });

    mockRequest = sinon.spy(function() {
      source = stream.Readable({
        read: function() {}
      });
      return source;
    });

    mockery.registerMock('request', function(options) {
      return mockRequest(options);
    });

    mockery.registerMock('fancy-log', function() {
      return function() {};
    });

    download = require('..');
  });

  afterEach(function() {
    mockery.deregisterAll();
    mockery.disable();
    mockRequest = null;
    source = null;
    download = null;
  });

  it('returns a readable stream', function() {
    var isReadable = require('isstream').isReadable;
    var fileStream = download(dummy1);
    expect(isReadable(fileStream)).to.be.true;
  });

  it('makes (readable highWaterMark + 1) requests before writing', function(done) {
    var stream = require('stream');
    var files = Array(18).fill(dummy1);

    var started = false;
    var writable = stream.Writable({
      objectMode: true,
      write: function(chunk, end, cb) {
        if (!started) {
          expect(mockRequest).to.have.callCount(17);
          started = true;
          done();
        }

        // So all stream will be processed to avoid any memory leaks
        cb();
      }
    });

    download(files)
      .pipe(writable);
  });

  it('passes a single URL from a string to request', function(done) {
    download(dummy1)
      .on('end', function() {
        expect(mockRequest).to.have.been.calledWith({
          encoding: null,
          url: dummy1
        });
        done();
      })
      .pipe(stream.PassThrough({objectMode: true}));
  });

  it('passes a single URL from an object to request', function(done) {
    download({
      url: dummy1
    })
      .on('end', function() {
        expect(mockRequest).to.have.been.calledWith({
          url: dummy1,
          encoding: null
        });
        done();
      })
      .pipe(stream.PassThrough({objectMode: true}));
  });

  it('passes an array of strings to request', function(done) {
    download([dummy1, dummy2])
      .on('end', function() {
        expect(mockRequest).to.have.been.calledWith({
          url: dummy1,
          encoding: null
        });
        expect(mockRequest).to.have.been.calledWith({
          url: dummy2,
          encoding: null
        });
        done();
      })
      .pipe(stream.PassThrough({objectMode: true}));
  });

  it('passes the content of the response to the Vinyl file', function(done) {
    var downloadStream = download({
      url: dummy1
    });

    downloadStream.pipe(stream.PassThrough({
      objectMode: true,
      transform: function(chunk) {
        source._read = function() {
          this.emit('response', {statusCode: 200});
          this.push(dummyContent);
          this.push(null);
        };

        chunk.contents.pipe(stream.Transform({
          transform: function(chunk) {
            expect(chunk.toString()).to.equal(dummyContent);
            done();
          }
        }));
      }
    }));
  });

  it('passes a request error to the Vinyl contents stream', function(done) {
    var message = 'This is the error';

    download({
      url: dummy1
    })
      .pipe(stream.Transform({
        objectMode: true,
        transform: function(chunk) {
          source._read = function() {
            this.emit('error', new Error(message));
          };

          chunk.contents.on('error', function(error) {
            expect(error.message).to.equal(message);
            done();
          });
        }
      }));
  });

  it('passes a 400 response as a Vinyl contents stream error', function(done) {
    download({
      url: dummy1
    })
      .pipe(stream.Transform({
        objectMode: true,
        transform: function(chunk) {
          source._read = function() {
            this.emit('response', {statusCode: 400});
          };

          chunk.contents.on('error', function(error) {
            expect(stripAnsi(error.message)).to.equal('400 returned from ' + dummy1);
            done();
          });
        }
      }));
  });

});
