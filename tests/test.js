'use strict';

var chai = require('chai');

var describe = require('mocha').describe;
var it = require('mocha').it;
var expect = chai.expect;

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var gutil = require('gulp-util');
var through = require('through2');
var stream = require('stream');
var dummy = 'http://dummy.com/file.txt';

describe('gulp-download-stream', function() {
  var download, mockUtil, mockRequest, target, mockery;

  beforeEach(function() {
    mockery = require('mockery');
    mockery.enable({
      warnOnUnregistered: false
    });
    mockery.registerMock('request', function(options) {
      return mockRequest(options);
    });
    sinon.stub(gutil, 'log', function() {});
    download = require('..', true);
  });

  it('returns a readable stream', function() {
    var isReadable = require('isstream').isReadable;
    var fileStream = download(dummy);
    expect(isReadable(fileStream)).to.be.true;
  });

  it('passes a single URL to request', function(done) {
    var source = stream.Readable();
    source._read = function() {
      this.push(null);
    };

    mockRequest = sinon.stub();
    mockRequest.returns(source);

    download(dummy)
      .on('end', function() {
         expect(mockRequest).to.have.been.calledWith({
           url: dummy,
           encoding: null
         });
         done();
      })
      .pipe(through({objectMode:true}))
  });

  afterEach(function() {
    gutil.log.restore();
    mockery.deregisterAll();
    mockery.disable();
  });
});
