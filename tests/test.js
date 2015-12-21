'use strict';

var describe = require('mocha').describe;
var it = require('mocha').it;
var expect = require('chai').expect;

var dummy = 'http://dummy.com/file.txt';

describe('gulp-download-stream', function() {
  var download, mockery;

  beforeEach(function() {
    mockery = require('mockery');
    mockery.enable({
      warnOnUnregistered: false
    });
    mockery.registerMock('request', function() {

    });
    download = require('..', true);
  });

  it('returns a readable stream', function() {
    var isReadable = require('isstream').isReadable;

    var fileStream = download(dummy);
    expect(isReadable(fileStream)).to.be.true;
  });

  afterEach(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
});
